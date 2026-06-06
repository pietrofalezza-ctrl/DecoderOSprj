// Pure helpers for the AI-origin probability feature.
// Browser- and server-safe.

export type AiOriginBucket = "human" | "mixed" | "ai";

export function parseAiOriginScore(text: string): number | null {
  if (!text) return null;
  // Look for `SCORE: NN` on the first few lines, case-insensitive.
  const head = text.slice(0, 400);
  const m = head.match(/SCORE\s*[:=]\s*(\d{1,3})/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function bucketize(score: number): AiOriginBucket {
  if (score >= 70) return "ai";
  if (score >= 30) return "mixed";
  return "human";
}

export function bucketColorClass(b: AiOriginBucket): string {
  // Tailwind utility for inline badges — uses theme tokens.
  if (b === "ai") return "text-destructive border-destructive/40 bg-destructive/10";
  if (b === "mixed") return "text-amber-500 border-amber-500/40 bg-amber-500/10";
  return "text-primary border-primary/40 bg-primary/10";
}

export function weightedRepoScore(
  items: Array<{ score: number; weight: number }>,
): number {
  const total = items.reduce((s, x) => s + x.weight, 0);
  if (total <= 0) return 0;
  const sum = items.reduce((s, x) => s + x.score * x.weight, 0);
  return Math.round(sum / total);
}
