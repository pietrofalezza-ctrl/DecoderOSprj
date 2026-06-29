import type { KnowledgeEntry } from "../types";

export const anthropicClaude: KnowledgeEntry = {
  slug: "anthropic-claude",
  type: "integration",
  category: "Integrations",
  tags: ["anthropic", "claude", "ai", "provider"],
  related: ["byok", "openai-gpt", "google-gemini", "openrouter"],
  i18n: {
    en: {
      title: "Anthropic Claude — BYOK provider",
      metaTitle: "Anthropic Claude in Decoder — BYOK integration",
      metaDescription:
        "Use your Anthropic key in Decoder to power Explain and Chat with Claude. Encrypted at rest, billed to your account.",
      intro:
        "Anthropic's Claude family is a popular choice for code reasoning. Paste your Anthropic key in Settings and Decoder routes AI features through Claude.",
      byLevel: {
        dev: {
          whatItIs: "BYOK adapter for the Anthropic Messages API.",
          whyUseful: "Strong reasoning, large context windows, good for repo-scale chat.",
          howDecoderImplements: "Key encrypted AES-256-GCM, model selected per request, streaming supported.",
          whenToUse: "Explain, AI-origin verbalisation, repo chat.",
          whenNotToUse: "When you need free local inference — switch to Ollama / LM Studio.",
          practicalExample: "Settings → add sk-ant-... → Chat with Code now uses Claude.",
        },
      },
      faq: [
        { q: "Which models?", a: "Whichever your account has access to (Sonnet, Opus, Haiku families)." },
        { q: "Does Decoder see my key?", a: "Only inside the server function that issues the call. Plaintext never reaches the browser." },
      ],
      glossary: [
        { term: "Context window", definition: "Maximum tokens the model can consider at once." },
      ],
      cta: { label: "Add a key", href: "/settings" },
    },
  },
};
