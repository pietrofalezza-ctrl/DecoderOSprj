## Cosa significa il finding

L'endpoint `/api/public/hooks/cleanup-stale-repositories` (chiamato ogni notte da pg_cron per cancellare repository più vecchie di 60 giorni e senza attività recente) si "autentica" confrontando l'header `apikey` con la **anon key di Supabase**. Quella chiave è pubblica per design: è dentro il bundle JS del browser (`VITE_SUPABASE_PUBLISHABLE_KEY`). Chiunque apra il DevTools può copiarla e chiamare:

```
POST https://decoderead.dev/api/public/hooks/cleanup-stale-repositories
apikey: <anon key>
```

…facendo partire la cancellazione admin (storage + righe DB) su **tutti** i repository degli utenti. È un endpoint distruttivo protetto da una chiave pubblica → severità error.

## Fix

1. **Nuovo secret** `CLEANUP_CRON_SECRET` (32+ char random, **senza** prefisso `VITE_`, mai esposto al browser) generato via `generate_secret`.
2. **`src/routes/api/public/hooks/cleanup-stale-repositories.ts`**: sostituire il check sull'header `apikey` con un check `Authorization: Bearer ${process.env.CLEANUP_CRON_SECRET}`, in confronto timing-safe. Risposta 401 generica.
3. **pg_cron job `cleanup-stale-repositories`**: unschedule + reschedule con header `Authorization: Bearer <secret>` invece di `apikey`. SQL inserito via `supabase--insert` (non migration, contiene il secret).
4. Marcare il finding `cleanup_anon_key_auth` come fixed.

## Bug separato — chiave OpenRouter non più visibile per fajov59464@fixscal.com

Verificato in DB: la chiave c'è (provider `openrouter`, hint `sk-o…624a`, creata 2026-06-07). Non è stata persa.

Causa: la vista `user_ai_credentials_safe` è una vista normale, quindi quando il client autenticato la legge Postgres controlla i permessi sulla **tabella base** `user_ai_credentials`. Nel giro di hardening precedente abbiamo revocato `SELECT` su quella tabella ai ruoli `authenticated`/`anon`, quindi la query della UI ora restituisce 0 righe (o permission denied) e il pannello Settings sembra "vuoto".

Fix: in `src/lib/credentials.functions.ts` cambiare `listProviders` per usare `supabaseAdmin` filtrando per `owner_id = context.userId` (come già fanno `saveProviderKey` / `deleteProviderKey`), proiettando solo `provider, key_hint, updated_at`. Nessun cambio di schema, nessuna riconcessione di `SELECT` sulla tabella base. Stesso modello per `account.functions.ts` se necessario per coerenza.

Risultato: l'utente rivedrà la sua chiave OpenRouter elencata in Settings → Providers senza riconfigurarla.
