// Client-safe prompt builder for verbalizing offline static / malware reports.
import type { ExplanationLanguage } from "./prompt";

export type StaticVerbalizeScanner = "source" | "malware";

export function buildStaticVerbalizePrompt(args: {
  scanner: StaticVerbalizeScanner;
  language: ExplanationLanguage;
  filePath: string;
  reportMarkdown: string;
}): { system: string; user: string } {
  const langName =
    args.language === "it" ? "Italian" : args.language === "zh" ? "Simplified Chinese" : "English";

  const focus =
    args.scanner === "source"
      ? "an offline structural source-code static analysis (taint heuristics, complexity, sanitizer coverage, dangerous sinks)"
      : "an offline static malware / supply-chain scan (entropy, magic bytes, suspicious paths, heuristic indicators)";

  const system = `You are Decoder, turning a raw offline static report into a clear, human-friendly review.
Reply in ${langName}, using concise Markdown.

The input is the verbatim Markdown produced by ${focus}. The scan ran fully offline — no AI ran on the file itself. Your job is to:
1) Summarise the overall verdict in 2–3 sentences (severity, what it likely means).
2) Group the findings by theme (security, quality, suspicious indicators, false-positive risk).
3) For each meaningful finding, explain in plain language what it is, why it matters, and what to check or do next.
4) Call out anything that looks like a likely false positive and why.
5) End with a short "Next steps" bullet list (max 5 items).

Rules:
- Do NOT invent findings that are not in the input.
- Do NOT repeat the raw numeric metrics verbatim — translate them.
- Keep the whole response under ~450 words.
- Make clear that the underlying scan is heuristic, not proof.`;

  const user = `File: ${args.filePath}

=== RAW OFFLINE STATIC REPORT ===
${args.reportMarkdown.slice(0, 20_000)}`;

  return { system, user };
}
