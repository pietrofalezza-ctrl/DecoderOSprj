## Obiettivo

Nella pagina `/projects/:projectId/repos/:repoId`, l'utente deve poter cliccare **"Run analysis on this file"** quando si trova sul tab **Static Code** o **Malware**, anche se non ha configurato nessuna API key / provider LLM. Le scansioni statiche non usano AI, quindi non hanno motivo di essere bloccate dalla mancanza di un provider.

## Diagnosi

In `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`:

- Il bottone "Run analysis on this file" (riga ~1211) è già tecnicamente abilitato sui tab `source_static` / `malware` senza provider (`tabNeedsProvider` li esclude).
- Però l'esperienza fa pensare il contrario per due motivi:
  1. **Tab di default = `summary`** (LLM). Quando `analysis_mode = "both"` ma l'utente non ha API key, atterra sul tab Summary, il bottone è disabilitato per "needProvider", e non capisce che basta passare a Static Code / Malware.
  2. **Banner ambra "No provider configured"** (riga ~1134) viene mostrato anche quando il tab attivo è Static Code o Malware, dove non serve alcuna chiave. Suggerisce visivamente che senza key non si possa lanciare nulla.
  3. **Badge di stato** in alto può comunque mostrare "needProvider" in transizioni di tab.

## Modifiche

File unico: `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`.

1. **Default tab intelligente**: se `llmEnabled === true` ma nessun provider è configurato (`!hasAny`), imposta il default di `mainTab` su `"source_static"` invece di `"summary"`, così l'utente atterra subito su un tab eseguibile senza key.

2. **Nascondi il banner "No provider"** quando il tab attivo è `source_static` o `malware` (il banner resta visibile sui tab LLM, dove è pertinente).

3. **Forza lo `statusKind` a `"ready"`** quando il tab corrente non richiede provider e c'è un file selezionato, anche se altrove (es. sidebar) non c'è ancora una key, per evitare il chip "needProvider" fuorviante.

4. **Verifica finale**: assicurarsi che `disabled` del bottone runMain per `source_static` / `malware` resti solo `!selectedFileId || isRunning` (nessuna dipendenza da `providerValue`).

## Cosa NON tocchiamo

- Logica server (`runSourceStaticAnalysis`, `runStaticMalwareScan`): non richiedono già alcuna API key.
- Tab LLM (Summary, Quality, Security, AI Origin, Chat, Fix): continuano a richiedere un provider.
- Schema / migrazioni / RLS: nessuna modifica DB.

## Verifica

- Con `analysis_mode = "both"` e nessuna API key: il tab Static Code è preselezionato (o comunque selezionabile) e il bottone "Run analysis on this file" è cliccabile; lancia la scansione statica e mostra il report.
- Stesso flusso per il tab Malware.
- Con almeno una API key configurata: il comportamento attuale sui tab LLM è invariato.
