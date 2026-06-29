# Knowledge Hub per Decoder

Obiettivo: trasformare le funzionalità di Decoder in una base di conoscenza navigabile, indicizzabile e comprensibile da LLM. Non è un blog, non è "news": è documentazione semantica che funge da landing page autonoma per ogni concetto.

## 1. Analisi dell'architettura attuale

Oggi Decoder ha:
- Routes `docs.*` flat (es. `docs.comparison-coderabbit.tsx`, `docs.it.gdpr-revisione-codice-ai.tsx`) — copre articoli SEO ad hoc, multilingua tramite prefisso nel filename.
- Nessuna entità "concetto/feature" centralizzata: ogni pagina è un .tsx scritto a mano → difficile generare automaticamente, difficile mantenere coerenza e knowledge graph.
- Sitemap statica in `public/sitemap.xml` aggiornata a mano.
- i18n JSON unico (`common.json`) per UI strings, non per contenuti lunghi.

**Decisione progettuale chiave**: il Knowledge Hub NON deve essere una collezione di `.tsx` scritti a mano. Deve essere **data-driven**: ogni pagina è derivata da un oggetto strutturato. Questo abilita:
- generazione automatica di nuove pagine
- knowledge graph coerente (i link sono dati, non hardcoded)
- livelli di lettura (stessa entità, contenuto diverso)
- multilingua scalabile
- sitemap, schema.org, breadcrumb generati

## 2. Tassonomia proposta

Tre tipi di entità interconnesse:

1. **Capabilities** — funzionalità di Decoder (Static Malware Analysis, BYOK, Repository Analysis, Local AI, Chat, AI Origin Detection, …)
2. **Concepts** — concetti tecnici trasversali (Entropy, PE Header, Zip Slip, RLS, BYOK pattern, Static vs Dynamic, LLM Prompting, …)
3. **Integrations** — provider/runtime (Ollama, OpenRouter, Lovable AI Gateway, GitHub, Supabase Auth, …)

Una quarta dimensione orizzontale: **Formats/Languages** (PowerShell, Python, JS, Java, ZIP, PE binary, …) — modellati come tag, non come pagine separate di default, ma con landing dedicate per i top 6-8 (alta intent SEO: "come analizzare file PowerShell", "cos'è un file ZIP").

## 3. Struttura URL

```text
/knowledge                              Hub index + search + filtri
/knowledge/capabilities                 lista capabilities
/knowledge/concepts                     lista concetti
/knowledge/integrations                 lista integrazioni
/knowledge/formats                      lista formati/linguaggi
/knowledge/<slug>                       pagina entità (slug univoco globale)
/knowledge/it/<slug-it>                 versione italiana
/knowledge/zh/<slug>                    versione cinese
```

Esempi:
- `/knowledge/static-malware-analysis`
- `/knowledge/byok`
- `/knowledge/entropy`
- `/knowledge/ollama`
- `/knowledge/powershell-analysis`
- `/knowledge/it/analisi-statica-malware`

Slug univoci globalmente (no collisioni tra capability/concept), permette knowledge graph piatto. La categoria appare nel breadcrumb, non nell'URL — mantiene URL corti e shareable, e ne abilita la ricategorizzazione senza redirect.

Livelli di lettura via **search param** `?level=junior|dev|senior|security|cto|beginner` (default: `dev`). Mantiene un solo URL canonico per pagina (no duplicate content), ma permette deep-link a un livello.

## 4. Modello dati (TypeScript)

File: `src/knowledge/entries/*.ts` — un file per entità, type-safe.

```ts
type Level = "beginner" | "junior" | "dev" | "senior" | "security" | "cto";
type Lang = "en" | "it" | "zh";

interface KnowledgeEntry {
  slug: string;                          // globalmente unico
  type: "capability" | "concept" | "integration" | "format";
  category: string;                      // es. "Analysis", "Privacy", "Runtime"
  tags: string[];                        // formati, linguaggi, provider, livelli tecnici
  related: string[];                     // slug di altre entry → knowledge graph
  screenshot?: string;                   // path src/assets
  i18n: Record<Lang, {
    title: string;
    metaTitle: string;                   // SEO title <60 char
    metaDescription: string;             // <160 char
    intro: string;
    byLevel: Partial<Record<Level, {     // contenuto cambia REALMENTE per livello
      whatItIs: string;
      whyUseful: string;
      howDecoderImplements: string;
      whenToUse: string;
      whenNotToUse: string;
      practicalExample: string;
    }>>;
    faq: { q: string; a: string }[];
    glossary: { term: string; definition: string }[];
    cta: { label: string; href: string };
  }>;
}
```

Validazione con zod in build/dev → impossibile pubblicare entry rotte.

## 5. Knowledge graph

`related` è esplicito ma:
- **Inverso automatico**: se A → B, allora B mostra A in "Related" (calcolato a build time).
- **Per-tag**: pagine che condividono tag appaiono come "Related by topic".
- **Per-category**: navigazione laterale per categoria.

Visualizzazione: nel footer di ogni pagina una sezione "Related concepts" con 4-8 card. Una pagina hub `/knowledge/graph` (opzionale fase 2) mostra il grafo D3/visx.

## 6. Routes TanStack

Approccio data-driven, no esplosione di file:

```text
src/routes/knowledge/
  route.tsx                              layout + search/filtri header
  index.tsx                              hub home (search, filtri, top entries)
  $slug.tsx                              pagina EN per slug
  it.$slug.tsx                           pagina IT
  zh.$slug.tsx                           pagina ZH
  capabilities.tsx                       lista filtrata type=capability
  concepts.tsx
  integrations.tsx
  formats.tsx
```

`$slug.tsx` legge `KNOWLEDGE_BY_SLUG[slug]` (importato staticamente, tree-shakable), genera head, JSON-LD, breadcrumb, contenuto livello-aware, related.

Sitemap dinamica: nuova route `src/routes/sitemap[.]xml.ts` che enumera tutte le entry + lingue + alternates hreflang. Sostituisce (con conferma user) `public/sitemap.xml` per le rotte knowledge (le altre rimangono).

## 7. Funzionalità (fase 1)

1. **Search interna** lato client: indice Fuse.js su titoli, intro, FAQ, glossary, tags. Tasto `/` per aprire.
2. **Filtri**: type, category, tag (formato/lingua/provider), livello tecnico.
3. **Selettore livello** persistente in localStorage + override via `?level=`.
4. **Selettore lingua** integrato col `LangSwitcher` esistente.
5. **SEO completa per pagina**: meta title/description, canonical, OG, Twitter, hreflang alternates, breadcrumb JSON-LD, `Article` + `FAQPage` + `DefinedTerm` (glossary) schemas.
6. **CTA finale** contestuale (es. "Prova Static Analysis ora" → `/dashboard`).

## 8. Contenuti iniziali (seed)

12 capabilities + 10 concepts + 4 integrations + 6 formats = **32 entries** × 3 lingue.
Per evitare contenuto sciatto: stesura iniziale in EN per tutte; IT/ZH solo per le top 12 ad alta intent (resto fallback EN con `hreflang` corretto e nessuna pagina duplicata). Espansione progressiva.

Livelli: scrivere `dev` (default) per tutte; `beginner` + `security` per le top 10; altri livelli on-demand. Il selettore mostra solo i livelli disponibili per quella entry.

## 9. "Generazione futura"

Quando si aggiunge una feature a Decoder:
1. Si crea `src/knowledge/entries/<slug>.ts` (template via `bun run scripts/new-knowledge-entry.ts <slug>`).
2. Lo script propone automaticamente: `related` candidati (per tag overlap), FAQ stub, glossary stub.
3. Validazione zod + build aggiorna sitemap, search index, knowledge graph.

Niente generazione runtime via LLM (rischio allucinazioni in pagine indicizzate); l'LLM può essere usato off-line dal manutentore per draft, ma il commit è statico e revisionato.

## 10. Cosa NON faccio in fase 1

- Niente grafo D3 interattivo (rinviato).
- Niente generazione contenuti via LLM a runtime.
- Niente migrazione delle `docs.*` esistenti: restano live, aggiungo internal links bidirezionali tra `docs/*` rilevanti e nuove `knowledge/*` (es. la pagina docs "comparison-coderabbit" linka a `knowledge/byok`, `knowledge/static-malware-analysis`).
- Nessuna nuova tabella DB: tutto statico.

## 11. Navbar

Aggiungo voce "Knowledge" in `AppShell.tsx` (autenticato) e nell'header pubblico, accanto a Docs. Docs resta per articoli long-form/comparativi; Knowledge è la base strutturata.

## 12. Sezioni dettagli tecnici

- **Routing/SSR**: ogni `$slug.tsx` definisce `head()` con title/description/canonical/og/twitter/JSON-LD; hreflang alternates puntano alle versioni `it`/`zh` se l'entry le ha.
- **Performance**: entries importati staticamente, code-splitting per route. Search index pre-buildato e lazy-loaded (~50KB gzip).
- **Validazione build**: script `scripts/validate-knowledge.ts` eseguito in CI — verifica slug unici, `related` esistenti, lunghezze meta, immagini esistenti.
- **Accessibilità**: heading hierarchy h1>h2>h3, ARIA su filtri, focus management nella search.

## 13. Deliverable fase 1

- `src/knowledge/` (types, registry, 32 entries seed, validate script, new-entry script)
- `src/routes/knowledge/*` (layout, index, $slug, it.$slug, zh.$slug, listing per type)
- `src/components/knowledge/*` (SearchPalette, FilterBar, LevelSwitcher, RelatedGrid, GlossaryList, FAQList)
- `src/routes/sitemap[.]xml.ts` dinamica + rimozione URL knowledge da `public/sitemap.xml`
- Navbar updates in `AppShell.tsx` + header pubblico
- Aggiornamento `robots.txt` (nessuna disallow su `/knowledge`)
- i18n keys per chrome UI (search placeholder, filtri, labels livelli) in `common.json` × 3 lingue

Stima: prima PR — scaffolding + 8 entries seed in EN, navbar, search, sitemap dinamica. PR successive: espansione contenuti, IT/ZH, livelli aggiuntivi.

Confermami se questa tassonomia (capability/concept/integration/format) e la struttura URL `/knowledge/<slug>` (slug globale, categoria nel breadcrumb) ti convince, oppure preferisci URL categorizzati tipo `/knowledge/capabilities/static-malware-analysis`. Procedo poi con la prima PR di scaffolding + 8 entry seed.