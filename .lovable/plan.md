## Obiettivo
Rinforzare la SEO ora che ci sono nuove funzionalità (Folder Chat AI, History delle analisi AI) e portare la keyword **AI** in modo coerente su titoli, description, OG e JSON-LD — senza scadere nel keyword-stuffing.

## Stato attuale (dallo scan SEO)
- Failing: Google Search Console non collegato, hero LCP lento, contrasto + `<main>` landmark sulla build pubblicata.
- Title/description già presenti su `__root.tsx` e `/` ma le nuove route (`/history`, `/projects/.../history`) non hanno head meta dedicato.
- Sitemap server-route esistente: va aggiornata con le nuove pagine pubbliche (history resta dietro auth → si esclude).

## Cosa farò

### 1. Riscrittura copy SEO con keyword "AI" (it/en coerente al sito)
Allineo titolo + description in `__root.tsx` e `src/routes/index.tsx`:
- Title (≤60 char): `Decoder — AI code analysis & AI-generated code review`
- Description (≤160 char): `Decoder is an open-source AI code analysis tool: review AI-generated code, run static & malware checks, chat with your repo in any language.`
- og:title / og:description / twitter:* allineati.
- JSON-LD `SoftwareApplication` aggiornata: `applicationCategory: "DeveloperApplication"`, `keywords: "AI code analysis, AI code review, AI-generated code, static analysis, malware analysis"`.

### 2. Head meta per le pagine pubbliche già esistenti senza title dedicato
Verifico e, dove manca, aggiungo `head()` con title/description/og che includono "AI" in modo naturale a:
- `/manifesto`, `/open-source`, `/data-flow`, `/docs`, `/docs/how-to-review-ai-code`, `/contact`, `/privacy`, `/terms`, `/cookies`.
Esempio: `Docs — Decoder AI code review` / `Manifesto — Open-source AI code analysis`.

### 3. Pagine History (autenticate)
Aggiungo `meta: [{ name: "robots", content: "noindex" }]` su `/history` e `/projects/$/repos/$/history`: sono dietro auth, non vanno in indice ma il tag evita ambiguità.

### 4. Sitemap
Aggiorno `src/routes/sitemap[.]xml.ts` (se presente) o il `public/sitemap.xml` esistente per riflettere le sole route pubbliche attuali. Non includo `/history*` (auth).

### 5. Accessibilità + landmark (finding aperto)
- Verifico che ci sia **un solo** `<main>` nel layout pubblico (`_public` o `__root` shell) e lo aggiungo se manca.
- Sostituisco eventuali `text-muted-foreground/50` o grigi arbitrari a basso contrasto sulla landing con i token (`text-foreground` / `text-muted-foreground`).

### 6. LCP performance (finding aperto)
Sull'hero della landing:
- Rimuovo `loading="lazy"` se presente.
- Aggiungo `fetchpriority="high"` e `width`/`height` espliciti.
- Aggiungo un `<link rel="preload" as="image">` nel `head()` di `/`.

### 7. Google Search Console
È un finding "mid": non posso collegarlo da solo. A fine implementazione segnalo il pulsante per autorizzare l'OAuth (lo lancio se confermi).

## Cosa NON faccio
- Non ricreo sitemap/robots da zero se già esistono.
- Non aggiungo nuove route SEO finte solo per la keyword (anti-pattern).
- Non tocco logica di business o componenti già funzionanti.

## Verifica
- Re-run dello scan SEO (`Rescan` dal tab SEO) dopo il publish.
- Controllo con `tsgo` che le head() siano valide.
- Ti ricordo che gli aggiornamenti og:* sui link condivisi appaiono solo dopo che il crawler ri-fetcha (puoi forzarlo nel link-preview debugger di LinkedIn/Facebook).

Confermi e procedo?