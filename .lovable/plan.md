# Mobile Optimization Plan

Goal: make Decoder feel native on phones (375–414px), without touching desktop behavior or business logic. Pure presentation/layout work.

## Issues found (live audit at 390×844)

1. **Landing hero (`src/routes/index.tsx`)**
   - `text-5xl` (48px) headline wraps awkwardly; should be `text-4xl` on mobile, `md:text-7xl` on desktop.
   - `py-20 md:py-28` and `gap-16` are too tall when columns stack — wastes a full screen.
   - Hero "illustration" square stretches to full width and pushes content way down.
   - Provider strip (`01. OPENAI …`) wraps to many lines; needs tighter spacing or 2-col grid on mobile.
2. **Header (`index.tsx`)**
   - Desktop nav is `hidden md:flex` and there is **no mobile menu / hamburger** — users on phones cannot reach Open Source / Manifesto / Docs from the home page.
   - Right side (Lang + Theme + Auth slot) can crowd the logo on 360px.
3. **Section rhythm** — every section uses `py-16` / `py-20`; on mobile this triples scroll length. Should be `py-12 md:py-20`.
4. **Section titles** — `text-4xl md:text-5xl` should start at `text-3xl` on mobile for better line-length.
5. **Guardrail diagram + 3 points grid** — at mobile width the diagram and the long list stack with no breathing rhythm; numbers `01/02/03` collide with icons.
6. **Integrations grid** — `grid-cols-2` is fine but cards have `py-6` and no min-height tuning.
7. **Footer** — nav links wrap to many lines; tap targets are dense.
8. **Other public routes** (`manifesto`, `docs`, `docs.how-to-review-ai-code`, `open-source`, `terms`, `privacy`, `cookies`, `data-flow`, `contact`, `auth`) — spot-check + apply the same hero/section/heading rules where they repeat the landing pattern.
9. **Authenticated app shell** (`AppShell`, `projects.$projectId.*`, `repos.$repoId`, `settings`, `dashboard`) — `FileTree` + `CodeViewer` + `InsightPanel` are the real mobile pain. Need a mobile drawer for the file tree and a tabbed view (Code / Insights / Findings) instead of 3-column layout.

## Changes

### 1. Landing — `src/routes/index.tsx`
- Header: add a mobile hamburger (Sheet from `@/components/ui/sheet`) that opens a drawer with the same nav items. Show on `md:hidden`. Keep Lang/Theme/Auth in the top bar but reduce header `gap-4 → gap-2` and hide auth-slot label on `<sm` if it has text.
- Hero:
  - `py-20 md:py-28` → `py-12 md:py-28`
  - `gap-16` → `gap-10 md:gap-16`
  - `text-5xl md:text-7xl` → `text-4xl sm:text-5xl md:text-7xl`
  - Illustration column: add `hidden sm:flex` or shrink with `max-w-sm mx-auto` on mobile so it doesn't dominate.
  - Provider strip: `gap-x-8 → gap-x-5`, allow `text-[10px]` on mobile.
- Buttons row: `gap-6 → gap-4`; make primary CTA full-width on `<sm` (`w-full sm:w-auto`).
- OS strip / Guardrail / Why-now / How / Integrations / Values / Community: change every `py-16` / `py-20` to `py-12 md:py-20` and every `text-4xl md:text-5xl` to `text-3xl md:text-5xl`.
- Footer nav: switch outer flex to `gap-y-2 gap-x-5` and ensure links have `py-1` for tap area.

### 2. Landing bits — `src/components/landing/landing-bits.tsx`
- `Step`, `WhyNowCard`, `CommunityCard`, `Value`: tighten `p-*` on mobile, ensure icons + headings stack cleanly. Verify `GuardrailDiagram` scales (set `max-w-full` and overflow-x-auto wrapper if it relies on fixed width).

### 3. Other public routes
- Apply the same heading/section padding rules to `manifesto.tsx`, `docs.tsx`, `docs.how-to-review-ai-code.tsx`, `open-source.tsx`, `terms.tsx`, `privacy.tsx`, `cookies.tsx`, `data-flow.tsx`, `contact.tsx`, `auth.tsx`. No copy changes.
- Verify long text blocks use `prose prose-sm md:prose-base` or equivalent (no horizontal scroll, no `whitespace-nowrap` on long lines).

### 4. Authenticated app shell
- `AppShell`: header collapses to icon-only on mobile; ensure logo + lang + theme + user menu fit on 360px.
- `projects.$projectId.repos.$repoId.tsx`:
  - On `<md`: render a **mobile layout** — top bar with a "Files" button that opens `FileTree` in a `Sheet` from the left, and the main content uses a `Tabs` with `Code`, `Insights`, `Findings` instead of the 3-column desktop layout.
  - Keep desktop layout untouched behind `md:` breakpoint.
- `CodeViewer`: ensure horizontal scroll inside the panel only, not the whole page (`overflow-x-auto`, `min-w-0` on parents).
- `FindingsList` / `InsightPanel` / `FolderAnalysisPanel`: confirm cards use `min-w-0`, `break-words`, and stack on mobile.
- `settings.tsx`, `dashboard.tsx`, `projects.$projectId.index.tsx`: switch any multi-column grids to single column under `md:`.

### 5. Global touch & viewport polish
- `src/styles.css`: ensure body has `overflow-x: hidden` only if needed; add `:where(button, a) { touch-action: manipulation; }` and a minimum 40px tap target for icon buttons in headers.
- Confirm `__root.tsx` already sets `<meta name="viewport" content="width=device-width, initial-scale=1" />` (it does via TanStack default — verify).

### 6. QA
- After edits, capture screenshots at 390×844 for: `/`, `/manifesto`, `/docs`, `/open-source`, `/auth`, `/_authenticated/projects/:id/repos/:id` (mock state if needed).
- Verify no horizontal scroll anywhere and tap targets ≥ 40px.

## Out of scope
- Copy / translation changes.
- Visual redesign (palette, fonts, motion).
- Desktop layout changes (every change is `md:` gated).
- Backend, auth, analysis logic.

## Files touched
`src/routes/index.tsx`, `src/components/landing/landing-bits.tsx`, `src/routes/{manifesto,docs,docs.how-to-review-ai-code,open-source,terms,privacy,cookies,data-flow,contact,auth}.tsx`, `src/components/AppShell.tsx`, `src/routes/_authenticated/{dashboard,settings,projects.$projectId.index,projects.$projectId.repos.$repoId,projects.$projectId}.tsx`, `src/components/{FileTree,CodeViewer,InsightPanel,FindingsList,FolderAnalysisPanel}.tsx`, `src/styles.css`.
