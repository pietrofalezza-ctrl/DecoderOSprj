# Decoder — Summary ↔ Code Mapping UX

Refactor the workspace so every AI insight is visibly tied to a code range, with a richer card-based right panel, gutter markers, selection toolbar, and patch backlinks. Keep all existing analyses working.

## Scope summary

1. Extend the data model so every insight carries `category`, `severity`, `title`, `explanation`, optional `suggested_action`, optional line range, and a `confidence` flag — plus a parallel `unmapped_insights` list for file-level points.
2. Redesign the right panel as scrollable insight cards with badges, line ranges, severity, expand/collapse, and action buttons (Show in code / Explain this / Suggest comment / Create patch).
3. Add an "Insights outline" header above the tabs with totals, mapped vs unmapped counts, and quick category filters.
4. Upgrade `CodeViewer` to support persistent active-insight highlighting, color-coded category gutter markers (clickable + tooltip + stacking), a floating label near the highlighted block, and a contextual toolbar on manual line selection.
5. Wire patch generation to remember the originating insight, expose Insight / Diff / How to apply tabs, and show "Patch generata da questo insight" backlink copy.
6. Add loading-state progress copy and an explicit "file-level" empty state when no mapping exists.
7. Full i18n for all new strings in IT / EN / ZH; preserve dark/light themes and accessibility (text + color badges, aria, keyboard nav).

## Carried over from previous turns

- Keep `LOVABLE_API_KEY` as opt-in hosted provider (off by default, gated by `ALLOW_HOSTED_LOVABLE_AI`) — no further change unless requested.
- BYOK GRANTs migration already applied; no follow-up needed.

## Technical details

### Data model (`src/lib/findings.ts` + new `src/lib/insights.ts`)

Introduce a unified `Insight` type that supersedes the current `Finding` while staying backward-compatible:

```ts
type InsightCategory =
  | "summary" | "quality" | "security"
  | "ai_origin" | "architecture" | "comment";

type Insight = {
  id: string;
  category: InsightCategory;
  severity?: "info" | "low" | "medium" | "high";
  title: string;
  explanation: string;
  suggested_action?: string;
  file_path: string;
  start_line?: number;
  end_line?: number;
  confidence?: number;
};

type InsightBundle = {
  file_overview?: string;
  insights: Insight[];
  unmapped_insights: Array<Omit<Insight,
    "start_line" | "end_line" | "file_path" | "id"
  > & { reason_not_mapped?: string }>;
};
```

Add `extractInsights(markdown, totalLines, category)` next to `extractFindings`; keep the old function for any caller still expecting `Finding[]` (adapter wraps the new type). Tag each insight with its source tab so the outline can filter.

### Prompt updates (`src/lib/analysis-prompt.ts`)

- Replace the `findings-json` block with an `insights-json` block matching the schema above (keep `findings-json` parsing as a fallback for older AI replies).
- Add explicit rule: "If you cannot confidently map a point to lines, put it in `unmapped_insights` with `reason_not_mapped` — never invent line numbers."
- Summary prompt (`src/lib/prompt.ts`) gains the same block so summary points become mappable cards.

### Right panel (`src/components/FindingsList.tsx` → `InsightPanel.tsx`)

- Card layout: category badge (color + text label), severity badge, line-range chip (`Righe 24–41` / `Lines 24–41` / `第 24–41 行`) or `File-level observation` chip, title, collapsed explanation with Expand/Collapse, action row.
- "Insights outline" header: totals, category quick filters (chips toggling visibility), `12 insight · 9 collegati al codice · 3 generali`.
- Actions dispatch through callbacks already wired to `runAnalysis` / `proposeFix` / `explainFile` — add new "Suggest comment" action calling `explainFile` with a `comment` mode flag.

### Code viewer (`src/components/CodeViewer.tsx`)

- Accept `activeInsightId`, `insights`, `onMarkerClick` props.
- Persistent highlight: keep last-selected range styled until another insight is picked (today highlights are transient).
- Gutter: render a 6px colored bar per insight, using category color tokens (`--decoder-cat-summary`, `--decoder-cat-quality`, etc., added to `src/styles.css`). Stack overlapping ranges with offsets; tooltip on hover.
- Floating label: small absolutely positioned chip above the first highlighted line showing `title · category`.
- Selection toolbar: on `mouseup` with non-empty selection, show a floating toolbar with Explain / Summarize / Suggest comments / Check quality / Check security; clicking creates a synthetic insight card mapped to the selection.

### Patch integration (`src/components/DiffViewer.tsx` + route)

- Track `sourceInsightId` on each generated patch in route state.
- DiffViewer gains sub-tabs `Insight | Diff | How to apply` and a back-link button that re-selects the source insight card and scrolls the editor.

### i18n

Add keys under `insights.*`, `actions.*`, `outline.*`, `loading.*` in `src/i18n/locales/{en,it,zh}/common.json`. All new copy listed in the user spec gets translated.

### Accessibility

- Badges always include text (not color-only).
- `aria-current="true"` on the active card; `aria-controls` linking card → highlighted line block.
- Roving tabindex across cards; Enter triggers "Show in code".

## Files to add / change

Add:
- `src/lib/insights.ts`
- `src/components/InsightPanel.tsx`
- `src/components/InsightCard.tsx`
- `src/components/SelectionToolbar.tsx`

Edit:
- `src/lib/findings.ts` (adapter to new type)
- `src/lib/analysis-prompt.ts`, `src/lib/prompt.ts` (new JSON block + rules)
- `src/components/CodeViewer.tsx` (markers, persistent highlight, selection toolbar hook)
- `src/components/DiffViewer.tsx` (insight backlink + sub-tabs)
- `src/components/FindingsList.tsx` (becomes thin wrapper around `InsightPanel` for back-compat)
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx` (wire outline, active insight state, patch source tracking, loading progress copy)
- `src/styles.css` (category color tokens, gutter marker styles, highlight variants)
- `src/i18n/locales/{en,it,zh}/common.json`

## Out of scope

- No changes to auth, BYOK storage, or server credentials flow.
- No new AI providers or backend tables.
- Existing analyses (smells, deadcode, bugs, security, ai_origin, fix) keep their current entry points; only their output rendering changes.

## Acceptance

Matches the 14-point acceptance list in the brief: click-to-scroll+highlight, gutter→card selection, explicit file-level labelling, patch↔insight backlink, manual-selection insight creation, and a panel that makes the code/explanation relationship obvious at a glance.