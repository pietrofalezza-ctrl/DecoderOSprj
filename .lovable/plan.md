# EU Privacy & AI SEO Content Expansion

Create a set of long-form SEO documentation pages aimed at European users, focused on the intersection of **AI code analysis, data privacy, and EU regulation** (GDPR + EU AI Act), with explicit geo-targeting for **Milan, Verona and Northern Italy**. Each page ships in EN / IT / ZH using the existing locale-routing pattern and is wired into the sitemap, internal links, and structured data.

## New routes

All under `src/routes/docs.*` to match existing SEO doc pattern (`docs.comparison-coderabbit`, `docs.ai-code-review-tools-byok`, `docs.open-source-ai-code-review`).

1. **`docs.eu-ai-act-code-analysis.tsx`** — "EU AI Act compliance for AI code analysis tools"
   - What the AI Act says about general-purpose AI, transparency, code-related risk tiers
   - How BYOK + local inference reduce compliance surface
   - Checklist for European dev teams

2. **`docs.gdpr-ai-code-review.tsx`** — "GDPR-compliant AI code review: data residency & source code as personal data"
   - Source code as potential personal data (author identifiers, secrets, comments)
   - Data residency, sub-processors, DPA implications
   - Decoder's posture (encrypted BYOK, no training, ephemeral ZIP processing)

3. **`docs.privacy-first-ai-europe.tsx`** — "Privacy-first AI tools in Europe: a 2026 buyer's guide"
   - Why EU teams pick BYOK / open source / local inference
   - Comparison table: typical SaaS AI vs Decoder approach
   - Links to EU AI projects (Mistral, Aleph Alpha, Silo AI, etc.) as ecosystem context

4. **`docs.ai-code-review-milano-nord-italia.tsx`** — Geo-targeted landing
   - "AI code review per team di sviluppo a Milano, Verona e Nord Italia"
   - Italian-first copy with EN/ZH translations
   - Local schema: mentions Milan/Verona/Padua/Bologna/Turin tech hubs, fintech & manufacturing 4.0 angle
   - LocalBusiness-style framing (without faking a physical address — uses `Organization` + `areaServed` schema)

## i18n

Each page reads strings from `src/i18n/locales/{en,it,zh}/docs.json` (new namespace section per page). Italian copy is primary for the Milan/Nord Italia page; EN and ZH are faithful translations but keep the geographic emphasis.

## SEO wiring per page

Following the existing `head-meta` convention:
- `head()` with route-specific `title`, `description`, `og:title`, `og:description`, `og:url`, `og:type: article`
- Leaf-only `<link rel="canonical">` to `https://decoderead.dev/docs/<slug>`
- JSON-LD: `Article` + `FAQPage` + `BreadcrumbList`; geo page also adds `Organization` with `areaServed: ["Milano","Verona","Lombardia","Veneto","Italia"]`
- `hreflang` alternates (en, it, zh, x-default) via `links`

## Sitemap & internal linking

- Add the 4 new URLs to `public/sitemap.xml` with current `lastmod`
- Update `public/llms.txt` to reference the new guides
- Add a "Related guides" block on each existing docs page (`comparison-coderabbit`, `ai-code-review-tools-byok`, `open-source-ai-code-review`) linking to the new EU/privacy/Italia pages and vice versa
- Add a compact "EU privacy & compliance" link cluster in the landing page footer area

## Keywords targeted

Primary: *EU AI Act code review*, *GDPR AI code analysis*, *privacy-first AI Europe*, *AI code review Milano*, *strumenti AI revisione codice Italia*, *BYOK AI Europa*. Long-tail variants per page (volume realistic for KDI <30, matching the strategy from prior SEO work).

## Out of scope

- No backend/schema changes
- No new tracking, no actual geolocation features
- Not creating a separate domain or subdomain for `.it` — single canonical domain with hreflang

## Files touched (estimate)

- 4 new route files under `src/routes/`
- 3 locale JSON updates (`en/docs.json`, `it/docs.json`, `zh/docs.json`)
- `public/sitemap.xml`, `public/llms.txt`
- 3 existing docs routes — append "Related guides" block

Confirm and I'll build.