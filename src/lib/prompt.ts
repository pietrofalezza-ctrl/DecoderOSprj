// Shared client/server prompt builder for Decoder explanations.
// Pure function — no runtime imports — safe to import from browser code.

export type Proficiency =
  | "nontech"
  | "junior"
  | "intermediate"
  | "senior"
  | "architect"
  | "cto";

export type ExplanationType = "human" | "technical";
export type ExplanationLanguage = "en" | "it" | "zh";

export function buildPrompt(args: {
  proficiency: Proficiency;
  explanationType: ExplanationType;
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
  const audience: Record<Proficiency, string> = {
    nontech: "a non-technical reader (manager, student, curious user)",
    junior: "a junior developer (1–2 years experience)",
    intermediate: "an intermediate developer",
    senior: "a senior developer",
    architect: "a software architect",
    cto: "a CTO / technical executive who wants strategic implications",
  };
  const focus =
    args.explanationType === "human"
      ? "Explain in plain language what this file does and why it exists. Avoid jargon."
      : "Give a precise technical summary: responsibilities, key functions/classes, inputs/outputs, side effects, and notable patterns.";

  const system = `You are Decoder, an assistant that helps people understand source code.
Audience: ${audience[args.proficiency]}.
Reply in ${langName}.
${focus}
Be concise (under ~350 words). Use Markdown. Never invent behavior you cannot infer from the code.`;

  const content =
    args.fileContent.length > 60_000
      ? args.fileContent.slice(0, 60_000) + "\n…[truncated]"
      : args.fileContent;
  const user = `File: ${args.filePath}\n\n\`\`\`\n${content}\n\`\`\``;
  return { system, user };
}
