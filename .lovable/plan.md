## Diagnosi

Dallo screenshot e dal codice emergono 3 problemi:

1. **Auth poco distinto** (`src/routes/auth.tsx`): un'unica form con uno switch testuale in fondo ("Don't have an account? Sign up"). Visivamente login e signup sembrano lo stesso flusso — manca un'affordance chiara.

2. **Analisi invisibile a livello repo** (`src/routes/_authenticated/projects.$projectId.tsx` — la pagina dello screenshot): mostra solo la lista dei file. L'analisi (smells, dead code, bugs, security) esiste ma è **solo per singolo file**, dentro la workspace, e l'utente non riesce ad attivarla dalla repo card. Sembra che la funzione non esista.

3. **Indice "AI-generated probability"**: non esiste. Va aggiunto come nuovo tipo di analisi sia per singolo file sia aggregato per l'intera codebase.

## Piano

### 1. Auth: separare visivamente Sign-in e Sign-up

In `src/routes/auth.tsx`:
- Trasformare lo switch in **Tabs** (`Sign in` / `Sign up`) in cima al form, come pattern standard.
- Sign-up: aggiungere un campo opzionale "Confirm password" e copy distinta ("Create your account" + breve descrizione "Get an AI-aware code companion").
- Sign-in: mantenere flusso attuale con copy "Welcome back".
- Il disclaimer T&C e il bottone Google restano condivisi (sotto le tab).
- Mantenere la query string `mode` → `?mode=signup` per link diretti dal landing/manifesto.

### 2. Rendere visibile l'analisi a livello repository

In `src/routes/_authenticated/projects.$projectId.tsx`:
- Aggiungere su ogni `Link` repo card un secondo CTA visibile: **"Analyze codebase"** con icona `ScanSearch` che linka a `/projects/$projectId/repos/$repoId?view=analyze`.
- Aggiungere una sezione hero "What can you do" con 3 chip illustrative: *Explain*, *Quality scan*, *AI-origin score* — per chiarire le capacità prima ancora di aprire un repo.

In `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`:
- Estrarre dal parametro `?view=analyze` per pre-selezionare il tab "quality" o "ai-origin".
- Aggiungere in alto a destra (accanto a `exportAll`) un **bottone primario "Analyze whole repo"** che apre un drawer con i risultati aggregati.

### 3. Nuova feature: AI-generation probability score

#### Backend
- Aggiungere `analysis-prompt.ts`: nuovo kind `"ai_origin"` con system prompt che chiede al modello di stimare la probabilità (0–100%) che il file sia stato generato da AI, con breakdown dei segnali (naming patterns, commento style, idiomaticità, boilerplate excessivo, mancanza di hack/debug residui, ecc.) e un **score numerico in cima** in formato parseable: `SCORE: NN` su prima riga, poi reasoning markdown.
- Aggiungere `kind: "ai_origin"` in `src/lib/analysis.functions.ts` (zod enum) e nei prompt builder; nessuna nuova migrazione DB (riusa la tabella `explanations` con `explanation_type = "analysis:ai_origin"`).
- Nuova server function `analyzeRepoAiOrigin` in `src/lib/analysis.functions.ts`:
  - Itera (max ~30) sui file di codice del repo, riusa cache per file già analizzati.
  - Per file non in cache: chiama il modello con prompt `ai_origin` (più conciso per ridurre costo).
  - Aggrega: `repo_score = weighted_avg(per_file_score, by_loc)`, restituisce array `{ file_path, score, summary }` + score totale + distribuzione (bucket: human-likely <30, mixed 30–70, ai-likely >70).
  - **Limite e costi**: cap a 30 file per evitare blow-up (i file rimanenti contribuiscono come "unsampled"); messaggio chiaro in UI.

#### Frontend
- In `repos.$repoId.tsx`:
  - Aggiungere quarto tab **"AI origin"** accanto a summary/quality/security per il singolo file.
  - Nel pannello destro/drawer "Analyze whole repo": progress bar live + lista file con score colorato (verde/giallo/rosso), score aggregato grosso in cima, e disclaimer "This is a probabilistic estimate, not proof".
- In `projects.$projectId.tsx`: se la repo ha già uno score aggregato cached, mostrare badge "AI-origin: NN%" sulla card.

#### i18n
- Nuove chiavi in `en/it/zh common.json`:
  - `auth.tabs.signIn`, `auth.tabs.signUp`, `auth.signUpHeadline`, `auth.signInHeadline`
  - `project.analyzeCodebase`, `project.capabilityExplain`, `project.capabilityQuality`, `project.capabilityAiOrigin`
  - `analysis.kind.ai_origin`, `analysis.aiOrigin.*` (titolo, disclaimer, bucket labels, "unsampled files")
  - `workspace.analyzeWholeRepo`, `workspace.aiOriginScore`

### 4. File da toccare

**Modifiche**
- `src/routes/auth.tsx` — tabs sign-in/sign-up
- `src/routes/_authenticated/projects.$projectId.tsx` — CTA analisi + capability chips
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` — tab "AI origin" + drawer "Analyze whole repo"
- `src/lib/analysis-prompt.ts` — kind `ai_origin`
- `src/lib/analysis.functions.ts` — kind enum + nuova fn `analyzeRepoAiOrigin`
- `src/i18n/locales/{en,it,zh}/common.json` — nuove chiavi

**Nuovi**
- `src/components/AiOriginPanel.tsx` — UI dello score aggregato + tabella per-file
- `src/lib/ai-origin.ts` — parser `SCORE: NN` + helper bucketization

### Fuori scope

- Nessuna migrazione DB nuova (riuso `explanations`).
- Nessun cambio a auth providers/RLS.
- Niente vector embeddings o ML model proprietario: lo score viene dal LLM via prompt strutturato.

### Note di accuratezza

L'AI-origin score basato su LLM è **euristico** e va presentato come tale: copy disclaimer obbligatorio in UI ("Estimate, not proof. False positives common on idiomatic boilerplate."). Non è un detector forense.
