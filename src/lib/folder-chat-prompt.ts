import {
  normalizeChatMessages,
  type PersistedChatMessage,
} from "@/lib/chat-history";
import type { Proficiency } from "@/lib/prompt";

export type FolderChatExplanationType = "human" | "technical";

export type FolderChatFileSnippet = {
  path: string;
  language?: string | null;
  excerpt: string;
};

export type FolderChatPromptInput = {
  folderPath: string;
  files: FolderChatFileSnippet[];
  previousMessages: PersistedChatMessage[];
  question: string;
  proficiency: Proficiency;
  explanationType: FolderChatExplanationType;
  uiLanguage: "en" | "it" | "zh";
  maxPreviousMessages?: number;
  maxExcerptChars?: number;
  maxTotalChars?: number;
};

const DEFAULT_MAX_PREVIOUS = 12;
const DEFAULT_MAX_EXCERPT = 4_000;
const DEFAULT_MAX_TOTAL = 60_000;
const MAX_TITLE_LENGTH = 80;

const LANG_NAME: Record<"en" | "it" | "zh", string> = {
  en: "English",
  it: "Italian",
  zh: "Simplified Chinese",
};

const PROFICIENCY_HINT: Record<Proficiency, string> = {
  nontech:
    "The reader is non-technical. Avoid jargon, use plain analogies, focus on intent and outcomes.",
  junior:
    "The reader is a junior developer. Spell out concepts, name patterns, prefer simple examples.",
  intermediate:
    "The reader is an intermediate developer. Balanced detail; do not over-explain language basics.",
  senior:
    "The reader is a senior engineer. Be terse and information-dense; flag trade-offs and edge cases.",
  architect:
    "The reader is a software architect. Emphasize boundaries, coupling, data flow, and risk.",
  cto:
    "The reader is a CTO. Lead with risks, cost, scalability, and strategic implications; keep prose short.",
};

export function folderChatSessionTitle(firstMessage: string): string {
  const firstLine = firstMessage
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .find(Boolean);
  if (!firstLine) return "Folder chat";
  return firstLine.length > MAX_TITLE_LENGTH
    ? `${firstLine.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}...`
    : firstLine;
}

function clampExcerpt(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n...[truncated]`;
}

export function buildFolderChatPrompt(input: FolderChatPromptInput): {
  system: string;
  user: string;
} {
  const maxPrev = input.maxPreviousMessages ?? DEFAULT_MAX_PREVIOUS;
  const maxExcerpt = input.maxExcerptChars ?? DEFAULT_MAX_EXCERPT;
  const maxTotal = input.maxTotalChars ?? DEFAULT_MAX_TOTAL;

  const previous = normalizeChatMessages(input.previousMessages).slice(-Math.max(0, maxPrev));
  const transcript = previous
    .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
    .join("\n\n");

  const fileChunks: string[] = [];
  let total = 0;
  for (const f of input.files) {
    const excerpt = clampExcerpt(f.excerpt ?? "", maxExcerpt);
    const block = `### ${f.path}${f.language ? ` (${f.language})` : ""}\n\`\`\`\n${excerpt}\n\`\`\``;
    if (total + block.length > maxTotal) {
      fileChunks.push(`... [${input.files.length - fileChunks.length} more files omitted for length]`);
      break;
    }
    fileChunks.push(block);
    total += block.length;
  }

  const reply = LANG_NAME[input.uiLanguage] ?? "English";
  const tone =
    input.explanationType === "technical"
      ? "Use a technical, code-oriented tone."
      : "Use a clear, conversational tone, friendlier than a code review.";

  const system = `You are Decoder, a folder-scoped code chat assistant.
Reply in ${reply}. ${tone}
${PROFICIENCY_HINT[input.proficiency]}
You can ONLY reason about the folder shown below and the previous transcript. If evidence is missing, say so plainly — do not invent files, symbols, or behavior.`;

  const user = [
    `Folder: ${input.folderPath}/`,
    `Files included: ${input.files.length}`,
    "",
    "Folder contents (excerpts):",
    fileChunks.join("\n\n") || "(no files)",
    "",
    "Previous transcript:",
    transcript || "(none)",
    "",
    "Current question:",
    input.question.trim(),
  ].join("\n");

  return { system, user };
}
