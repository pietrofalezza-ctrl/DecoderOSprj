## Obiettivo

Nei tab **Static Code** e **Malware** della pagina report, quando l'utente ha una API key cloud (BYOK) o un endpoint locale configurato, mostrare un bottone aggiuntivo "Spiega con AI" che produce una narrazione in linguaggio naturale del report statico — come avviene già per gli altri tab (Summary, Quality, Security).

Le scansioni statiche restano eseguibili senza key; la verbalizzazione AI è un'aggiunta opzionale.

## Diagnosi attuale

- `runSourceStaticAnalysis` / `runStaticMalwareScan` restituiscono report strutturati (`SourceStaticReport`, `StaticMalwareAssessment`) e un markdown tecnico generato lato server (`formatSourceStaticMarkdown`, `formatMalwareMarkdown`).
- Nessuno dei due passa il risultato attraverso un LLM; per questo l'output non è "verbalizzato" come gli altri tab che usano `runAnalysis` → modello cloud/locale.

## Modifiche

### 1. Nuove server functions (file: `src/lib/static-verbalize.functions.ts`)

Due funzioni `createServerFn` con `requireSupabaseAuth`, una per scanner:

- `verbalizeSourceStaticReport({ file_id, provider, model?, language })`
- `verbalizeMalwareReport({ file_id, provider, model?, language })`

Comportamento:
1. Carica il file e l'ultimo report statico salvato in `analysis_activities` (kind=`static_scan`) o ri-esegue la scansione se manca.
2. Costruisce un prompt che include: path, linguaggio, metriche chiave, lista findings (severity, ragioni, righe), e chiede una sintesi human-friendly secondo il livello proficiency dell'utente.
3. Routing provider:
   - `cloud:*` → `callCloudProvider` (riusa `src/lib/ai-providers.server.ts` come fa `runAnalysis`).
   - `local:*` → segue lo stesso pattern dei tab locali (chiamata all'endpoint configurato).
4. Salva il risultato in `explanations` con `explanation_type = "static_verbalize:source"` / `"static_verbalize:malware"` per cache (chiave: file_sha256 + provider + language + proficiency), così riapertura del report non ri-chiama l'LLM.
5. Append in `analysis_activities` con `activity_kind = "static_verbalize"`.

### 2. UI (`src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`)

Nei `TabsContent` di `source_static` e `malware`:
- Aggiungere stato `sourceStaticAiText` / `malwareAiText` + mutation `verbalizeSourceStaticMut` / `verbalizeMalwareMut`.
- Sopra il `<SourceStaticReportPanel>` / `<MalwareReportPanel>` aggiungere una barra:
  - Bottone "Spiega con AI" (icona Sparkles), abilitato solo se: `llmEnabled && providerValue && (sourceStaticReport / malwareReport esistente) && !isPending`.
  - Se la key non c'è, mostrare CTA inline (link a Settings#byok) come nel tab Summary.
- Quando il testo AI è disponibile, renderlo in un `<ExplanationView aiBadge={true}>` sopra il report tecnico, con bottoni Copy/Download già presenti.
- Caricare il testo cached all'apertura del tab tramite `historyQ` (estendere `listFileAnalysisHistory` per includere i due nuovi `explanation_type`, o usare query dedicata).

### 3. i18n (`src/i18n/locales/{en,it,zh}/common.json`)

Nuove chiavi:
- `workspace.staticVerbalize.cta` — "Spiega con AI" / "Explain with AI"
- `workspace.staticVerbalize.generating` — "Verbalizzo il report…"
- `workspace.staticVerbalize.needsProvider` — riusa `workspace.noProvider` se esiste.

## Cosa NON tocchiamo

- Logica delle scansioni statiche `runSourceStaticAnalysis` / `runStaticMalwareScan`: invariate, restano gratis e senza key.
- Schema DB: usiamo le tabelle esistenti `explanations` e `analysis_activities` (nuovi valori di `explanation_type` / `activity_kind`).
- Altri tab LLM.

## Verifica

- Senza provider configurato: tab Static Code/Malware funzionano come prima, nessun bottone AI visibile (solo CTA "configura key").
- Con provider cloud o locale: dopo aver eseguito la scansione, compare "Spiega con AI"; cliccando si genera la narrazione e viene mostrata in cima al report tecnico.
- Riaprendo lo stesso file senza modifiche: il testo AI viene caricato dalla cache senza nuova chiamata all'LLM.
