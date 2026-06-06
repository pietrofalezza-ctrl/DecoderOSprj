// Shared analysis prompt builder — pure, browser-safe.
import type { ExplanationLanguage } from "./prompt";

export type AnalysisKind =
  | "smells"
  | "deadcode"
  | "bugs"
  | "security";

const FOCUS: Record<AnalysisKind, string> = {
  smells:
    "Identify code smells: long functions, unclear naming, duplication, deep nesting, tight coupling, leaky abstractions. For each issue provide: location, why it is a smell, and a refactoring suggestion.",
  deadcode:
    "Identify likely dead code: unused variables, unreachable branches, unused exports, unused imports. Be conservative — only report items you can justify from the file alone. Note false-positive risk when context could prove usage elsewhere.",
  bugs:
    "Identify likely bugs: off-by-one errors, missing await, race conditions, null/undefined access, exhaustiveness mistakes, incorrect error handling. Rank by likelihood and impact.",
  security:
    "Identify potential security issues: injection, XSS, SSRF, insecure deserialization, secret leakage, weak crypto, insufficient authorization checks, unsafe input handling. For each finding: severity (low/medium/high), location, exploitation scenario, mitigation.",
};

export function buildAnalysisPrompt(args: {
  kind: AnalysisKind;
  language: ExplanationLanguage;
  filePath: string;
  fileContent: string;
}): { system: string; user: string } {
  const langName =
    args.language === "it"
      ? "Italian"
      : args.language === "zh"
        ? "Simplified Chinese"
        : "English";

  const system = `You are De-coder, performing a focused source-code review.
Reply in ${langName}, using Markdown with clear headings.
${FOCUS[args.kind]}
If no issues are found, say so plainly — do not invent findings.
Keep it under ~500 words. Never fabricate code paths you cannot infer from the file.`;

  const content =
    args.fileContent.length > 60_000
      ? args.fileContent.slice(0, 60_000) + "\n…[truncated]"
      : args.fileContent;
  const user = `File: ${args.filePath}\n\n\`\`\`\n${content}\n\`\`\``;
  return { system, user };
}
