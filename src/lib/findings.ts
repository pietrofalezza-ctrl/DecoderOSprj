// Findings extracted from an analysis output.
// The prompt asks the model to append a fenced ```findings-json block;
// `extractFindings` parses it tolerantly. If the block is missing or
// malformed, returns []. Never throws.

export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export type Finding = {
  start_line: number;
  end_line: number;
  severity: FindingSeverity;
  title: string;
  message: string;
};

const SEVERITY_SET: ReadonlySet<FindingSeverity> = new Set([
  "info",
  "low",
  "medium",
  "high",
  "critical",
]);

function normalizeSeverity(v: unknown): FindingSeverity {
  if (typeof v === "string") {
    const s = v.toLowerCase().trim() as FindingSeverity;
    if (SEVERITY_SET.has(s)) return s;
    if (s === "warn" || s === "warning") return "medium";
    if (s === "error") return "high";
  }
  return "info";
}

function clampLine(v: unknown, max: number): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(Math.max(1, Math.floor(n)), max);
}

export function extractFindings(text: string, totalLines = 100_000): Finding[] {
  if (!text) return [];
  // Match ```findings-json ... ``` (case-insensitive, tolerant of language tag variants).
  const m = text.match(/```(?:findings[-_ ]?json|findings)\s*([\s\S]*?)```/i);
  let raw = m?.[1]?.trim();
  if (!raw) {
    // Fallback: look for a top-level JSON array right after a "Findings" heading.
    const m2 = text.match(/^\s*\[\s*\{[\s\S]*?\}\s*\]\s*$/m);
    raw = m2?.[0]?.trim();
  }
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: Finding[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const start = clampLine(o.start_line ?? o.line ?? o.startLine, totalLines);
    const endRaw = o.end_line ?? o.endLine ?? o.line ?? start;
    const end = Math.max(start, clampLine(endRaw, totalLines));
    const title =
      typeof o.title === "string" && o.title.trim()
        ? o.title.trim().slice(0, 160)
        : "Finding";
    const message =
      typeof o.message === "string"
        ? o.message.trim().slice(0, 2000)
        : typeof o.detail === "string"
          ? (o.detail as string).trim().slice(0, 2000)
          : "";
    out.push({
      start_line: start,
      end_line: end,
      severity: normalizeSeverity(o.severity),
      title,
      message,
    });
    if (out.length >= 100) break;
  }
  return out;
}

/** Strip the findings-json block from the markdown body for clean rendering. */
export function stripFindingsBlock(text: string): string {
  if (!text) return text;
  return text.replace(/```(?:findings[-_ ]?json|findings)\s*[\s\S]*?```\s*$/i, "").trimEnd();
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

export function severityDecorationClass(s: FindingSeverity): string {
  // Class names referenced from CodeViewer; see styles.css for the rules.
  switch (s) {
    case "critical":
    case "high":
      return "decoder-finding decoder-finding--high";
    case "medium":
      return "decoder-finding decoder-finding--medium";
    case "low":
      return "decoder-finding decoder-finding--low";
    default:
      return "decoder-finding decoder-finding--info";
  }
}
