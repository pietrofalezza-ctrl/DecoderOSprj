## Obiettivo
Garantire che `LOVABLE_API_KEY` non venga mai usata per servire utenti finali senza opt-in esplicito del proprietario del progetto, mantenendo l'app BYOK-pure di default.

## Strategia
Trasformare "Lovable AI" da provider sempre disponibile a **provider opt-in via env var del proprietario** (`ALLOW_HOSTED_LOVABLE_AI=true`). Quando il flag è off (default), il provider è invisibile in UI e rigettato server-side.

## Modifiche

### 1. Gating server-side (5 file)
In `explain.functions.ts`, `analysis.functions.ts` (2 punti), `folder-analysis.functions.ts`, `fix.functions.ts`, prima del controllo `data.provider === "lovable"`:

```ts
if (data.provider === "lovable" && process.env.ALLOW_HOSTED_LOVABLE_AI !== "true") {
  throw new Error("hosted_lovable_ai_disabled");
}
```

Risultato: anche se un client truccato inviasse `provider: "lovable"`, viene rifiutato.

### 2. Estensione quota free-tier
La quota oggi protegge solo `explainFile`. Estenderla a `analyzeFile`, `analyzeFolderAggregate`, `proposeFix`. `analyzeRepoAiOrigin` consuma 30 file → conta come 30 chiamate verso la quota o blocchiamo del tutto su provider lovable (più semplice: blocchiamo).

### 3. Esposizione del flag al client
Nuova server fn `getHostedAiAvailability()` in `src/lib/credentials.functions.ts`:
- Ritorna `{ hostedLovableEnabled: boolean }` leggendo `process.env.ALLOW_HOSTED_LOVABLE_AI === "true"`.

Già esiste `lovableAvailable` ma controlla solo la presenza della key → va cambiato per riflettere anche il flag.

### 4. UI: nascondere "Lovable AI" quando disabilitato
- `src/components/FolderAnalysisPanel.tsx`: rimuovere `"lovable"` dalla lista provider quando flag off; cambiare default a "openai".
- Selettori provider in pagina repo (`src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`): stesso filtro.
- Pagina credenziali (`/account` o equivalente): mostrare badge "Hosted AI: disabled by owner" quando off, link alla guida BYOK.

### 5. Documentazione e i18n
- Aggiungere chiave `settings.hostedDisabled` in `it/en/zh common.json` con messaggio "Il provider Lovable AI è disabilitato. Configura una tua chiave o usa Ollama/LM Studio."
- Aggiornare `manifesto.tsx` aggiungendo riga: "Di default nessun utente consuma crediti del manutentore: BYOK o locale, sempre."
- Aggiornare `/open-source` e `/docs` per documentare il flag `ALLOW_HOSTED_LOVABLE_AI` per chi self-hosta.

### 6. Errore 402/429 utente-friendly
Quando una chiamata BYOK fallisce con 402/429, già gestito in `ai-providers.server.ts` via `failSafe`. Aggiungere mapping esplicito per provider Lovable nei rari casi in cui il flag fosse on:
- 402 → "Hosted AI fund exhausted. Switch to your own key."
- 429 → "Hosted AI rate-limited. Use your own key for unlimited."

### 7. (Operativo, no codice) Nei tuoi Project Secrets
NON impostare `ALLOW_HOSTED_LOVABLE_AI` → il default è off, quindi zero rischio di addebito sulla tua carta.

## File toccati
- `src/lib/explain.functions.ts`
- `src/lib/analysis.functions.ts`
- `src/lib/folder-analysis.functions.ts`
- `src/lib/fix.functions.ts`
- `src/lib/credentials.functions.ts`
- `src/lib/rate-limit.server.ts` (estensione quota)
- `src/components/FolderAnalysisPanel.tsx`
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`
- `src/routes/manifesto.tsx`, `src/routes/docs.tsx`, `src/routes/open-source.tsx` (testo)
- `src/i18n/locales/{it,en,zh}/common.json`

## Verifica
- Smoke test: con flag off, server fn con `provider: "lovable"` → 500 `hosted_lovable_ai_disabled`.
- UI: selettore provider non mostra "Lovable AI" quando flag off.
- Smoke test BYOK: con OpenAI key salvata, `explainFile({ provider: "openai" })` funziona e nessuna chiamata al gateway Lovable.
