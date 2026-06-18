export type ChatRole = "user" | "assistant" | "system";

export type PersistedChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
};

export type FileChatPromptInput = {
  filePath: string;
  language: string | null;
  fileContent: string;
  previousMessages: PersistedChatMessage[];
  question: string;
  maxPreviousMessages?: number;
  maxFileChars?: number;
};

export type FileChatPrompt = {
  system: string;
  user: string;
};

const DEFAULT_MAX_PREVIOUS_MESSAGES = 12;
const DEFAULT_MAX_FILE_CHARS = 60_000;
const MAX_TITLE_LENGTH = 80;

export function chatSessionTitle(firstMessage: string): string {
  const firstLine = firstMessage
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .find(Boolean);

  if (!firstLine) return "File chat";
  return firstLine.length > MAX_TITLE_LENGTH
    ? `${firstLine.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}...`
    : firstLine;
}

export function normalizeChatMessages(messages: PersistedChatMessage[]): PersistedChatMessage[] {
  return messages
    .filter((message) => {
      const roleOk =
        message.role === "user" || message.role === "assistant" || message.role === "system";
      return roleOk && message.content.trim().length > 0;
    })
    .map((message) => ({
      ...message,
      content: message.content.trim(),
    }))
    .sort((a, b) => {
      const byTime = Date.parse(a.created_at) - Date.parse(b.created_at);
      return byTime === 0 ? a.id.localeCompare(b.id) : byTime;
    });
}

export function buildFileChatPrompt(input: FileChatPromptInput): FileChatPrompt {
  const maxPreviousMessages = input.maxPreviousMessages ?? DEFAULT_MAX_PREVIOUS_MESSAGES;
  const maxFileChars = input.maxFileChars ?? DEFAULT_MAX_FILE_CHARS;
  const previousMessages = normalizeChatMessages(input.previousMessages).slice(
    -Math.max(0, maxPreviousMessages),
  );
  const boundedFileContent =
    input.fileContent.length > maxFileChars
      ? `${input.fileContent.slice(0, maxFileChars)}\n...[truncated]`
      : input.fileContent;

  const transcript = previousMessages
    .map((message) => `${roleLabel(message.role)}: ${message.content}`)
    .join("\n\n");

  return {
    system:
      "You are a persistent code review chat assistant. Answer using only the provided file context and prior transcript. Be concise, technical, and explicit when evidence is missing.",
    user: [
      `File: ${input.filePath}`,
      `Language: ${input.language || "unknown"}`,
      "",
      "File content:",
      "```",
      boundedFileContent,
      "```",
      "",
      "Previous transcript:",
      transcript || "(none)",
      "",
      "Current question:",
      input.question.trim(),
    ].join("\n"),
  };
}

export function formatChatMessagesMarkdown(messages: PersistedChatMessage[]): string {
  return normalizeChatMessages(messages)
    .map((message) => `### ${roleLabel(message.role)}\n\n${message.content}`)
    .join("\n\n");
}

function roleLabel(role: ChatRole): string {
  if (role === "assistant") return "Assistant";
  if (role === "system") return "System";
  return "User";
}
