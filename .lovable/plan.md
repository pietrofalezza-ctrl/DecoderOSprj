
# Knowledge Engine for Decoder

Trasformare il Knowledge Hub (oggi 32 entries statiche in `src/knowledge/entries/*.ts`) in un **Knowledge Engine**: ogni nuova funzionalità, provider, formato o PR genera **proposte di contenuto revisionabili**, mai pubblicate in automatico.

Include anche un fix UX: da ogni pagina `/knowledge/*` si deve poter tornare alla homepage (header con logo + link "Home").

---

## 1. Architettura attuale (punto di partenza)

- `src/knowledge/types.ts` → tipi `KnowledgeEntry`, `KnowledgeType`, `KnowledgeLang`.
- `src/knowledge/entries/*.ts` → 32 entries hard-coded.
- `src/knowledge/registry.ts` → merge translations + grafo backlinks.
- Rotte: `knowledge.index.tsx`, `knowledge.$slug.tsx`, listing per type.
- Sitemap dinamica `src/routes/sitemap[.]xml.ts`.
- DB Supabase con `profiles`, `user_roles`, RLS, `has_role('admin')`.

Limite: tutto è statico → ogni nuovo contenuto richiede commit manuale e non c'è separazione tra **bozza / revisione / pubblicato**, né collegamento con PR GitHub o changelog.

---

## 2. Modello dati (Supabase, gestito da admin)

Tabelle nuove in `public` (tutte con `GRANT` + RLS: SELECT pubblico solo se `status = 'published'`, scrittura solo admin):

```text
knowledge_entries
  id uuid pk, slug text unique, type knowledge_type,
  status entry_status,            -- ai_draft | in_review | published | archived
  source entry_source,            -- manual | pr | changelog | codebase_scan | user_doc
  source_ref jsonb,               -- {pr_number, commit_sha, file_paths[], repo}
  lang_default text,              -- 'en'
  created_by uuid, reviewed_by uuid, published_at timestamptz,
  priority int, seo_impact int, doc_impact int, difficulty int,
  created_at, updated_at

knowledge_translations
  entry_id fk, lang ('en'|'it'|'zh'),
  title, summary, body_md, faq jsonb, glossary jsonb,
  meta_title, meta_description, og_image, keywords text[]
  UNIQUE(entry_id, lang)

knowledge_edges               -- knowledge graph
  from_entry fk, to_entry fk, relation text,  -- related|prereq|implements|alternative
  weight numeric, auto_generated bool
  PK(from_entry,to_entry,relation)

knowledge_opportunities       -- gap analysis queue
  id, kind text,               -- missing_page|missing_faq|missing_link|long_tail|stale
  title, rationale, suggested_slug, suggested_type,
  related_entries uuid[], keywords text[],
  priority, seo_impact, doc_impact, difficulty, eta_minutes,
  status ('open'|'accepted'|'dismissed'|'converted'),
  generated_from jsonb,        -- {pr, files, scan_id}
  created_at

knowledge_sources             -- raw ingest: PR, README, changelog, user docs
  id, kind, ref, payload jsonb, sha, ingested_at

knowledge_audit               -- editorial log (who approved what)
  id, entry_id, actor, action, diff jsonb, at
```

Enum: `entry_status`, `entry_source`, `knowledge_type` (esistente: capability|concept|integration|format).

Le 32 entries statiche restano come **seed** in una migration (`status = 'published'`, `source = 'manual'`). Il loader runtime fa merge: DB published > seed file.

---

## 3. Tassonomia & URL

Estendere `KnowledgeType` con `case_study` e `guide` (long-tail). Mantenere URL piatto e canonico:

```text
/knowledge                      → index
/knowledge/<type>               → listing per tipo
/knowledge/<slug>               → entry (lang via i18n, hreflang alternates)
/knowledge/opportunities        → admin-only, gap analysis
/knowledge/drafts               → admin-only, queue editoriale
```

Slug regole: kebab-case, max 60 char, prefisso semantico opzionale (`format-pe-file`, `concept-entropy`). Hreflang generato automaticamente da `knowledge_translations`.

---

## 4. Workflow editoriale

```text
[trigger] → generate proposal (AI) → opportunity row
                                       │ admin accepts
                                       ▼
                          knowledge_entries (status=ai_draft)
                                       │ admin edits + reviews
                                       ▼
                                  in_review
                                       │ admin publishes
                                       ▼
                                  published  → sitemap + graph rebuild
```

Trigger:
1. **PR webhook** (`/api/public/hooks/github-pr`): firma HMAC, riceve PR mergiate, classifica diff (feat/fix/dep/format/security/ux/arch) e crea opportunità.
2. **Changelog/README scan** (cron giornaliero, server fn admin): legge `CHANGELOG.md`, release notes, `README.md`.
3. **Codebase scan** (cron settimanale): scopre nuovi provider in `src/lib/ai-providers*`, nuovi formati in `src/lib/static-analysis*`, nuove rotte → opportunità.
4. **Manual seed** da admin UI (incolla URL/Markdown/testo).
5. **User-uploaded docs** (opt-in per progetto pro futuro).

Ogni entry mostra badge: `Bozza AI` / `In revisione` / `Pubblicata`. Pagine non-published NON entrano in sitemap, hanno `noindex`.

---

## 5. Knowledge Graph

`knowledge_edges` mantenuto da:
- **Author-defined** (campo `related` nella entry, come oggi).
- **Auto edges** generati da:
  - co-occorrenza di keyword/glossary terms,
  - same `type` + tag sovrapposti,
  - menzioni esplicite (`[[slug]]`) nel body.
- Edge `weight` ricalcolato a ogni publish; backlinks bidirezionali serviti dal loader.

API interna `getGraph(slug, depth=2)` per render di "Related" e per JSON-LD `mentions`/`isPartOf`.

---

## 6. Generazione contenuti (AI-assisted, mai auto-publish)

Server function admin `proposeContentFromPR(prNumber)`:
1. Fetch PR via GitHub API (token in secret).
2. Estrae diff, file list, descrizione, commit messages.
3. Prompt Lovable AI Gateway (`google/gemini-3-flash-preview`) con schema strutturato Zod che produce:
   - `entries[]` (slug, type, title, summary, body_md, faq, glossary, keywords, related_slugs, meta, og, breadcrumb, schema_org)
   - `opportunities[]` long-tail
4. Salva come `knowledge_opportunities` (mai pubblicato).

Stessa pipeline per: codebase scan, changelog, doc upload. Modulo unico `src/lib/knowledge-engine/*.functions.ts`.

Regole anti-fluff nel system prompt: niente contenuti riempitivi, ogni FAQ deve avere risposta verificabile dal diff, citare file/commit di origine. Se confidence < soglia → opportunità ma non bozza pronta.

---

## 7. Long-tail & Content Gap Analysis

Job `generateOpportunities()` (cron settimanale + on-demand):
- per ogni entry published, chiede all'AI 5-15 sotto-argomenti long-tail (con keyword research locale: incrocia `keywords` esistenti).
- per ogni keyword tracciata in SEO findings non coperta → opportunità.
- per ogni edge mancante atteso (es. format senza link a capability che lo usa) → opportunità `missing_link`.

Admin UI `/knowledge/opportunities`: tabella ordinabile per `priority * seo_impact / difficulty`, azioni: **Accept → AI draft**, **Dismiss**, **Promote to entry**.

---

## 8. Pipeline PR (dettaglio)

```text
GitHub PR merged
   │ webhook → /api/public/hooks/github-pr (HMAC verify)
   ▼
knowledge_sources insert (raw)
   │ enqueue job
   ▼
classifyDiff() → labels: [feat, fix, dep, format, security, ux, arch]
   │
   ▼
for each label → proposeContent(label, prContext)
   │
   ▼
knowledge_opportunities + (optional) knowledge_entries(status=ai_draft)
   │
   ▼
notify admin (in-app + email via existing queue)
```

Idempotente per `pr_number + sha`. Storico mostrato in `/contributors` (già esistente).

---

## 9. SEO, LLM-friendly, Multilingua

Ogni entry pubblicata emette (già parzialmente esistente, da estendere):
- `<title>`, meta description, canonical, OG, Twitter, BreadcrumbList, Article, FAQPage, DefinedTermSet (glossary), `mentions` con i nodi del grafo.
- Hreflang EN/IT/ZH; fallback EN se manca traduzione, con tag `noindex` sulla variante non tradotta.
- Sitemap dinamica già pronta → aggiungere filtro `status=published` + `lastmod` da `updated_at`.
- LLM-friendly: heading semantici, sezione "Definitions", "FAQ", "Related concepts", esempi con code-fence linguaggio dichiarato.

---

## 10. UI

Pubbliche:
- `/knowledge` index: aggiungere **header globale con logo Decoder cliccabile (→ "/")** e link "Home", "Docs", "App". Risolve il problema "da knowledge non si torna in home".
- Pagina entry: breadcrumb `Home / Knowledge / <Type> / <Title>` (Home già nuovo, non solo Knowledge).

Admin (`_authenticated` + `has_role('admin')`):
- `/admin/knowledge` dashboard: counts per status, ultime PR processate.
- `/admin/knowledge/opportunities` tabella con scoring.
- `/admin/knowledge/drafts` editor markdown con preview, diff vs published, pulsanti Approve/Publish, multilingua side-by-side.
- `/admin/knowledge/graph` visualizer (force-directed semplice) per ispezione.

---

## 11. Sicurezza

- Webhook GitHub: HMAC SHA-256 con secret `GITHUB_WEBHOOK_SECRET` (da chiedere), timing-safe compare, replay window 5 min.
- Tutte le server fn di scrittura: `requireSupabaseAuth` + `has_role('admin')`.
- RLS pubblico: SELECT solo `status='published'`.
- AI calls server-side via `LOVABLE_API_KEY` (già presente).
- Audit log immutabile (`knowledge_audit`, no UPDATE policy).

---

## 12. Roadmap implementativa (fasi piccole, ognuna revisionabile)

**Fase A — Fondamenta (questa milestone, ~1 turno):**
- Migration: enum + tabelle `knowledge_entries/_translations/_edges/_opportunities/_sources/_audit` con GRANT/RLS/policy.
- Seed delle 32 entries esistenti in DB (status=published).
- Loader unificato `src/knowledge/registry.ts` legge DB published + fallback seed file; sitemap usa DB.
- Header globale su tutte le pagine `/knowledge/*` con link Home (fix richiesto).

**Fase B — Admin UI base:**
- `/admin/knowledge` dashboard + drafts list + editor + publish flow + audit log viewer.
- Badge "Bozza AI / In revisione / Pubblicata".

**Fase C — AI proposal engine:**
- `proposeContentFromText()` server fn admin (incolla testo → bozza).
- `generateOpportunities()` cron + on-demand.
- `/admin/knowledge/opportunities`.

**Fase D — PR pipeline:**
- Webhook `/api/public/hooks/github-pr` con HMAC.
- `classifyDiff` + `proposeContentFromPR`.
- Notifiche email/in-app.

**Fase E — Graph & long-tail:**
- Edges auto-generati + ricalcolo al publish.
- Generatore long-tail con anti-fluff guardrails.
- `/admin/knowledge/graph`.

**Fase F — Multilingua AI:**
- Traduzione IT/ZH on-demand per ogni entry, sempre in bozza.

---

## 13. Cosa NON faccio (per scelta esplicita)

- Nessuna pubblicazione automatica.
- Nessun blog generico: solo contenuti ancorati a feature/PR/codebase.
- Nessuna duplicazione delle 32 entries esistenti: migrate, non riscritte.
- Nessuna modifica al modello AI per le funzioni utente esistenti.

---

## 14. Conferme richieste prima di partire

1. OK a procedere con **Fase A** ora (migration + loader DB + fix header Home) e pianificare B–F nei turni successivi?
2. GitHub webhook: hai un repo (owner/name) di riferimento e vuoi che io chieda subito `GITHUB_WEBHOOK_SECRET` e `GITHUB_TOKEN`, o lo facciamo in Fase D?
3. Le 32 entries seed → migrare a DB e renderle editabili da admin (consigliato), o tenerle read-only come "core" e usare DB solo per i nuovi contenuti?
