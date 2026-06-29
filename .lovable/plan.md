# Possono le chiavi essere rubate dal database?

## Risposta breve
**No, non in chiaro.** Le BYOK API key sono cifrate prima di toccare il database, e nessuno (né tu, né un altro utente, né chi leggesse un dump del DB) può decifrarle senza il segreto server `DECODER_ENCRYPTION_KEY` che vive solo nell'ambiente delle server functions.

## Come sono protette oggi

1. **Cifratura at-rest** — `src/lib/crypto.server.ts` usa **AES-256-GCM** con IV random a 12 byte e auth tag. La chiave a 32 byte è derivata via SHA-256 da `DECODER_ENCRYPTION_KEY` (secret Lovable Cloud, mai esposto al client né al bundle browser).
2. **Cifratura prima dell'insert** — `credentials.functions.ts` cifra `api_key` in una server function; il plaintext non lascia mai il server.
3. **RLS attiva** su `user_ai_credentials` con policy `auth.uid() = owner_id` per SELECT/INSERT/UPDATE/DELETE: un utente non può vedere righe di altri utenti.
4. **Service role isolato** — `SUPABASE_SERVICE_ROLE_KEY` server-only, mai nel bundle.
5. **Vista "safe"** `user_ai_credentials_safe` che espone solo `provider`, `key_hint`, `updated_at` (no `encrypted_key`).
6. **Cloud key sicure** — `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DECODER_ENCRYPTION_KEY` solo in `process.env` server, accessibili solo dentro `.handler()` di server functions.

## Falla residua trovata (media gravità)

Controllando lo stato reale del DB:

```
has_table_privilege('authenticated','user_ai_credentials','SELECT') = TRUE
```

La migration del 7 giugno aveva tolto `SELECT` ad `authenticated` (per forzare l'uso della vista safe), ma una migration successiva del 29 giugno ha **ri-aggiunto la policy SELECT** per sbloccare il salvataggio della key, e il GRANT è tornato attivo. Risultato: un utente autenticato, via Data API, può leggere la propria colonna `encrypted_key` (solo la sua, RLS regge).

**Impatto reale**: basso. L'utente vedrebbe solo ciphertext della *propria* key, che già conosce in chiaro (l'ha inserita lui). Nessun altro utente è esposto. Ma viola il principio "il ciphertext non esce mai dal server" → se domani la encryption key venisse compromessa e qualcuno avesse anche un dump cliente, sarebbe banale decifrare.

## Vettori che ho verificato e che sono OK

- Cross-tenant leak via RLS → bloccato (policy `auth.uid() = owner_id`).
- SQL injection → tutte le query usano Supabase client / parametri.
- Bundle leak del service key → no, `client.server.ts` è import-protected.
- Endpoint server pubblici senza auth → tutte le funzioni sensibili usano `requireSupabaseAuth`; webhook (`/api/public/process-email-queue`) verificano il caller.
- Storage `repositories` → bucket privato, accessi via signed URL nelle server functions.
- Admin reads su progetti utente → non implementate (nessun admin può vedere repo altrui).

## Fix proposto (1 migration)

```sql
-- Revoke ridondante: la safe view è il canale di lettura
REVOKE SELECT ON public.user_ai_credentials FROM authenticated;
DROP POLICY IF EXISTS "own creds select" ON public.user_ai_credentials;

-- Mantieni INSERT/UPDATE/DELETE (servono al salvataggio)
-- Il salvataggio funziona perché la server function usa service_role o non legge back la riga
```

E adeguo `credentials.functions.ts` perché l'`upsert` non faccia `.select()` di ritorno (oppure passi via `supabaseAdmin` lato server, dato che siamo già dentro una server function autenticata che ha già validato `owner_id`).

## Cosa fare lato operativo (consigli, non codice)

- **Ruota** `DECODER_ENCRYPTION_KEY` se sospetti compromessi (richiede re-encrypt di tutte le righe — posso scriverti la routine se vuoi).
- Tieni `SUPABASE_SERVICE_ROLE_KEY` e `DECODER_ENCRYPTION_KEY` non visibili nei log.
- Considera in futuro: spostare l'encryption key in un KMS esterno (AWS KMS / GCP KMS) invece che in una env var.

## Rating sicurezza attuale: **A− (8.5/10)**
Dopo il fix sopra: **A (9/10)**. Per arrivare ad A+ servirebbe KMS esterno + audit log su lettura credentials.

Confermi che procedo col fix (revoke SELECT + adeguamento upsert)?
