import { describe, expect, it } from "vitest";

import {
  buildFileChatPrompt,
  chatSessionTitle,
  normalizeChatMessages,
  type PersistedChatMessage,
} from "../chat-history";

const baseMessages: PersistedChatMessage[] = [
  {
    id: "2",
    role: "assistant",
    content: "Second answer",
    created_at: "2026-06-18T10:00:02.000Z",
  },
  {
    id: "1",
    role: "user",
    content: "First question",
    created_at: "2026-06-18T10:00:01.000Z",
  },
];

describe("chatSessionTitle", () => {
  it("derives a deterministic short title from the first user message", () => {
    expect(
      chatSessionTitle("  How does this controller validate user input?\nIgnore this.  "),
    ).toBe("How does this controller validate user input?");
  });

  it("falls back when the first message is empty", () => {
    expect(chatSessionTitle("   ")).toBe("File chat");
  });
});

describe("normalizeChatMessages", () => {
  it("orders messages chronologically and drops empty content", () => {
    expect(
      normalizeChatMessages([...baseMessages, { ...baseMessages[0], id: "3", content: "" }]),
    ).toEqual([
      expect.objectContaining({ id: "1", role: "user" }),
      expect.objectContaining({ id: "2", role: "assistant" }),
    ]);
  });
});

describe("buildFileChatPrompt", () => {
  it("builds a bounded prompt with file context, prior transcript, and the new question", () => {
    const prompt = buildFileChatPrompt({
      filePath: "src/App.tsx",
      language: "typescript",
      fileContent: "export function App() { return <main>Hello</main>; }\n",
      previousMessages: baseMessages,
      question: "What should I test?",
    });

    expect(prompt.system).toContain("persistent code review chat");
    expect(prompt.user).toContain("File: src/App.tsx");
    expect(prompt.user).toContain("Language: typescript");
    expect(prompt.user).toContain("User: First question");
    expect(prompt.user).toContain("Assistant: Second answer");
    expect(prompt.user).toContain("Current question:\nWhat should I test?");
    expect(prompt.user).toContain("export function App()");
  });

  it("keeps only the most recent previous messages", () => {
    const previousMessages = Array.from({ length: 20 }, (_, i): PersistedChatMessage => {
      const created = String(i + 1).padStart(2, "0");
      return {
        id: String(i),
        role: i % 2 === 0 ? "user" : "assistant",
        content: `message ${i}`,
        created_at: `2026-06-18T10:00:${created}.000Z`,
      };
    });

    const prompt = buildFileChatPrompt({
      filePath: "src/App.tsx",
      language: "typescript",
      fileContent: "x".repeat(20),
      previousMessages,
      question: "latest?",
      maxPreviousMessages: 4,
    });

    expect(prompt.user).not.toContain("message 0");
    expect(prompt.user).toContain("message 16");
    expect(prompt.user).toContain("message 19");
  });
});
