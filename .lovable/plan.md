## Cosa aggiungo

Tre estensioni al workspace di analisi (`/projects/$projectId/repos/$repoId`), tutte sopra il flusso esistente: nessuna scrittura su Git, nessuna nuova tabella.

### 1) Analisi su intere cartelle

**UI** — `FileTree`: ogni nodo cartella diventa selezionabile (oltre al toggle apri/chiudi) tramite un piccolo bottone "Analizza cartella" che appare on-hover/quando la cartella è attiva. Selezionare una cartella imposta uno stato `selectedFolder` (path) in alternativa a `selectedFileId`.

**Comportamento** (= "Entrambe"):
- Il pannello destro mostra una vista **Cartella** con: elenco file figli, tab `Quality / Bugs / Security / AI origin`, bottone "Esegui su tutta la cartella".
- L'esecuzione è batch sequenziale (riusa `runAnalysis` per ogni file), con barra di progresso `n/N` e cancel.
- Al termine: **report aggregato** generato da una nuova serverFn `aggregateFolderAnalysis` che fa un'unica chiamata LLM passando i risultati per-file accorciati → produce sintesi a livello cartella (top issue, pattern ricorrenti, severità). Mostro report + tabella per-file espandibile.
- Cache: ogni per-file passa già dalla cache `explanations` esistente (per `file_sha256` + `explanation_type`). L'aggregato viene memorizzato in `explanations` con `file_id = primo file` + `explanation_type = "folder_aggregate:<kind>:<folder_path_hash>"` per riusarlo finché i file non cambiano.

### 2) Highlight per riga con tooltip

**Prompt** — aggiorno `buildAnalysisPrompt` per chiedere al modello, oltre al Markdown attuale, un blocco finale strutturato:
````
```findings-json
[
  {"start_line": 42, "end_line": 47, "severity": "high", "title": "…", "message": "…"}
]
```
````
Parsing tollerante (`extractFindings(text)`): se il blocco manca, niente highlight (nessuna regressione).

**CodeViewer** — accetta `findings: Finding[]`. Uso le API Monaco già disponibili:
- `editor.createDecorationsCollection` con `className` colorato per severity (background sulla riga + bordo a sinistra).
- `editor.deltaDecorations` per glyph margin (icona discreta a fianco numero riga) — uso bullet point con CSS, non immagini.
- Hover tooltip via `monaco.languages.registerHoverProvider(language, …)` che restituisce il `message` del finding alla riga corrente.
- Click su un finding nel pannello laterale → `editor.revealLineInCenter(start_line)` + selezione.

Lista findings sincronizzata: nuovo `FindingsList` sotto il testo Markdown nei tab Quality/Bugs/Security.

### 3) Modifiche pronte al copia-incolla (diff unified)

**Nuovo tab "Fix" nel pannello analisi** (visibile quando ci sono findings e il modello li supporta).
- Bottone "Genera patch" → nuova serverFn `proposeFix(file_id, findings_or_kind)` che chiede al modello una patch in formato `unified diff` (`--- a/path` / `+++ b/path` / hunk `@@`). Prompt vincolato: "Restituisci SOLO un blocco ```diff con un unified diff applicabile con `git apply`. Non riscrivere parti non strettamente necessarie."
- UI: render del diff con syntax highlighting (riuso Monaco in `language="diff"`, read-only).
- Tre bottoni: **Copia diff** (clipboard), **Scarica .patch** (blob download con nome `<file>.patch`), **Mostra istruzioni** (popover: `git apply file.patch` / drag-in IDE).
- Per le **cartelle**: la patch è multi-file (tutti gli hunk concatenati), scaricabile come `<folder>.patch`.

Nessuna modifica al filesystem dell'app né al repo dell'utente: solo testo da copiare.

## File toccati / nuovi

**Nuovi:**
- `src/lib/findings.ts` — tipo `Finding`, `extractFindings(text)`, `severityClass()`.
- `src/lib/fix.functions.ts` — serverFn `proposeFix` e `proposeFolderFix`.
- `src/lib/folder-analysis.functions.ts` — serverFn `aggregateFolderAnalysis` + helper batch.
- `src/components/FindingsList.tsx` — lista finding cliccabile.
- `src/components/DiffViewer.tsx` — Monaco read-only `diff` + bottoni copia/scarica.
- `src/components/FolderAnalysisPanel.tsx` — tab cartella (batch + aggregato + findings cross-file).

**Modificati:**
- `src/components/FileTree.tsx` — bottone "Analizza cartella" sui nodi folder, prop `onSelectFolder`.
- `src/components/CodeViewer.tsx` — nuova prop `findings`, decorations + gutter + hover provider; espone `revealLine` via `ref`.
- `src/lib/analysis-prompt.ts` — istruzioni per il blocco `findings-json` finale (per i kind non-`ai_origin`).
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` — stato `selectedFolder`, switch pannello file vs cartella, passaggio findings al CodeViewer, nuovo tab "Fix".
- `src/i18n/locales/{en,it,zh}/common.json` — nuove stringhe (`workspace.folder.*`, `workspace.findings.*`, `workspace.fix.*`).

## Note tecniche

- **Worker runtime**: tutto resta dentro `createServerFn`, nessun pacchetto Node-only. Il diff è solo testo prodotto dal modello, niente `diff` libs lato server.
- **Backpressure batch cartelle**: limito a `MAX_FILES_PER_FOLDER = 20` per chiamata (configurabile), saltando file binari/extra-grossi come già fa `analyzeRepoAiOrigin`.
- **Costi**: la cache `explanations` esistente evita di rifatturare per-file. L'aggregato è 1 chiamata in più per cartella.
- **Locali (Ollama/LM Studio)**: il batch e il fix funzionano anche con provider locali (riuso `callLocalProvider`); l'aggregato viene scritto in cache via `saveLocalAnalysis` esteso.
- **Backward compatible**: la prop `findings` su `CodeViewer` è opzionale; se manca, comportamento attuale. Il blocco `findings-json` in coda al markdown è ignorato dal render se non parsato.

Tempo stimato: ~6–8 edits coordinati, niente migrazioni DB.
