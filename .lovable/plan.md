## Stato attuale: appari su Google?

**Sì, sei indicizzato — ma quasi invisibile.**

- Google Search Console: `https://decoderead.dev/` → `verdict: PASS`, `Submitted and indexed`, ultimo crawl 29 giu 2026 (mobile), sitemap riconosciuta. Quindi le pagine *possono* uscire.
- Performance Search Console (ultimi 30gg): **0 click / 0 impression riportate** dall'API → il sito esce solo se uno cerca letteralmente "decoderead" o frasi molto lunghe già nelle tue docs. Per query competitive non sei in top 100.
- Semrush domain: **nessun dato organico** (`No data found`) → traffico stimato ~0, nessuna keyword in top 100 Google US/IT secondo Semrush.
- Semrush backlinks: **Authority Score 0/100**, 10 backlink da 8 domini. Di questi solo `lovable.app` (AS 55) è reale. Tutti gli altri (seopxl-*, fiverr-*, bisprofit) sono **link spam/PBN tossici** — vanno disconosciuti, peggiorano la reputazione.

## Cosa dice Semrush sulle keyword target

| Keyword | Volume/mese (US) | Difficoltà | Note |
|---|---|---|---|
| ai code review | 1.900 | 50 (difficile) | testa qui sono Greptile/CodeRabbit |
| ai code analysis | 210 | 26 (facile) | **già copri questa — opportunità** |
| open source ai code review | 20 | 0 (molto facile) | **hai già la pagina, win quasi sicuro** |
| byok ai code review | n/d | — | nicchia, hai la pagina, sarai tra i pochi |
| review ai generated code | n/d | — | trend in crescita, copri |

Traduzione: il piano editoriale è giusto, ma **mancano segnali esterni** (backlink veri, menzioni) e **mancano segnali di freschezza** (il sito è giovane, Google sta ancora "decidendo").

## Obiettivo 500 visitatori/giorno

Va detto chiaro: con AS 0, dominio nuovo e nicchia tecnica, **500/giorno organico richiede 4–8 mesi di lavoro costante**. È raggiungibile, ma non solo con SEO on-page — serve mix di canali. Aritmetica grossolana: ~15.000 visite/mese ≈ ranking top-3 su 4–6 keyword da 200–1.000 vol/mese **oppure** top-10 su 15–20 long-tail + traffico da community/social.

## Piano in 4 fasi

### Fase 1 — Pulizia & fondamenta (questa settimana)
1. **Disavow dei backlink spam** in Search Console (carico file `disavow.txt` con i 7 domini fiverr/seopxl/bisprofit). Senza questo, ogni link-building futuro è zavorrato.
2. **Submit manuale in GSC** delle 10 pagine docs principali (URL Inspection → Request indexing) per accelerare l'ingresso in indice.
3. **Aggiungere `lastmod` reale** nella sitemap (oggi è statico) — segnala freschezza ai crawler.
4. **Internal linking audit**: ogni doc deve linkare 3–5 altre doc + homepage deve linkare le 5 doc principali (già parziale, va completato).

### Fase 2 — Contenuti che catturano long-tail (settimane 2–4)
Pubblicare 6 pagine nuove targetizzate su query a bassa competizione ma intent chiaro:
- "how to detect ai generated code" (trend forte, low competition)
- "static code analysis without api key"
- "free malware scanner for source code"
- "alternatives to coderabbit free" 
- "claude code review vs copilot review"
- versione IT: "come revisionare codice generato da AI" + "analisi malware codice gratis"

Ogni pagina: 1.200–1.800 parole, esempio reale (snippet vulnerabile + output Decoder), CTA a "prova ora", schema Article + FAQ.

### Fase 3 — Segnali esterni (settimane 2–8, parallelo)
Questi muovono l'ago più della SEO tecnica per un dominio nuovo:
- **Show HN** su Hacker News con angle "Open-source AI code review you can run with Ollama" (1 lancio, ben preparato, può portare 2–10k visite in 24h + backlink permanenti)
- **Post su r/programming, r/cybersecurity, r/selfhosted** con case study LockBit (hai già il materiale)
- **Dev.to + Hashnode**: cross-post di 3 articoli con link canonical al sito (backlink dofollow gratuiti)
- **GitHub Awesome lists**: PR per essere aggiunti a `awesome-ai-tools`, `awesome-static-analysis`, `awesome-selfhosted`
- **Product Hunt launch** preparato (1 giorno, target: top 5 → 3–8k visite)

### Fase 4 — Misura & itera (continuativa)
- Aggancio mensile via Semrush domain_analysis + GSC export per vedere quali keyword salgono
- Refresh dei contenuti che arrivano in posizione 11–20 (push verso top 10)
- Eventuale connettore Semrush per dashboard in-app se vuoi tracking quotidiano

## Cosa serve da te per partire

1. Conferma se vuoi che proceda con **Fase 1** completa adesso (disavow file, sitemap lastmod dinamico, submit URL via GSC API, audit internal linking).
2. Conferma se vuoi che pubblichi anche i **6 nuovi contenuti Fase 2** (EN + IT delle più strategiche) in questo turno o se prefersci uno alla volta.
3. Per Fase 3 il lavoro è tuo (post HN/Reddit/PH) — io posso preparare i copy pronti da incollare.

## Dettaglio tecnico (per riferimento)

- File da toccare in Fase 1: `public/sitemap.xml` (lastmod dinamico → meglio promuovere a server route `src/routes/sitemap[.]xml.ts`), `marketing/disavow.txt` (solo per upload manuale in GSC, non esposto pubblicamente).
- Fase 2: nuove rotte sotto `src/routes/docs.*.tsx` con `head()` completo (title, description, og:*, canonical, JSON-LD Article+FAQ) + aggiornamento sitemap + breadcrumb interni da `/docs`.
- GSC API: posso chiamare `urlInspection` + sitemap resubmit dal connector già collegato.
- Disavow file: si carica solo manualmente da [search.google.com/search-console/disavow-links](https://search.google.com/search-console/disavow-links) — ti preparo il `.txt`, lo carichi tu.