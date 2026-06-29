
## Goal
1. Make it explicit on the homepage that Decoder accepts **single files** (not only ZIP archives).
2. Rationalize the landing page layout so the value proposition, supported inputs, and free-vs-BYOK split are visually clearer on first visit (desktop + mobile).

## Scope
Only `src/routes/index.tsx` (landing) + i18n strings in `src/i18n/locales/{en,it,zh}/common.json`. No backend/business logic changes.

## Changes

### 1. Hero — sharper one-line promise
- Replace the current dense hero subhead with a 2-line structure:
  - **Line 1 (promise):** "AI code analysis for unknown code — paste, drop a file, or upload a repo."
  - **Line 2 (proof):** "Static + malware scan run free. AI explainer & chat unlock with your own key (BYOK)."
- Keep the existing CTA pair (Start free / See how it works) but standardize size and add a thin "No signup for static scan" microcopy under the buttons.

### 2. New "What you can drop in" strip (right under hero)
A single horizontal strip with 3 input modes shown as equal cards, replacing the current scattered mentions:
- **Single file** — `.js .ts .py .java .go .rs .sql …` (20+) — *new, currently missing*
- **ZIP archive** — full folder with structure preserved
- **Git repo URL** — public GitHub/GitLab link

Each card: icon + label + one-line example. This is the visual fix for "manca l'aspetto dei singoli file".

### 3. Rationalize section order
Current order has install-PWA, features, FAQ, contributors scattered. Reorder for funnel clarity:
1. Hero
2. "What you can drop in" (new strip)
3. "What you get" — 4 analysis modes (Static · Malware · AI-origin · Chat) with the free/BYOK badge clearly on each
4. Live demo / screenshot block (existing)
5. Supported languages chip cloud (compact, replaces the long list)
6. Install on your device (PWA)
7. FAQ
8. Contributors
9. Footer

### 4. Branding clarity
- Single H1 (currently fine, just tighten copy).
- Consistent badge component for "Free" vs "BYOK" used everywhere modes are mentioned (hero, modes section, FAQ) so the distinction is instantly readable.
- Reduce gradient/glow density on mobile (the hero currently feels heavy at 375px) by lowering blur opacity below `sm:`.

### 5. i18n
Add keys for the new strip + microcopy in `en`, `it`, `zh`. No key removals.

## Out of scope
- No new routes, no backend, no auth, no actual single-file upload pipeline changes (the projects flow already accepts single files via the same dropzone — this is purely making it visible on the landing).
- No new design system tokens; reuse existing semantic tokens.
- No SEO rescan in this turn (copy changes are minor; titles/descriptions stay).

## Verification
- Visual check at 375px and 1280px via the running preview.
- Confirm `<main>` landmark and single H1 remain.
- Confirm all three locales render without missing keys.
