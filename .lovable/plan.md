## Phase 5 — App "sul tuo sistema" + cleanup bug

### 1. Desktop app (Electron)
De-coder resta una web app TanStack Start, ma viene confezionata anche come applicazione desktop installabile (macOS / Windows / Linux). L'eseguibile carica la stessa UI in modalità offline-first e si collega al tuo backend (cloud o self-host) o ai modelli locali Ollama / LM Studio già configurati.

- `electron/main.cjs` — finestra `BrowserWindow` (contextIsolation on, nodeIntegration off) che carica `dist/index.html`.
- `electron/preload.cjs` — minimo, espone solo `app.getVersion()`.
- `vite.config.ts` — aggiunta condizionale `base: process.env.ELECTRON ? './' : '/'` (solo build desktop, non tocca la web).
- `package.json` — script `desktop:build` = `ELECTRON=1 vite build && electron-packager . "De-coder" --platform=... --arch=x64 --out=electron-release --overwrite`. `electron` e `@electron/packager` come `devDependencies`.
- README sezione "Run on your machine" con tre opzioni:
  1. **Desktop app** — scarica binario / `bun run desktop:build`.
  2. **Self-host Docker** — `Dockerfile` (build TanStack Start → Bun runtime su porta 8080) + variabili `SUPABASE_*` da impostare. La parte database resta Supabase, ma il README spiega come puntare a un'istanza self-host (supabase-cli `start`).
  3. **100 % offline LLM** — promemoria che con Ollama/LM Studio configurati in Settings, il codice non lascia mai la macchina.

Registrazione resta aperta a tutti (nessuna modifica auth).

### 2. Bug-fix sweep
Cose viste nei log del debug che meritano un giro di pulizia:

- **Falso positivo SSR**: l'errore "SSR rendering failed" segnalato nel preview risulta stale (tutte le rotte rispondono 200). Aggiungere però `errorComponent` + `notFoundComponent` mancanti dove serve, così un futuro crash mostra un fallback invece di blank:
  - `src/routes/_authenticated/dashboard.tsx`
  - `src/routes/_authenticated/admin.tsx`
  - `src/routes/_authenticated/projects.$projectId.tsx`
  - `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`
  - `src/routes/_authenticated/settings.tsx`
  - root `notFoundComponent` (404 user-friendly con link Home / Dashboard).
- **Loop console "Unknown message type: RESET_BLANK_CHECK"**: cosmetico (lovable.js), si silenzia con un piccolo filtro in `src/lib/error-capture.ts`.
- **`_authenticated/route.tsx`**: rimuovere il `setTick` artigianale (l'onAuthStateChange root già invalida il router) — riduce un re-render fantasma e segue le linee guida TanStack/Supabase.
- **`src/lib/local-ai.client.ts`**: aggiungere `AbortController` con timeout 60 s, oggi una chiamata Ollama hang-ata lascia la UI in pending per sempre.
- **README + manifesto**: aggiornare con istruzioni desktop e Docker.

### 3. Verifica
- `curl` su `/`, `/auth`, `/dashboard`, `/manifesto`, `/admin` → 200 senza placeholder di errore.
- `bun run desktop:build --platform=linux` produce un `tar.gz` scaricabile (test in sandbox).
- Smoke manuale: header → Manifesto / Docs, login form visibile, banner "Claim first admin" appare solo al primo utente.

### Fuori scope (Phase 6)
- Suite Playwright E2E.
- Build firmati macOS/Windows (richiedono certificati utente).
- GitHub OAuth e analisi architetturale profonda.
