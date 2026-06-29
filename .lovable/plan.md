# Diagnostica scan AI-origin + chiarezza formati

## Cos'è successo

Lo screenshot "Sampled 0 of 84" non è un bug di conteggio: lo scanner **ha provato** a campionare 30 file (cap costo) sugli 84 file di codice riconosciuti, ma **tutte le 30 chiamate LLM sono fallite** → `results = []`, `sampled_count = 0`. Il backend già raccoglie gli errori in `errors[]` ma il pannello UI (`AiOriginPanel.tsx`) li ignora e mostra solo "No code files were scoreable", che è fuorviante.

Cause tipiche per fallimento totale:
- BYOK key del provider selezionato scaduta / rate-limited / invalid → ogni chiamata 401/429
- Modello indisponibile per quella key (es. `gpt-5` su una key tier-1)
- Network/timeout

L'AI-origin scan **richiede per design un LLM** (è la cifra del prodotto vs. uno static-only), quindi BYOK o endpoint locale sono obbligatori — niente fallback "free".

## Fix proposto (scoped a UI/UX, non logica)

### 1. `src/components/AiOriginPanel.tsx`
Quando `sampled_count === 0` e `errors.length > 0`:
- Mostrare un alert rosso "Lo scan non è andato a buon fine" con:
  - il primo `errors[0].message` (es. "401 Unauthorized")
  - hint: "Verifica la BYOK key in Settings → AI Providers, o cambia provider"
  - bottone "Open Settings"
- Quando `sampled_count > 0` ma `errors.length > 0`, aggiungere un piccolo badge "N file failed" cliccabile che espande i path falliti.

### 2. Esplicitare i formati supportati

**A. Tooltip + sotto-label sul bottone "Upload ZIP"** in `projects.$projectId.index.tsx`:
> "ZIP archive · estrae e analizza 20+ linguaggi (JS/TS, Python, Java, Rust, Go, C/C++, C#, Ruby, PHP, Kotlin, Swift, SQL, Vue, Svelte, Lua, Dart, Scala, …)"

**B. Mini-helper riga sotto il blocco upload**, con icona info:
> "Carichi qualsiasi cartella zippata. Static analysis e malware scan funzionano senza API key; AI-origin e chat richiedono BYOK o endpoint locale."

**C. Aggiornare il copy in homepage** (`src/routes/index.tsx`) nella sezione "Install Decoder / Get started": una bullet line in più
> "Supporta ZIP di repo polyglot — JS/TS, Python, Java, Rust, Go, C/C++, C#, Ruby, PHP, Kotlin, Swift, SQL, e altri 10+ linguaggi."

E aggiornare le 3 stringhe i18n corrispondenti in `en/it/zh/common.json`.

### 3. (opzionale, consigliato) Aumentare visibilità del problema sul dashboard repo
In `projects.$projectId.repos.$repoId.tsx`, dopo il bottone "Run AI-origin scan", mostrare l'ultimo errore della history se presente (`last_error` dal record `analysis_activities`).

## Cosa NON tocco
- Logica di scoring, parsing, cache LLM, prompt → invariati.
- Lista `CODE_EXTS` (già 20+ estensioni — è coerente col copy).
- BYOK gating, RLS, encryption → invariati.

## Risultato atteso
Quando l'utente rifà lo scan e qualcosa va storto vedrà il motivo (key invalida, rate limit, ecc.) invece di "No code files were scoreable". E il fatto che si possa caricare di tutto, non solo JS/TS, sarà esplicito sia in landing che nella pagina di upload.

Procedo?
