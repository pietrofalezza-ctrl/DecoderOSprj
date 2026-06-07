## Obiettivo

Introdurre un flusso obbligatorio di acknowledgement Terms & BYOK: modale bloccante prima di salvare una chiave API o di lanciare una qualunque chiamata cloud-based AI, con persistenza per utente e versione dei termini, ri-prompt automatico al cambio versione, e pagina settings di review.

---

## 1. Schema DB (nuova tabella `public.user_acknowledgements`)

Migrazione unica (CREATE TABLE + GRANT + RLS + POLICY).

Colonne:
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null` (riferimento logico a `auth.users`, no FK)
- `acknowledgement_type text not null` (al momento solo `'byok_cloud_ai'`, lasciato estendibile)
- `accepted_terms_version text not null`
- `accepted_at timestamptz not null default now()`
- `accepted_language text not null` (`it` | `en` | `zh` o altro che arrivi dall'header)
- `ip_address inet null`
- `user_agent text null`
- Unique `(user_id, acknowledgement_type, accepted_terms_version)` — un record per versione.
- Indice su `(user_id, acknowledgement_type)` per la query "ha già accettato l'ultima versione?".

RLS:
- Enable RLS.
- Policy `SELECT` per `authenticated` con `auth.uid() = user_id`.
- Policy `INSERT` per `authenticated` con `auth.uid() = user_id`.
- Nessuna `UPDATE` / `DELETE` lato utente (immutabile, è una prova di consenso).
- GRANT `SELECT, INSERT` a `authenticated`, GRANT `ALL` a `service_role`.

Costante applicativa `BYOK_TERMS_VERSION = "2026-06-07"` (data ISO; bumped manualmente quando si cambia il testo dell'avviso). Vive in `src/lib/byok-acknowledgement.ts` insieme al tipo `AcknowledgementType`.

---

## 2. Server functions (`src/lib/byok-acknowledgement.functions.ts`)

Tutte protette da `requireSupabaseAuth`.

- `getCurrentByokAck()` → ritorna `{ accepted: boolean, record?: { acceptedAt, version, language } }`. Logica: query `user_acknowledgements` per `user_id = ctx.userId`, `type = 'byok_cloud_ai'`, `version = BYOK_TERMS_VERSION`, ordine `accepted_at desc`, limit 1. Letta da modale e settings.
- `recordByokAck({ language })` → input validato (`language` in `['it','en','zh']`; fallback `en`). Handler:
  - Legge IP da `x-forwarded-for` o `cf-connecting-ip` via `getRequestHeader` (best effort, può essere null).
  - Legge `user-agent` (truncato a 512 char).
  - `INSERT ... ON CONFLICT (user_id, acknowledgement_type, accepted_terms_version) DO NOTHING`.
  - Ritorna `{ ok: true, version, acceptedAt }`.
- `listByokAckHistory()` → ritorna l'elenco di tutte le accettazioni dell'utente (per la pagina settings; mostra storia versioni).

**Server-side enforcement (no bypass via API):** in `src/lib/hosted-ai-guard.server.ts` aggiungere helper `assertByokAckAccepted(userId)` che verifica la riga `(user_id, 'byok_cloud_ai', BYOK_TERMS_VERSION)` esiste. Chiamare l'helper all'inizio di:
- `credentials.functions.ts` → `upsertUserCredential` (salvataggio chiave BYOK).
- `analysis.functions.ts` → `analyzeFile`, `analyzeFolderAggregate` (solo se provider cloud, locale escluso).
- `explain.functions.ts` → `explainFile` (solo provider cloud).
- `folder-analysis.functions.ts` → `analyzeFolder*` (cloud).
- `fix.functions.ts` → `proposeFix` (cloud).

Se manca l'acknowledgement, throw `Error("byok_ack_required")` con `setResponseStatus(403)`. Il client intercetta questo codice ed apre la modale (vedi §3).

Le chiamate **local provider** (Ollama / LM Studio) **non** richiedono ack: il codice non lascia la macchina utente. La modale resta comunque consigliata e i checkbox la coprono semanticamente, ma l'enforcement server-side scatta solo per provider cloud (logica già presente nei guard esistenti).

---

## 3. UI — componente modale `<ByokAcknowledgementDialog />`

Nuovo file `src/components/ByokAcknowledgementDialog.tsx`. Basato su `@/components/ui/dialog` shadcn.

Layout:
- Titolo i18n `byokAck.title`:
  - IT: "Avviso importante su BYOK e provider AI"
  - EN: "Important BYOK and AI Provider Notice"
  - ZH: "关于 BYOK 和 AI 服务提供商的重要提示"
- Corpo: 8 paragrafi numerati corrispondenti ai punti del requisito (chiavi `byokAck.body.p1`…`p8`).
- Sezione `Data flow` espandibile (`<Collapsible>` shadcn) — link "View data flow" che mostra:
  - **Local mode**: `User machine → local model → Decoder UI`
  - **Cloud BYOK mode**: `User code selection → Decoder backend → selected AI provider → Decoder UI`
  - Rappresentazione testuale + piccolo diagramma con `lucide-react` icone (`Laptop`, `Cloud`, `Server`, `ArrowRight`).
- Link inline (tutti `target="_blank"` se esterni, `<Link>` se interni):
  - Terms and Conditions → `/terms`
  - Privacy Policy → `/terms` (la app usa una sola pagina; ancora `#data` o `#gdpr`). Verificare e linkare allo specifico anchor `#gdpr`.
  - Provider documentation → `/docs` (esiste già `src/routes/docs.tsx`).
- 5 checkbox (`@/components/ui/checkbox`), tutti **default false**, ognuno con label i18n `byokAck.checks.cost / providers / authorized / review / terms`.
- Pulsante "Continua" (`byokAck.cta`) disabilitato finché tutti e 5 i checkbox non sono `true`. Pulsante secondario "Annulla" chiude la modale senza salvare.
- Footer piccolo: "Versione termini: {BYOK_TERMS_VERSION}".

Stato interno: `useState<Record<5checks, boolean>>`. On submit: chiama `recordByokAck({ language: i18n.language })` via `useServerFn` + `useMutation` di TanStack Query, invalida la query `['byok-ack']`, chiude la modale, esegue `onAccepted?.()` callback.

Accessibilità: focus trap dal Dialog shadcn, `aria-required` sui checkbox, descrizioni esplicite. Niente `defaultChecked`. Niente pre-spunte.

---

## 4. Gating client-side

Hook nuovo `useByokAck()` in `src/hooks/use-byok-ack.ts`:
- Esegue `useQuery({ queryKey: ['byok-ack'], queryFn: getCurrentByokAck })`.
- Espone `{ accepted, isLoading, requireAck(onAccepted) }` dove `requireAck` apre la modale globale se non accettato, altrimenti chiama subito `onAccepted`.

Provider globale `<ByokAckProvider>` in `src/components/ByokAckProvider.tsx`, montato in `src/routes/_authenticated/route.tsx` accanto al `<Outlet />`. Espone via context la modale singleton e il metodo `openAckDialog`.

Punti di integrazione (UI):
1. **Settings → API Keys** (`src/routes/_authenticated/settings.tsx`): prima di invocare `upsertUserCredential` chiama `requireAck(() => saveKey())`. Stesso flusso per `connect provider` cards.
2. **Analisi cloud** (componenti che lanciano `analyzeFile` / `explainFile` / ecc. con provider non-locale): wrap del trigger. Se `provider === 'lovable' | 'openai' | 'anthropic' | 'gemini' | 'openrouter'` → `requireAck`. Se `provider === 'ollama' | 'lmstudio'` → salta.
3. **Fallback server**: se per qualunque motivo la chiamata arriva al server senza ack e il server risponde 403 `byok_ack_required`, il `queryClient` global error handler intercetta e apre la modale; mostra toast "Accetta prima i termini per usare i provider cloud".

---

## 5. Settings page — sezione "Acknowledgements"

In `src/routes/_authenticated/settings.tsx` aggiungere una nuova `<Card>` "Acknowledgements & consent":
- Stato corrente: "Versione termini accettata: X — il GG/MM/AAAA in {lingua}". Se non accettata: badge rosso "Acknowledgement mancante" + bottone "Apri avviso".
- Lista storica versioni accettate (`listByokAckHistory`), in piccolo.
- Sezione "Provider connessi" (riusa dati già presenti via `listUserCredentials`): per ogni provider → nome, key hint, data ultima modifica, bottone "Rimuovi". 
- Banner warning fisso sopra la lista: "Rimuovendo una chiave API tutte le future chiamate a quel provider falliranno fino a nuovo inserimento."
- Nessun campo modificabile sull'acknowledgement: read-only.

---

## 6. i18n

Aggiungere nuovo blocco `byokAck` in `src/i18n/locales/{en,it,zh}/common.json` (chiavi: `title`, `body.p1..p8`, `checks.cost/providers/authorized/review/terms`, `cta`, `cancel`, `versionLabel`, `dataFlow.toggle/local/cloud`, `links.terms/privacy/docs`, `settings.sectionTitle`, `settings.acceptedOn`, `settings.notAcceptedBadge`, `settings.history`, `settings.providersTitle`, `settings.removeKeyWarning`, `settings.removeKey`, `errors.required`).

Testi nelle 3 lingue, aderenti letterali ai punti del requisito (i 5 checkbox usano le frasi esatte fornite dall'utente).

---

## 7. File toccati / creati

Creati:
- `supabase/migrations/<timestamp>_user_acknowledgements.sql` (via tool migrazione).
- `src/lib/byok-acknowledgement.ts` (costante versione, tipi).
- `src/lib/byok-acknowledgement.functions.ts` (3 server fn).
- `src/components/ByokAcknowledgementDialog.tsx`.
- `src/components/ByokAckProvider.tsx` (context + singleton dialog).
- `src/hooks/use-byok-ack.ts`.

Modificati:
- `src/lib/hosted-ai-guard.server.ts` → aggiunge `assertByokAckAccepted`.
- `src/lib/credentials.functions.ts` → chiama `assertByokAckAccepted` in `upsertUserCredential`.
- `src/lib/analysis.functions.ts`, `src/lib/explain.functions.ts`, `src/lib/folder-analysis.functions.ts`, `src/lib/fix.functions.ts` → guard nelle handler quando provider è cloud.
- `src/routes/_authenticated/route.tsx` → monta `<ByokAckProvider>`.
- `src/routes/_authenticated/settings.tsx` → nuova sezione Acknowledgements + warning rimozione chiave.
- Componenti che lanciano analisi/explain cloud (es. `src/components/FolderAnalysisPanel.tsx`, eventuali invocazioni in `routes/_authenticated/projects.*`) → wrap con `requireAck`.
- `src/i18n/locales/{en,it,zh}/common.json` → blocco `byokAck`.

Non toccati: backend AI providers, RLS esistenti, schema delle altre tabelle, flusso auth.

---

## 8. Comportamento al cambio versione

Quando l'autore modifica il testo della modale e bumpa `BYOK_TERMS_VERSION`:
- `getCurrentByokAck` non trova un record con la nuova versione → `accepted: false`.
- Alla prossima azione gated (save key o cloud call) la modale riappare.
- I record vecchi restano in `user_acknowledgements` come storico (visibile in settings).

---

## 9. Cosa NON è in piano

- Niente integrazione Stripe / billing — il punto 2 del requisito è già rispettato dalla natura BYOK.
- Niente blocco sui provider locali (per design: il codice non lascia il device).
- Niente notifiche email al cambio versione (out-of-scope; il prompt in-app è sufficiente per un progetto personale come da T&C riqualificati).
- Niente meccanismo di revoca/cancellazione dell'ack (è una prova di consenso; cancellazione account già rimuove tutto via futura logica account-delete o richiesta GDPR).
