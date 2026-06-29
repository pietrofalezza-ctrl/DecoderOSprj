## Goal

Publish two new SEO-targeted documentation pages and strengthen internal SEO linking + structured data across the docs cluster.

## New routes

1. **`src/routes/docs.ai-code-review-tools-byok.tsx`**
   - Target keyword: **"AI code review tools BYOK"** (low-competition, high-intent)
   - Angle: why BYOK matters (cost control, key sovereignty, model choice), how Decoder implements it (OpenRouter/OpenAI/Anthropic/Gemini + local Ollama/LM Studio), comparison vs CodeRabbit (no BYOK, SaaS-only pricing) and Greptile (SaaS, no BYOK on standard plans).
   - Sections: What is BYOK · Why BYOK for code review · Decoder's BYOK model · Side-by-side table (Decoder / CodeRabbit / Greptile) · Setup walkthrough · FAQ.

2. **`src/routes/docs.open-source-ai-code-review.tsx`**
   - Target keyword: **"open source AI code review"** (~400/mo, KD ~25)
   - Angle: open-source positioning + local inference (Ollama, LM Studio), zero-egress workflow, self-host story, comparison vs closed SaaS (CodeRabbit, Greptile).
   - Sections: Why open source matters for code review · Local inference setup · Privacy/compliance (no code leaves your machine) · Comparison table · Quickstart · FAQ.

## Structured data per page

Each page emits:
- `Article` JSON-LD (headline, author=Decoder, datePublished, mainEntityOfPage canonical)
- `FAQPage` JSON-LD (5–6 Q&As)
- `BreadcrumbList` JSON-LD (Home → Docs → Page)
- `SoftwareApplication` reference linking back to the app (only on BYOK page, where the offer is most relevant)

Plus per-route `head()` with title, description, og:title/description/url, canonical (self-referencing leaf).

## Internal linking

- Add a **"Related guides"** block at the bottom of:
  - `docs.comparison-coderabbit.tsx` (existing) → link the two new pages
  - `docs.ai-code-review-tools-byok.tsx` → link to comparison + open-source page
  - `docs.open-source-ai-code-review.tsx` → link to comparison + BYOK page
  - `contributors.tsx` → link to comparison page (community + OSS narrative)
- Add a **"Learn more"** footer/section in landing `index.tsx` (or existing docs CTA) pointing to all three docs pages — single-line link list, no layout change.
- Use `<Link to=...>` (TanStack) for all internal links; descriptive anchor text matching target keywords.

## Sitemap

Add both new routes to `public/sitemap.xml` with `changefreq=monthly`, `priority=0.8`.

## Files touched

- **Create**: `src/routes/docs.ai-code-review-tools-byok.tsx`, `src/routes/docs.open-source-ai-code-review.tsx`
- **Edit**: `src/routes/docs.comparison-coderabbit.tsx` (Related guides block), `src/routes/contributors.tsx` (one inline link), `src/routes/index.tsx` (Learn more links), `public/sitemap.xml`

## Out of scope

- No copy changes to landing hero / pricing
- No new i18n keys (docs pages are EN, consistent with existing `comparison-coderabbit`)
- No design system changes — reuse existing Tailwind tokens and shadcn components from the comparison page
