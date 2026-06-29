import type { KnowledgeEntry } from "../types";

export const googleGemini: KnowledgeEntry = {
  slug: "google-gemini",
  type: "integration",
  category: "Integrations",
  tags: ["google", "gemini", "ai", "provider"],
  related: ["byok", "openai-gpt", "anthropic-claude", "openrouter"],
  i18n: {
    en: {
      title: "Google Gemini — BYOK provider",
      metaTitle: "Google Gemini in Decoder — BYOK integration",
      metaDescription:
        "Use your Google AI Studio key in Decoder to power Explain and Chat with Gemini models. Encrypted, user-scoped, billed to you.",
      intro:
        "Gemini brings large context windows and competitive pricing. Add your Google AI Studio key in Settings and Decoder routes AI features through Gemini.",
      byLevel: {
        dev: {
          whatItIs: "BYOK adapter for the Google Generative Language / Gemini API.",
          whyUseful: "Very large context windows, useful for full-repo chat.",
          howDecoderImplements: "Key encrypted AES-256-GCM, decrypted only server-side, streaming supported.",
          whenToUse: "Repo chat over large codebases, AI explain.",
          whenNotToUse: "Strict offline / on-prem requirements — use local inference.",
          practicalExample: "Settings → add Gemini key → Chat asks questions across a 500-file repo with no chunking pain.",
        },
      },
      faq: [
        { q: "Vertex AI?", a: "AI Studio keys today; Vertex is on the roadmap." },
        { q: "Multimodal?", a: "Decoder focuses on text/code today." },
      ],
      glossary: [
        { term: "AI Studio", definition: "Google's developer console for Gemini API keys." },
      ],
      cta: { label: "Add a key", href: "/settings" },
    },
  },
};
