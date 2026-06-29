# Knowledge Hub — Fasi successive

Fase 1 completata: 32 entries live in EN, search/filtri, knowledge graph bidirezionale, sitemap statica aggiornata. Le prossime fasi chiudono il giro su multilingua, navigazione per tipo, e sitemap dinamica.

## Fase 2 — Traduzioni IT/ZH (top 16 entries)

Tradurre solo le entries ad alto valore SEO/utente, non tutte e 32. Le altre restano in fallback EN (già supportato da `getLocale`).

Entries da tradurre IT + ZH:
1. static-malware-analysis
2. byok
3. repository-analysis
4. local-ai
5. ollama
6. chat-with-code
7. ai-origin-detection
8. zip-analysis
9. sast
10. secret-detection
11. cwe-mapping
12. supply-chain-security
13. eu-ai-act
14. gdpr-compliance
15. obfuscation-detection
16. lockbit-case-study

Per ogni entry: aggiungere blocchi `it` e `zh` in `i18n` con `title`, `metaTitle`, `metaDescription`, `intro`, `byLevel` (livelli principali), `faq`, `glossary`, `cta`. Le altre 16 entries usano fallback EN.

## Fase 3 — Listing pages per tipo

Quattro nuove rotte indicizzabili che raggruppano per `KnowledgeType`:

- `/knowledge/capabilities` — tutte le capability
- `/knowledge/concepts` — tutti i concept
- `/knowledge/integrations` — tutte le integration
- `/knowledge/formats` — tutti i format

Ogni listing page:
- riusa `KnowledgeIndex` filtrato per type
- ha `head()` con title/description/canonical/og dedicati
- emette `CollectionPage` JSON-LD con `hasPart` degli entries
- link reciproci dalla pagina `/knowledge` (chip "Browse by type") e dalle entry detail (breadcrumb "Concepts › entry")

## Fase 4 — Sitemap dinamica

Migrare da `public/sitemap.xml` statico a server route `src/routes/sitemap[.]xml.ts` che enumera:
- rotte statiche pubbliche (landing, install, docs/*, knowledge, knowledge listing)
- tutte le `KNOWLEDGE_ENTRIES` (32 oggi, N domani senza toccare l'XML)
- alternates `hreflang` per le entries con traduzioni IT/ZH

Beneficio: aggiungere una entry = creare il file + registrare in `registry.ts`, sitemap si aggiorna sola.

Conferma utente richiesta prima della migrazione (la regola SEO impone di non rimpiazzare un sitemap esistente senza ok); se OK, eliminiamo il file statico.

## Dettagli tecnici

- Nessuna modifica al tipo `KnowledgeEntry`: le traduzioni vivono già in `i18n.it` / `i18n.zh`.
- Listing pages: route flat `knowledge.capabilities.tsx` ecc., NON nested layout — `/knowledge/$slug` resta indipendente.
- Breadcrumb su detail: aggiornare `KnowledgeContent` per puntare al listing del tipo corretto invece che alla sola `/knowledge`.
- JSON-LD listing: `CollectionPage` + `ItemList` con `position`/`url`/`name` per ogni entry.
- Sitemap dinamica: `Cache-Control: public, max-age=3600`; emettere `xhtml:link rel="alternate" hreflang="..."` per entries con multiple lingue.
- Typecheck dopo ogni fase; nessun cambio a `src/integrations/*`.

## Domanda di conferma

Confermi:
1. Le 16 entries scelte per IT/ZH (o vuoi una lista diversa)?
2. Procedere con la migrazione del sitemap a server route, eliminando `public/sitemap.xml`?

Se non rispondi, procedo con la lista qui sopra e mantengo il sitemap statico aggiornandolo manualmente.
