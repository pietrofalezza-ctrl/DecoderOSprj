## Goal
Slim down the homepage into a focused, mobile-first funnel; move secondary content into dedicated sub-pages and on-demand dialogs; localize the FAQ; and confirm parity between the 3 upload methods (single file / ZIP / Git URL all "free, no key").

## 1. Fix content inconsistencies

**FAQ in English (hardcoded in `src/routes/index.tsx`)**
- Replace the 5 hardcoded `<h3>/<p>` blocks with `t("landing.faq.q1.title/body")` … `q5`.
- Add localized keys to `src/i18n/locales/{en,it,zh}/common.json`.
- Update the JSON-LD `FAQPage` schema (also currently English) to read from `t()` so the structured data matches the rendered language.

**Git URL card showing "BYOK · CHIAVE TUA"**
- The screenshot 2 reflects an outdated build; current card markup no longer renders that badge. Verify after rebuild and force-remove any residual badge logic in `src/routes/index.tsx` for the Git URL card so the three cards are visually and semantically symmetric (upload is always free; AI features are what require a key — already stated in the section footnote).

## 2. Homepage UX rationalization (mobile-first)

Today the landing renders ~10 stacked full-width sections. New structure (top → bottom), max 6 screens on mobile:

```text
1. Hero            — H1 + 1-line subtitle + 2 CTAs (Start · Install app)
2. 3 upload cards  — Single file · ZIP · Git URL  (uniform, no per-card badges)
3. "How it works"  — 3 compact steps, horizontal scroll on mobile
4. Capabilities    — 4 tiles: Static · Malware · AI explain · Chat
                     each tile opens a Dialog with details (was full section)
5. Trust strip     — privacy/BYOK/open-source one-liner + link to /privacy
6. FAQ (4 Q)       — Accordion, localized, "See all" → /docs/faq
```

Sections being **removed from the homepage** and relocated:
- "Install as app" deep band → collapsed into hero CTA + small `/install` page with the full PWA walkthrough.
- "Integrations", "Pricing notes", long capability blurbs, contributors teaser → moved into existing `/docs/*` and `/contributors` pages, linked from a single "Learn more" footer row.
- Long capability section → replaced by 4 tiles whose details live inside an on-tap `<Dialog>` (shadcn) so the page stays short but power-users can drill in.

### New sub-pages / dialogs
- `src/routes/install.tsx` — full PWA install guide (iOS / Android / desktop), pulled out of homepage.
- 4 capability dialogs rendered inline on the homepage via shadcn `Dialog` (no new route): `StaticDialog`, `MalwareDialog`, `AiExplainDialog`, `ChatDialog`. Each has its own short copy + "Open full docs" link.

### Mobile-first rules applied
- All sections use `py-10 sm:py-16`, `px-4 sm:px-6`, max-w-5xl.
- Cards: `grid-cols-1 sm:grid-cols-3`, equal-height, no overflow.
- Hero scales: `text-3xl sm:text-5xl md:text-6xl`, line-height tight, no clipping.
- Capability tiles: 2×2 grid on mobile, 4×1 on desktop, tap target ≥ 48px.
- Dialogs: `max-h-[85vh] overflow-y-auto`, full-width on `< sm`.

## 3. Files touched
- `src/routes/index.tsx` — major reorganization (delete 4 sections, add 4 dialogs, swap hardcoded FAQ for `t()`).
- `src/routes/install.tsx` — new.
- `src/components/landing/CapabilityDialog.tsx` — new (shared dialog shell).
- `src/i18n/locales/{en,it,zh}/common.json` — add `landing.faq.q1..q5`, `landing.capabilities.{static,malware,aiExplain,chat}.{title,short,long}`.

## 4. After build
- Visual QA on 375×667 (iPhone SE) and 768 (tablet).
- Then a fresh SEO pass + publish (your follow-up step).

## Out of scope (per your message)
- No backend changes, no auth/key logic changes, no new analyses.
- SEO re-optimization & publish handled in the next turn.
