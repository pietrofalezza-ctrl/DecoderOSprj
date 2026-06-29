## Problem

On 375px screens the landing page (`/`) scrolls horizontally (~34px overflow) and sections look clipped or stacked under the sticky header. Playwright audit confirmed:

- `docW = 409` vs `winW = 375` → the page itself is wider than the viewport.
- Root cause: `HeroIllustration` uses `max-w-sm` (384px) inside a `px-4` container (available width ≈ 343px). Since the hero grid has no explicit `grid-cols-1` on mobile, the illustration's natural width forces every sibling column to 384px, which is why the eyebrow chips ("PERSONAL PROJECT · OPEN SOURCE"), the providers row ("04. OPENROUTER"), and the hero copy all clip on the right.
- Landing header right cluster (`LangSwitcher + ThemeToggle + PublicHeaderAuthSlot "Get started" + Menu`) is wider than the available header space, pushing the row out and contributing to the overflow.
- The sticky header uses `bg-background/80 backdrop-blur`; on scroll, text bleeds visibly through the translucent bar, which reads as "sections overlap".
- The "AI SOURCE → DECODER → YOU" flow diagram (`landing-bits.tsx`) keeps three boxes + two arrows in a single row at 343px, so labels squeeze together.

Other public routes (`/docs`, `/manifesto`, `/terms`, `/privacy`, `/data-flow`) use the same minimal public header pattern and inherit the same right-cluster crowding, but no horizontal overflow.

## Scope

Frontend / presentation only. No backend or copy changes.

## Changes

1. **Stop the hero from blowing out width** — `src/routes/index.tsx`
   - Add `grid-cols-1` to the hero grid so mobile is explicitly single-column with `minmax(0,1fr)`.
   - Wrap text column with `min-w-0` so flex/grid children can shrink.
   - Constrain `HeroIllustration` wrapper to `max-w-[min(384px,100%)]` (or `w-full max-w-sm` + `min-w-0` on parent) so it never exceeds the viewport.

2. **Tighten the eyebrow / providers rows** — `src/routes/index.tsx`
   - Add `min-w-0` and allow wrapping; reduce mobile font-size or letter-spacing so chips fit at 343px.
   - Ensure no single chip uses `whitespace-nowrap` that exceeds the row.

3. **Fix the public header on mobile** — `src/routes/index.tsx`, and the same pattern in `src/routes/docs.tsx`, `manifesto.tsx`, `terms.tsx`, `privacy.tsx`, `data-flow.tsx`, `cookies.tsx`, `open-source.tsx`, `contact.tsx`, `reset-password.tsx` where applicable
   - Hide `PublicHeaderAuthSlot` CTA below `sm:` (move "Get started" into the hamburger sheet as the primary action) OR render it as an icon-only button on mobile.
   - Keep `LangSwitcher` and `ThemeToggle` visible; ensure the row uses `gap-1` + `shrink-0` for action buttons and `min-w-0 truncate` for the logo wordmark.

4. **Make the sticky header opaque on mobile** — `src/routes/index.tsx`
   - Replace `bg-background/80 backdrop-blur` with `bg-background sm:bg-background/80 sm:backdrop-blur` so mobile gets a solid bar (no bleed-through under the header).

5. **Stack the flow diagram on small screens** — `src/components/landing/landing-bits.tsx`
   - Switch the `flex items-center justify-between` row to `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`, and rotate the arrow glyphs 90° on mobile so the diagram reads top-to-bottom at 375px without crowding.

6. **Verification**
   - Re-run the Playwright overflow audit at 375px: target `docW === winW` and the overflowing-elements list empty.
   - Capture full-height mobile screenshots for `/`, `/docs`, `/manifesto`, `/terms`, `/privacy`, `/data-flow` and confirm no horizontal scroll, header opacity correct, and the diagram stacks cleanly.

## Out of scope

- AppShell (authenticated) routes — already optimized in a prior pass.
- Copy / i18n / typography redesign.
- Tablet (`md:`) breakpoint tuning beyond what's needed to keep existing desktop layout intact.
