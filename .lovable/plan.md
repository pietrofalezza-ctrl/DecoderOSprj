# Phase 6 — Compliance, SEO & Security

## 1. Risposte alle tue domande (riassunto, andrà anche in /docs)

**Linguaggi supportati** (estratti da `src/lib/zip.server.ts`):
TypeScript/JavaScript (ts, tsx, js, jsx, mjs, cjs), Python, Ruby, Go, Rust, Java, Kotlin, Swift, C/C++, C#, PHP, HTML/CSS/SCSS/Less, Vue, Svelte, Astro, SQL, GraphQL, Lua, Perl, Elixir, Erlang, Clojure, Dart, Elm, F#, Scala, Groovy, Terraform, Dockerfile, Makefile, R, Julia, Nim, Zig, JSON/YAML/TOML/XML/Markdown, shell. Limiti attuali: 1 MB/file, 2000 file/archivio, salta `node_modules`, `.git`, `dist`, `venv`, ecc.

**Upload**: sì, archivi `.zip` via la pagina Repository (oppure import da GitHub).

**Chiave API per i test**: non serve generartene una. De-coder usa di default il **Lovable AI Gateway** (chiave `LOVABLE_API_KEY` già provisionata lato server). Al login potrai semplicemente caricare uno zip e premere "Spiega" senza configurare nulla. Le chiavi utente (OpenAI/Anthropic/locale) restano opzionali per chi vuole usare il proprio provider.

## 2. Modifiche app

### A. Provider AI di default = Lovable AI
- In `src/routes/_authenticated/settings.tsx` e nelle funzioni `explain.functions.ts`/`analysis.functions.ts`, se l'utente non ha credenziali proprie né endpoint locale, fallback automatico al gateway Lovable (`https://ai.gateway.lovable.dev/v1/chat/completions`, modello `google/gemini-3-flash-preview`).
- Banner "Pronto per testare — nessuna chiave richiesta" nella dashboard al primo login.
- Aggiorna `/docs` con la lista linguaggi + istruzioni upload zip.

### B. T&C estesi (`src/routes/terms.tsx` + i18n it/en/zh)
Aggiungi sezioni dopo la licenza MIT esistente:

1. **Dati raccolti** (lista esplicita):
   - Account: email, display_name, ruolo, timestamp (Supabase Auth).
   - Contenuti: file caricati (storage privato `repositories` con RLS), metadati file (path, sha256, lingua, dimensione), spiegazioni AI generate.
   - Credenziali AI cifrate (AES-GCM con `DECODER_ENCRYPTION_KEY`).
   - Nessun tracking di terze parti, nessun analytics pubblicitario.

2. **GDPR**:
   - Base giuridica: esecuzione del servizio (art. 6.1.b) + consenso per AI provider esterni.
   - Diritti: accesso, rettifica, cancellazione, portabilità, opposizione → pulsante "Export dati" (JSON) + "Elimina account" in Settings.
   - Trasferimenti extra-UE: solo se l'utente sceglie provider USA (OpenAI/Anthropic) o Lovable AI; specificato in chiaro.
   - DPO/contatto: placeholder email da fornire.
   - Retention: file e spiegazioni conservati finché l'utente non li elimina; account cancellabile in self-service.

3. **EU AI Act (Reg. 2024/1689)**:
   - De-coder è un sistema GPAI downstream a **rischio limitato** (assistenza alla comprensione del codice, nessuna decisione automatizzata su persone).
   - Trasparenza: l'output è generato da IA, può contenere errori, va verificato (art. 50).
   - Nessun uso vietato (art. 5): no biometria, no social scoring, no manipolazione.
   - Logging delle interazioni AI lato utente (cronologia spiegazioni già in `explanations`).
   - Disclaimer "AI generated content" già presente sulle spiegazioni — rafforzato.

### C. Self-service privacy
- Pulsante **"Esporta i miei dati"** in Settings → serverFn che dump-a profilo + progetti + repos + files (metadati) + explanations in un JSON.
- Pulsante **"Elimina account"** → serverFn che chiama `auth.admin.deleteUser` + cascade su tabelle utente.

## 3. SEO

- Aggiungi `head()` con title/description/og unici a: `/`, `/manifesto`, `/terms`, `/docs`, `/auth`.
- `robots.txt` e `sitemap.xml` statici in `public/`.
- JSON-LD `SoftwareApplication` sulla home.
- Tag canonical, lang attribute sincronizzato con i18n.
- og:image generata per home + manifesto.
- Esegui `seo_chat--trigger_scan` a fine fase.

## 4. Sicurezza

### Audit
- `supabase--linter` + `security--run_security_scan`.
- Verifica RLS su tutte le tabelle (già presenti, da ri-confermare).
- Verifica che `repositories` bucket sia privato (lo è) e accesso solo via signed URL.

### Hardening
- **Rate limiting** su serverFn `explain` e `analyze` (max N richieste/min per utente) per prevenire abuso del gateway AI.
- **Validazione input**: Zod schema su tutte le serverFn (path traversal sui path dei file, limite size zip già 1MB/file ma aggiungere cap totale archivio ~50MB).
- **XSS**: `CodeViewer` usa highlight.js → confermare che renda testo, non HTML.
- **Markdown spiegazioni**: se renderizzato, sanitize con `rehype-sanitize`.
- **CSP headers** via `__root.tsx` `head()`: `default-src 'self'; connect-src 'self' https://*.supabase.co https://ai.gateway.lovable.dev; img-src 'self' data:;`.
- **Auth**: confermo `password_hibp_enabled` attivo (Lovable Cloud auth settings).
- **Secrets**: nessuna chiave esposta lato client (verificato: solo `VITE_SUPABASE_*` publishable).
- **Cifratura at-rest** chiavi AI utente: già AES-GCM con `DECODER_ENCRYPTION_KEY` — confermare.
- **Headers HTTP** (X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin) via root meta.

### Test
- Curl smoke su tutte le route (atteso 200).
- Tentativo upload file >1MB → atteso rifiuto.
- Tentativo path traversal `../` → atteso sanitize.
- Tentativo accesso repo altro utente → atteso 403 (RLS).
- Tentativo lettura `user_ai_credentials` (no SELECT policy) → atteso vuoto.

## 5. Out of scope (Fase 7)
Penetration test esterno, certificazione ISO/SOC2, GDPR DPIA formale, registrazione come provider GPAI presso AI Office (richiede attività >soglia).

## Deliverable
- T&C aggiornati IT/EN/ZH con GDPR + AI Act.
- Lovable AI come default, banner onboarding.
- Self-service export + delete account.
- SEO meta su tutte le route + sitemap/robots.
- Hardening + report di audit nel chat.

Vuoi che proceda con tutto o preferisci che spezzi in step (es. prima T&C+self-service, poi SEO, poi security)?
