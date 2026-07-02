
# India + Sri Lanka SEO expansion

Goal: build traction from India and Sri Lanka by shipping localized, geo-targeted, and topically-relevant SEO pages, plus wiring the i18n and infrastructure to support Hindi (hi) and Tamil (ta).

## Scope (12 new pages)

### English pages (region-focused, 6)
1. `/docs/ai-code-review-india` — regional hub. Angle: BYOK saves cost, works with any provider, no vendor lock-in.
2. `/docs/dpdp-act-ai-code-analysis` — India's Digital Personal Data Protection Act 2023 compliance angle (parallel to existing GDPR page).
3. `/docs/ai-code-review-outsourcing` — auditing AI-generated code from outsourcing vendors / agencies.
4. `/docs/ai-code-review-bangalore` — geo page (Bangalore/Bengaluru IT hub).
5. `/docs/ai-code-review-hyderabad-chennai` — geo page (Hyderabad + Chennai IT corridors).
6. `/docs/ai-code-review-sri-lanka-colombo` — Sri Lanka + Colombo tech scene, DPA 2022 mention.

### Hindi pages (3, `/docs/hi.*`)
7. `/docs/hi/ai-code-review-bharat` — Hindi hub, BYOK + costo basso.
8. `/docs/hi/dpdp-act-code-analysis` — DPDP Act in Hindi.
9. `/docs/hi/open-source-ai-code-review` — free/OSS angle in Hindi.

### Tamil pages (3, `/docs/ta.*`)
10. `/docs/ta/ai-code-review-chennai` — Tamil, Chennai focus.
11. `/docs/ta/dpdp-act-code-analysis` — DPDP in Tamil.
12. `/docs/ta/open-source-ai-code-review` — OSS angle in Tamil.

## Content angles per page

- **BYOK / low cost**: emphasize free static + malware scan (no key required), and that BYOK means devs pay $0 platform fee — only their own model usage. Compare vs SaaS AI reviewers charging per seat in USD.
- **Outsourcing**: audit AI-generated code from vendors, detect Copilot/Cursor/Claude patterns, ensure IP hygiene before delivery.
- **DPDP Act**: local-first / BYOK means data never leaves the developer's machine (or their chosen provider), aligning with data-minimization obligations. Not legal advice.
- **Geo pages**: name the local IT hubs, universities, dev communities; hreflang + region-appropriate schema.

## Technical work

### i18n
- Add `hi` and `ta` to `SUPPORTED_LANGUAGES` in `src/i18n/index.ts`.
- Create `src/i18n/locales/hi/common.json` and `src/i18n/locales/ta/common.json` — start as copies of `en` and translate only the strings shown on the new pages + shared nav/footer (full app translation is out of scope for this pass; existing text falls back to English via i18next).
- Add hi/ta to `LangSwitcher`.

### Head/SEO per page
- Each page: unique `title`, `description`, `og:*`, self-referencing `canonical` and `og:url`.
- **hreflang links** on the region-hub pages linking EN ↔ HI ↔ TA counterparts + `x-default`.
- JSON-LD: `Article` + `FAQPage` + `BreadcrumbList`. Geo pages add `Place` / `areaServed` on an inline Organization mention.
- Extend `Organization` schema in `__root.tsx` `areaServed` (currently Northern Italy) to also include India and Sri Lanka.

### Sitemap
- Add all 12 new routes to `src/routes/sitemap[.]xml.ts`. Include `<xhtml:link rel="alternate" hreflang="…">` blocks in the sitemap for the hreflang clusters (upgrade the `urlset` xmlns to include xhtml).

### Robots
- No changes required.

## Design & UX

- Reuse existing docs page shell (see `docs.eu-ai-act-code-analysis.tsx`, `docs.ai-code-review-milano-nord-italia.tsx` as templates) — same header, breadcrumb, TOC, FAQ accordion.
- No new components. No new colors/fonts. Mobile-first (already covered by existing shell).
- Internal linking: each new page links to `/docs`, `/knowledge`, `/manifesto`, and 2–3 sibling India/SL pages. Add a small "India & Sri Lanka" cluster block on `/docs/index` (or `docs.tsx`) linking the 6 EN pages.

## Out of scope (call out explicitly)

- Full app translation into Hindi/Tamil — only nav, footer, hero snippets, and the new pages get localized copy. Rest falls back to English.
- Paid promotion, backlink outreach, Product Hunt / Reddit posts for these markets.
- Currency/pricing UI changes (Decoder is free; no INR/LKR pricing needed).

## Deliverables checklist

- [ ] 12 new route files
- [ ] `hi` + `ta` locales added, `LangSwitcher` updated
- [ ] `Organization.areaServed` extended to include IN + LK
- [ ] Sitemap updated with hreflang alternates
- [ ] "India & Sri Lanka" link cluster on `/docs`
- [ ] Build passes; run existing SEO scan after ship

## Realistic outcome

New geo/language pages typically take 2–4 months to gain traction in Google. Expect the DPDP + outsourcing angles to rank fastest (low competition, clear intent); geo pages are slower but sticky. Hindi/Tamil SERPs have less English-language competition, so even modest content can rank if hreflang is set correctly.
