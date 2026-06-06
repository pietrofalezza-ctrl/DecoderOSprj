# Phase 3 — Funzionalità avanzate

## 0. Fix idratazione (bloccante)
L'errore runtime mostra che SSR renderizza "Sign in" (en) ma il client renderizza "Accedi" (it) sulla landing pubblica. `I18nBootstrap` cambia lingua solo nelle route sotto `_authenticated`. Estendere il "force-en su SSR + swap dopo mount con key bump" anche a `__root.tsx` (o avvolgere `<Outlet/>` con il bootstrap a livello root), così tutte le route — incluse `/` e `/docs` — restano consistenti.

## 1. GitHub repo sync (import via URL)
- Nuova server fn `importFromGitHub({ url, ref? })` in `src/lib/repos.functions.ts`:
  - valida URL `github.com/<owner>/<repo>` con Zod
  - scarica tarball pubblico via `https://codeload.github.com/<owner>/<repo>/tar.gz/<ref>` (default `HEAD`)
  - estrae con `tar-stream` (puro JS, Worker-safe), filtra binari/`node_modules`/`.git`, applica gli stessi limiti dell'import ZIP
  - riusa la pipeline esistente: upload su bucket `repositories`, insert in `files`, calcolo sha256
- UI: nel dialog "New repository" del progetto, aggiungere tab "From GitHub URL" accanto a "Upload ZIP". Solo repo pubblici in questa fase (token GitHub rimandato).

## 2. Commenti inline suggeriti
- Server fn `suggestComments({ fileId, provider, model })` che ritorna `[{ line, severity, comment }]` come JSON strutturato (prompt con schema, parse difensivo).
- Variante client `suggestCommentsLocal` per Ollama/LM Studio (riusa `local-ai.client.ts`).
- Nuovo tab "Comments" nel pannello AI del workspace:
  - decorazioni Monaco (gutter icon + hover) sulle righe suggerite
  - lista laterale con accept/reject per suggerimento
  - bottone "Copy as patch" che genera un diff unified con i commenti accettati inseriti
  - **mai** scrittura automatica sui file

## 3. Analisi profonde (tabs aggiuntivi nel pannello AI)
Una sola server fn generica `runAnalysis({ fileId, kind, provider, model })` con `kind ∈ { smells, deadcode, bugs, security, performance, maintainability, architecture, dependencies }`. Ogni `kind` ha un prompt dedicato in `src/lib/prompt.ts` (i18n EN/IT/ZH) che chiede output Markdown strutturato. Cache in `explanations` riusando `explanation_type = kind`.

UI: tabs nel pannello AI raggruppati in "Summary | Comments | Quality | Security | Architecture". "Architecture" e "Dependencies" lavorano a livello repo (aggregano import/grafo file) non singolo file — nuova fn `runRepoAnalysis({ repoId, kind })`.

## 4. Admin UI per `user_roles`
- Migration: policy INSERT/DELETE su `user_roles` solo per admin via `has_role(auth.uid(),'admin')`; helper SQL `make_first_user_admin()` opzionale.
- Server fn `listUsers` / `setUserRole` con middleware `requireAdmin` (verifica `has_role`).
- Nuova route `src/routes/_authenticated/admin.tsx` — visibile in `AppShell` solo se l'utente ha ruolo admin (query `hasRole`).
- Tabella utenti con toggle ruolo admin/user.

## 5. Export per-repo
- Server fn `exportRepoMarkdown({ repoId })`: zippa tutte le explanations del repo in `explanations.zip` con `fflate` (Worker-safe), un `.md` per file + `INDEX.md`.
- Bottone "Export all" nella vista repo.

## 6. i18n
Estendere `en/it/zh/common.json` con namespace `analysis.*`, `comments.*`, `admin.*`, `github.*`.

## Tecnico — boundary client/server
- `tar-stream`, `fflate` solo dentro `.handler()` (dynamic import) per evitare leak nel bundle client.
- Provider locali continuano a girare browser-side (codice non lascia la macchina utente).
- Tutte le nuove server fn protette montano `requireSupabaseAuth`; nessuna nel loader di route pubbliche.

## Differito a Phase 4
- GitHub OAuth login (richiede uscita da auth gestito Lovable Cloud)
- GitHub sync di repo privati (richiede PAT utente cifrato)
- PR generation con i commenti accettati
- Pagine `/docs` aggiuntive oltre l'indice attuale

## Domande
1. **Analisi profonde**: spedire tutte e 8 in questa fase, o solo il subset "Quality" (smells + deadcode + bugs) + "Security", lasciando architecture/dependencies/performance/maintainability a Phase 4?
2. **Admin bootstrap**: come promuovere il primo admin? Opzioni: (a) helper SQL manuale documentato in README, (b) prima registrazione = admin automatico, (c) variabile d'ambiente `ADMIN_EMAIL`.
