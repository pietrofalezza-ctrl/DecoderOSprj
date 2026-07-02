## Obiettivo

La roadmap pubblica visibile sul sito (`/open-source`), nel `README.md` e la nota nel `/manifesto` è ferma alle prime fasi. Nel frattempo abbiamo spedito: repo chat, persistenza multi-sessione, Knowledge Hub + Knowledge Engine, cluster SEO EU/India/Sri Lanka, admin console (consensi, audit maintenance), 2FA email sul reset password, PWA + install, cleanup endpoint hardening, MCP in fase di progettazione. Va allineata.

## Cosa aggiornare

### 1. `README.md` — sezione `## Roadmap`
Sostituisco le 4 righe attuali con una vista a fasi che riflette lo shipped e la pipeline:

- ✅ **Phase 1–3** — Foundation, BYOK vault, local AI (Ollama / LM Studio), GitHub public import, Static / Malware / AI-origin, admin surface, export Markdown.
- ✅ **Phase 4** — Repo chat folder-scoped, persistenza analisi tra sessioni, timeline storia, single-file upload trasparente, 20+ linguaggi statici.
- ✅ **Phase 5** — Knowledge Hub (32 entries) + Knowledge Engine (opportunities, editor admin, GitHub webhook, translation tools), sitemap dinamico server-side, cluster SEO EU / Italia Nord / India / Sri Lanka con hreflang (EN/IT/ZH/HI/TA).
- ✅ **Phase 6** — Sicurezza & compliance: encryption AES-256-GCM per BYOK, RLS su tutte le tabelle, cleanup endpoint dietro `CLEANUP_CRON_SECRET`, maintenance audit log, reset password con 2FA via email, PWA installabile, admin dashboard consensi.
- ⏳ **Phase 7 (in corso)** — GitHub OAuth login + import repo private con PAT utente, suggested inline comments con diff export, analisi architetturali / dipendenze / performance più profonde, VS Code companion.
- 🧭 **Phase 8 (progettazione)** — Agent / plugin integration via **MCP (Model Context Protocol)** per esporre gli strumenti Decoder ad agenti esterni (es. "Hades"), community rule library condivisa, provenance block-level (Copilot / Cursor / ChatGPT).

### 2. Pagina pubblica `/open-source` (i18n `openSource.roadmap.r1…r5`)
Il componente in `src/routes/open-source.tsx` itera cinque chiavi. Riscriverle in EN / IT / ZH così che la roadmap visibile sul sito rispecchi le nuove priorità (le vecchie sono per lo più fatte):

- `r1` → "GitHub OAuth + import repo private con PAT utente" (in corso).
- `r2` → "Companion VS Code / JetBrains che invoca Decoder in review PR" (in corso).
- `r3` → "Analisi architetturali, dipendenze, performance e manutenibilità più profonde" (prossima).
- `r4` → "Suggested inline comments diff-aware esportabili come PR review" (prossima).
- `r5` → "MCP server + community rule library condivisa per code-smell AI e provenance block-level" (progettazione).

Aggiungo prima della lista un breve paragrafo (`openSource.roadmapShipped`) che elenca in una riga cosa è già live: *"Già live: Knowledge Hub + Engine, repo chat, persistenza sessioni, PWA installabile, cluster SEO EU/India, 2FA reset, cleanup hardening."*

### 3. `manifesto.roadmapBody` (EN/IT/ZH)
Aggiorno il testo per rimandare alla nuova sezione `/open-source#roadmap` e al README, chiarendo che la roadmap è fasata e senza scadenze contrattuali.

## File toccati

- `README.md` — sezione Roadmap riscritta (Phase 1–8).
- `src/i18n/locales/{en,it,zh}/common.json` — `openSource.roadmap.r1…r5`, aggiunta `openSource.roadmapShipped`, aggiornamento `manifesto.roadmapBody`.
- `src/routes/open-source.tsx` — render della nuova riga "Già live" sopra la lista roadmap (piccolo tweak JSX, nessuna logica).
- `src/i18n/locales/{hi,ta}/common.json` — solo se contengono già chiavi roadmap; altrimenti restano come sono (fallback all'EN).

## Fuori scope

- Nessuna modifica a business logic, DB, edge functions, sicurezza.
- Nessuna nuova rotta o pagina.
- Nessuna modifica a sitemap (le voci roadmap non sono URL).
