import type { KnowledgeEntry } from "../types";

export const openaiGpt: KnowledgeEntry = {
  slug: "openai-gpt",
  type: "integration",
  category: "Integrations",
  tags: ["openai", "gpt", "ai", "provider"],
  related: ["byok", "anthropic-claude", "google-gemini", "openrouter"],
  i18n: {
    en: {
      title: "OpenAI GPT — BYOK provider",
      metaTitle: "OpenAI GPT in Decoder — BYOK integration",
      metaDescription:
        "Connect your OpenAI key to Decoder for Explain and Chat. Encrypted at rest, billed to your OpenAI account, never proxied.",
      intro:
        "OpenAI's GPT family powers many code-review workflows. Add your key in Settings and Decoder routes AI features directly through OpenAI.",
      byLevel: {
        dev: {
          whatItIs: "BYOK adapter for the OpenAI Chat Completions / Responses API.",
          whyUseful: "Wide model choice, mature ecosystem, predictable behaviour for code tasks.",
          howDecoderImplements: "Key encrypted AES-256-GCM, model selected per request, streaming supported.",
          whenToUse: "Explain, AI-origin verbalisation, repo chat.",
          whenNotToUse: "Strict data-residency requirements — prefer local inference.",
          practicalExample: "Settings → add sk-... → Explain a function with GPT-4o-mini in seconds.",
        },
      },
      faq: [
        { q: "Which models?", a: "Any chat/completions model your key can call." },
        { q: "Is my key shared?", a: "No — keys are user-scoped with RLS and decrypted only server-side." },
      ],
      glossary: [
        { term: "Streaming", definition: "Server-Sent token-by-token response delivery." },
      ],
      cta: { label: "Add a key", href: "/settings" },
    },
  },
};
