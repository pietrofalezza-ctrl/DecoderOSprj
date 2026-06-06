## Cosa cambio (solo UI/discoverability del workspace repo)

Tre problemi distinti, tre fix mirati nel file `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` (+ traduzioni e un piccolo tocco a `AppShell`).

### 1. "Non capisco da dove parte l'analisi di un singolo file"

Nel pannello centrale (codice) e nel pannello destro:
- Quando **nessun file è selezionato**, sostituire l'attuale testo "Seleziona un file" con un riquadro guida grande con 3 step numerati: **1) Scegli un file a sinistra → 2) Scegli un provider AI → 3) Premi Esegui**, con frecce visive (`ArrowLeft`, `ArrowRight`) che puntano ai pannelli laterali.
- Sopra il bottone "Esegui" aggiungere un **indicatore di stato** sempre visibile:
  - ✅ "Pronto" (verde) quando file + provider OK
  - ⚠ "Seleziona un file" / "Configura un provider" (ambra) quando manca qualcosa, con link diretto a `/settings#byok` nel secondo caso.
- Il bottone Esegui passa da `size="sm"` a `size="default"`, full-width, leggermente più alto e con un'etichetta chiara: **"Esegui analisi su questo file"** invece del generico "Esegui/Analizza".

### 2. "Il pannello di destra non si vede / è tagliato"

A 1433 px la divisione 20/50/30 lascia ~430 px al pannello destro, ma con i 2 select affiancati a `grid-cols-2` il contenuto si comprime e il bottone Esegui può finire sotto la fold senza scroll evidente.
- Cambiare il pannello destro: i due `Select` (Proficiency + Provider) da `grid-cols-2` a stack verticale `space-y-2`, così il bottone Esegui resta sempre visibile in alto.
- Aumentare `defaultSize` del pannello destro da `30` a `34` e `minSize` da `22` a `26`.
- Avvolgere l'intera intestazione del pannello destro (selettori + bottone) in uno sticky-top per non perderlo durante lo scroll dei tab.

### 3. "Analizza la codebase non apre il pannello laterale"

Causa: l'effetto auto-apertura controlla solo `search.view === "analyze"` e setta `repoSheetOpen=true`, ma la `Sheet` è figlia del **pannello resizable a 20%** della sidebar sinistra. Se quel pannello non è ancora montato/idratato (SSR + lazy), lo sheet può non aprirsi. Inoltre, se l'utente entra direttamente con `?view=analyze` e `providerValue` è ancora vuoto, l'auto-start non scatta e si vede solo lo schermo vuoto.

Fix:
- Spostare la `<Sheet>` fuori dal `ResizablePanel`, al livello dello shell (subito sotto `<AppShell>`), così l'apertura non dipende dalla sidebar.
- Sostituire `useEffect` di apertura con apertura sincrona in fase di render basata su `search.view`, con `onOpenChange` che fa anche `navigate({ search: {} })` quando si chiude (così riaprire funziona).
- Nell'effetto di auto-start, attendere `provs.isSuccess` prima di valutare `providerValue`; aggiungere fallback toast esplicativo se nessun provider cloud è disponibile (con link a Settings).
- Nel `AiOriginPanel` quando `canRun=false`, oltre al link a Settings già presente, mostrare anche la ragione: "Serve un provider cloud (Lovable AI o BYOK)".

### 4. Avatar più evidente (richiesta esplicita)

In `src/components/AppShell.tsx`:
- Aumentare l'avatar da `h-7 w-7` a `h-8 w-8`, aggiungere `ring-2 ring-primary/30 hover:ring-primary/60`, e un piccolo badge "Account" testuale accanto su `md:` e superiori, così non è più solo un'iniziale ambigua.
- Tenere il `Tooltip` con email (già presente).

### File modificati

- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` — empty state guidato, indicatore di stato, stack verticale dei select, sticky toolbar, sheet a livello root, auto-open robusto.
- `src/components/AppShell.tsx` — avatar più evidente.
- `src/components/AiOriginPanel.tsx` — messaggio "Serve provider cloud" più chiaro.
- `src/i18n/locales/{en,it,zh}/common.json` — nuove chiavi: `workspace.howTo.step1/2/3`, `workspace.status.ready`, `workspace.status.needFile`, `workspace.status.needProvider`, `workspace.runFile`, `aiOrigin.needsCloudLong`.

### Fuori scope

- Nessun cambio a backend / server functions / RLS / schema.
- La landing pubblica non viene toccata (per quella domanda servirebbe uno screenshot specifico — la affrontiamo separatamente se vuoi).
- Nessuna nuova dipendenza npm.
