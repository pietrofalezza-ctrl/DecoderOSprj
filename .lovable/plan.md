## Problem

On mobile (375px) the repo workspace at `/projects/$projectId/repos/$repoId` renders three resizable horizontal panels side-by-side (File tree 20% + Code 46% + Insights 34%). At 375px each panel collapses to ~50–130px wide, causing the clipped/overlapping UI in the screenshot: file names show "robo…", "pub…", code wraps one token per line, and the Insight panel buttons get truncated ("Esegui analisi su qu…").

The horizontal `ResizablePanelGroup` has no mobile fallback, so even though the AppShell header is mobile-friendly, the workspace body is not.

## Scope

Frontend / presentation only. No business logic, no data flow, no copy changes. File: `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` (the wrapper around the three panels, lines ~943–1735).

## Changes

1. **Mobile detection** — reuse the existing `useIsMobile()` hook from `src/hooks/use-mobile.tsx` (already used elsewhere) to branch the layout below the `md` breakpoint.

2. **Desktop (≥ md)** — keep the current `ResizablePanelGroup` 3-column layout unchanged.

3. **Mobile (< md)** — replace the resizable group with a stacked single-column layout driven by a small segmented control at the top:
   - Segmented tabs: `Files · Code · Insights` (icons + label, sticky just under the AppShell header).
   - Only the selected pane renders full-width (`w-full`, no fixed panel sizes), so the code viewer and insight panel each get the full 375px and stop clipping.
   - Default tab = `Code` when a file is selected, otherwise `Files`.
   - Selecting a file in the `Files` tab auto-switches to `Code`.
   - Triggering an analysis / folder action auto-switches to `Insights` (mirrors what desktop does visually with the third column).

4. **Inner panel tweaks for narrow widths**
   - `FileTree` container: add `min-w-0` and let rows truncate with `truncate` instead of clipping; remove the inherited 20% width assumption on mobile.
   - `CodeViewer` wrapper: keep horizontal scroll for long lines (no forced wrap), but ensure the surrounding flex parents use `min-w-0` so the viewer takes full viewport width.
   - `InsightPanel` action buttons ("Run analysis…", "Configure AI provider", "Add an API key"): allow `whitespace-normal` and `text-left` on mobile so multi-line labels don't get cropped; ensure CTA chips wrap to a second line instead of overflowing.

5. **Verification**
   - Playwright at 375×800 against `/projects/.../repos/...` (using injected Supabase session): confirm `docW === winW === 375`, no horizontal scroll, each of the three tabs shows its pane full-width, and no truncated CTAs.
   - Spot-check at 768px (tablet) that the desktop 3-panel layout is restored.

## Out of scope

- Resizing behaviour on tablet/desktop, panel default sizes, copy, i18n.
- Public landing routes (already optimized in the previous mobile pass).
- AppShell header (already mobile-friendly).
