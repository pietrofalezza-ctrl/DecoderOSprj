// Findings / Insights extracted from an analysis output.
// The prompt asks the model to append a fenced ```findings-json block;
// `extractFindings` parses it tolerantly. If the block is missing or
// malformed, returns []. Never throws.
//
// We also support an optional `category` and `suggested_action` per item,
// plus a parallel list of `unmapped_insights` for file-level points that
// the model could not anchor to specific lines.

export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export type InsightCategory =
  | "summary"
  | "quality"
  | "security"
  | "ai_origin"
  | "architecture"
  | "comment";

export type Finding = {
  id?: string;
  start_line: number;
  end_line: number;
  severity: FindingSeverity;
  title: string;
  message: string;
  category?: InsightCategory;
  suggested_action?: string;
};

export type UnmappedInsight = {
  id?: string;
  category?: InsightCategory;
  title: string;
  message: string;
  reason_not_mapped?: string;
  severity?: FindingSeverity;
  suggested_action?: string;
};

export type InsightBundle = {
  findings: Finding[];
  unmapped: UnmappedInsight[];
};

const SEVERITY_SET: ReadonlySet<FindingSeverity> = new Set([
  "info",
  "low",
  "medium",
  "high",
  "critical",
]);

const CATEGORY_SET: ReadonlySet<InsightCategory> = new Set([
  "summary",
  "quality",
  "security",
  "ai_origin",
  "architecture",
  "comment",
]);

function normalizeSeverity(v: unknown): FindingSeverity {
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    if ((SEVERITY_SET as ReadonlySet<string>).has(s)) return s as FindingSeverity;
    if (s === "warn" || s === "warning") return "medium";
    if (s === "error") return "high";
  }
  return "info";
}

function normalizeCategory(v: unknown): InsightCategory | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.toLowerCase().trim().replace(/[ -]/g, "_");
  if ((CATEGORY_SET as ReadonlySet<string>).has(s)) return s as InsightCategory;
  return undefined;
}

function clampLine(v: unknown, max: number): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(Math.max(1, Math.floor(n)), max);
}

function makeId(prefix: string, i: number, title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32) || "item";
  return `${prefix}-${i}-${slug}`;
}

function extractJsonBlock(text: string, tag: string): string | null {
  const re = new RegExp("```(?:" + tag + ")\\s*([\\s\\S]*?)```", "i");
  const m = text.match(re);
  return m?.[1]?.trim() || null;
}

/**
 * Parse the findings/insights block. Supports two shapes:
 *  - legacy: a JSON array of findings;
 *  - new: { insights: [...], unmapped_insights: [...] } object.
 * Looks at ```insights-json``` first, then ```findings-json``` as fallback.
 */
export function extractInsightBundle(
  text: string,
  totalLines = 100_000,
  fallbackCategory?: InsightCategory,
): InsightBundle {
  const empty: InsightBundle = { findings: [], unmapped: [] };
  if (!text) return empty;

  const raw =
    extractJsonBlock(text, "insights[-_ ]?json|insights") ??
    extractJsonBlock(text, "findings[-_ ]?json|findings");
  if (!raw) return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return empty;
  }

  let itemsRaw: unknown[] = [];
  let unmappedRaw: unknown[] = [];

  if (Array.isArray(parsed)) {
    itemsRaw = parsed;
  } else if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    if (Array.isArray(o.insights)) itemsRaw = o.insights;
    else if (Array.isArray(o.findings)) itemsRaw = o.findings;
    if (Array.isArray(o.unmapped_insights)) unmappedRaw = o.unmapped_insights;
    else if (Array.isArray(o.unmapped)) unmappedRaw = o.unmapped;
  } else {
    return empty;
  }

  const findings: Finding[] = [];
  for (let i = 0; i < itemsRaw.length; i++) {
    const item = itemsRaw[i];
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const hasLines =
      o.start_line != null || o.startLine != null || o.line != null;
    if (!hasLines) {
      // Treat as unmapped.
      unmappedRaw.push(item);
      continue;
    }
    const start = clampLine(o.start_line ?? o.line ?? o.startLine, totalLines);
    const endRaw = o.end_line ?? o.endLine ?? o.line ?? start;
    const end = Math.max(start, clampLine(endRaw, totalLines));
    const title =
      typeof o.title === "string" && o.title.trim()
        ? o.title.trim().slice(0, 160)
        : "Finding";
    const message =
      typeof o.explanation === "string"
        ? o.explanation.trim().slice(0, 2000)
        : typeof o.message === "string"
          ? o.message.trim().slice(0, 2000)
          : typeof o.detail === "string"
            ? (o.detail as string).trim().slice(0, 2000)
            : "";
    findings.push({
      id:
        typeof o.id === "string" && o.id
          ? o.id
          : makeId("f", i, title),
      start_line: start,
      end_line: end,
      severity: normalizeSeverity(o.severity),
      title,
      message,
      category: normalizeCategory(o.category) ?? fallbackCategory,
      suggested_action:
        typeof o.suggested_action === "string"
          ? o.suggested_action.trim().slice(0, 800)
          : undefined,
    });
    if (findings.length >= 100) break;
  }

  const unmapped: UnmappedInsight[] = [];
  for (let i = 0; i < unmappedRaw.length; i++) {
    const item = unmappedRaw[i];
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const title =
      typeof o.title === "string" && o.title.trim()
        ? o.title.trim().slice(0, 160)
        : "Insight";
    const message =
      typeof o.explanation === "string"
        ? o.explanation.trim().slice(0, 2000)
        : typeof o.message === "string"
          ? o.message.trim().slice(0, 2000)
          : "";
    unmapped.push({
      id: typeof o.id === "string" && o.id ? o.id : makeId("u", i, title),
      title,
      message,
      category: normalizeCategory(o.category) ?? fallbackCategory,
      severity: normalizeSeverity(o.severity),
      suggested_action:
        typeof o.suggested_action === "string"
          ? o.suggested_action.trim().slice(0, 800)
          : undefined,
      reason_not_mapped:
        typeof o.reason_not_mapped === "string"
          ? o.reason_not_mapped.trim().slice(0, 400)
          : undefined,
    });
    if (unmapped.length >= 30) break;
  }

  return { findings, unmapped };
}

/** Legacy helper kept for backward-compat: returns only the mapped findings. */
export function extractFindings(text: string, totalLines = 100_000): Finding[] {
  return extractInsightBundle(text, totalLines).findings;
}

/** Strip the findings/insights JSON block from the markdown body for clean rendering. */
export function stripFindingsBlock(text: string): string {
  if (!text) return text;
  return text
    .replace(/```(?:insights[-_ ]?json|insights)\s*[\s\S]*?```\s*$/i, "")
    .replace(/```(?:findings[-_ ]?json|findings)\s*[\s\S]*?```\s*$/i, "")
    .trimEnd();
}

const SEVERITY_RANK: Record<FindingSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

export function compareFindings(a: Finding, b: Finding): number {
  const d = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
  if (d !== 0) return d;
  return a.start_line - b.start_line;
}

export function severityBadgeClass(s: FindingSeverity): string {
  switch (s) {
    case "critical":
      return "border-red-600/50 bg-red-600/10 text-red-700 dark:text-red-300";
    case "high":
      return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
    case "medium":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "low":
      return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    default:
      return "border-muted-foreground/30 bg-muted text-muted-foreground";
  }
}

export function categoryBadgeClass(c?: InsightCategory): string {
  switch (c) {
    case "security":
      return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
    case "quality":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "architecture":
      return "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300";
    case "ai_origin":
      return "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case "comment":
    case "summary":
    default:
      return "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300";
  }
}

export function categoryDecorationClass(c?: InsightCategory): string {
  switch (c) {
    case "security":
      return "decoder-finding decoder-cat--security";
    case "quality":
      return "decoder-finding decoder-cat--quality";
    case "architecture":
      return "decoder-finding decoder-cat--architecture";
    case "ai_origin":
      return "decoder-finding decoder-cat--ai-origin";
    case "comment":
      return "decoder-finding decoder-cat--comment";
    case "summary":
    default:
      return "decoder-finding decoder-cat--summary";
  }
}

export function categoryGlyphClass(c?: InsightCategory): string {
  switch (c) {
    case "security":
      return "decoder-finding-glyph decoder-cat-glyph--security";
    case "quality":
      return "decoder-finding-glyph decoder-cat-glyph--quality";
    case "architecture":
      return "decoder-finding-glyph decoder-cat-glyph--architecture";
    case "ai_origin":
      return "decoder-finding-glyph decoder-cat-glyph--ai-origin";
    case "comment":
      return "decoder-finding-glyph decoder-cat-glyph--comment";
    case "summary":
    default:
      return "decoder-finding-glyph decoder-cat-glyph--summary";
  }
}
