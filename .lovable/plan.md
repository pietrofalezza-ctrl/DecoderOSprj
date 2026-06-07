## Obiettivo
Eliminare la parola "Lovable" da tutto ciò che l'utente finale può leggere (UI, copy, SEO, messaggi d'errore, JSON-LD), rinominando il provider gestito in **"AI gestita" / "Managed AI" / "托管 AI"**. Lasciare invariati solo gli identificatori tecnici interni indispensabili.

## Cosa cambia (user-facing)

### 1. Provider gestito rinominato in tutte le lingue
File: `src/i18n/locales/{it,en,zh}/common.json`
- `providers.lovable` → "AI gestita (predefinita)" / "Managed AI (default)" / "托管 AI（默认）"
- `settings.lovableSection`, `lovableIntro`, `lovableBadge` → testo senza "Lovable"
- `analysis.defaultTitle`, `analysis.needsCloudLong` → "AI gestita" invece di "Lovable AI"
- `legal.*`, `privacy.*`: sostituire "Lovable AI", "Lovable Cloud", "policy di Lovable", "ai.gateway.lovable.dev" con formulazioni neutre ("provider gestito", "infrastruttura cloud del backend", "policy del gateway gestito")
- `whyNow1Body` e simili: rimuovere "Lovable" dall'elenco "Copilot, Cursor, Lovable, Claude Code" → "Copilot, Cursor, Claude Code"
- `roadmapBody`: "`.lovable/plan.md`" → "roadmap interna del repository"
- `adminBody`: "SQL editor di Lovable Cloud" → "SQL editor del backend"

Le chiavi di i18n restano (`lovableSection`, ecc.) per non rompere riferimenti; cambia solo il valore tradotto.

### 2. Copy SEO / meta tag
File: `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/docs.how-to-review-ai-code.tsx`
- Description: rimuovere "Lovable" dagli elenchi ("Copilot, Cursor, Claude Code and your team")
- Body della pagina docs: stesso intervento sul paragrafo "AI coding assistants — Copilot, Cursor, Lovable, Claude Code…"

### 3. Messaggi d'errore visibili
- `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`: "Connect Supabase in Lovable Cloud." → "Connect the backend."
- `src/lib/ai-providers.server.ts`: label `failSafe("Lovable AI", …)` → `failSafe("Managed AI", …)` (compare nei toast d'errore)

### 4. Prompt di analisi
- `src/lib/analysis-prompt.ts`: rimuovere "Lovable" dalla lista di esempi di AI assistants nel prompt → "Copilot, Cursor, Claude, ChatGPT, etc."

## Cosa NON cambia (motivazione tecnica)

| Elemento | Perché resta |
|---|---|
| `LOVABLE_API_KEY`, `ALLOW_HOSTED_LOVABLE_AI` (env) | Nome del secret gestito dalla piattaforma; rinominarlo rompe l'auth verso il gateway. |
| Stringa interna `provider: "lovable"` (enum) | Identificatore di colonna DB (`user_ai_credentials.provider`), già persistito. Mai mostrato all'utente. |
| `src/integrations/lovable/*`, import `cloud-auth-js` | SDK auto-generato dalla piattaforma cloud, usato per il login OAuth Google. |
| URL `ai.gateway.lovable.dev` nel `fetch()` | Endpoint reale del gateway; cambiarlo rompe le chiamate. |
| Path `.lovable/plan.md`, file `.lovable/project.json` | File reali su disco gestiti dalla piattaforma. |
| Dominio `decoderdev.lovable.app` nei canonical/og:url | È il dominio di hosting reale del sito finché non si configura un dominio custom. Cambiarlo manda fuori sync gli URL canonical. *(Posso comunque rimuoverlo se preferisci — vedi nota sotto.)* |
| `LovableQuotaError`, costanti `LOVABLE_DAILY_LIMIT` (codice) | Identificatori interni; i messaggi mostrati all'utente non contengono già la parola "Lovable". |

## Nota / decisione opzionale
Il dominio `decoderdev.lovable.app` appare nei tag SEO. È l'URL reale di pubblicazione: rimuoverlo senza un dominio custom configurato peggiora il SEO (canonical sbagliati, Open Graph rotti). Procedo lasciandolo, salvo tua indicazione contraria — se vuoi lo rimuovo nello stesso passaggio sostituendo con un placeholder `https://decoder.app` o togliendo i canonical.

## File modificati
- `src/i18n/locales/it/common.json`
- `src/i18n/locales/en/common.json`
- `src/i18n/locales/zh/common.json`
- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/routes/docs.how-to-review-ai-code.tsx`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/auth-middleware.ts`
- `src/lib/ai-providers.server.ts`
- `src/lib/analysis-prompt.ts`

Nessuna modifica a schema DB, migrazioni, env, o logica di business.
