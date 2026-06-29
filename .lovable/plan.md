# Knowledge Hub — Fasi 2-4 completate

## Fase 2 — Traduzioni IT/ZH
- `src/knowledge/translations.ts`: overlay con IT + ZH per 16 entries top SEO
  (static-malware-analysis, byok, repository-analysis, local-ai, ollama,
  chat-with-code, ai-origin-detection, zip-analysis, sast, secret-detection,
  cwe-mapping, supply-chain-security, eu-ai-act, gdpr-compliance,
  obfuscation-detection, lockbit-case-study).
- `registry.ts` merge overlay nelle entry; le altre 16 restano in fallback EN.

## Fase 3 — Listing pages per tipo
- `/knowledge/capabilities`, `/knowledge/concepts`, `/knowledge/integrations`,
  `/knowledge/formats` con `CollectionPage` JSON-LD.
- Componente condiviso `KnowledgeList`.
- Index hub aggiunge chip "Browse by type".
- Breadcrumb detail punta al listing del tipo corretto.

## Fase 4 — Sitemap dinamica
- Server route `src/routes/sitemap[.]xml.ts` che enumera rotte statiche +
  tutte le `KNOWLEDGE_ENTRIES` (oggi 32, domani N).
- Hreflang automatico per entries con traduzioni IT/ZH.
- Rimosso `public/sitemap.xml`.
