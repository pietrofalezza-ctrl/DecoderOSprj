import type { KnowledgeEntry } from "../types";

export const openrouter: KnowledgeEntry = {
  slug: "openrouter",
  type: "integration",
  category: "Runtime",
  tags: ["ai", "cloud", "openrouter", "byok"],
  related: ["byok", "local-ai", "ollama"],
  i18n: {
    en: {
      title: "OpenRouter with Decoder",
      metaTitle: "Use OpenRouter as Your AI Provider in Decoder",
      metaDescription:
        "Connect OpenRouter to Decoder via BYOK to access dozens of models — Claude, GPT, Gemini, Llama — behind a single key.",
      intro:
        "OpenRouter is a unified API in front of many model providers. With BYOK you get access to dozens of models in Decoder from a single key.",
      byLevel: {
        dev: {
          whatItIs: "A model-routing API that exposes Claude, GPT, Gemini, Llama and others through one OpenAI-compatible interface.",
          whyUseful: "One key, one bill, many models. Switch model per task without re-wiring.",
          howDecoderImplements: "Settings → Add OpenRouter key → choose model in the picker. Decoder retries with `Retry-After` on 429 rate limits.",
          whenToUse: "When you want to compare models or use the right model for the task without juggling multiple provider accounts.",
          whenNotToUse: "Strict privacy environments — code is sent through OpenRouter to the chosen upstream provider.",
          practicalExample: "Use a fast cheap model for routine explain calls, then switch to Claude Opus for hard malware reasoning — same key.",
        },
      },
      faq: [
        { q: "Where do I get an OpenRouter key?", a: "Sign up at openrouter.ai and create a key in your account settings." },
        { q: "What happens on rate limits?", a: "Decoder reads the `Retry-After` header and retries with backoff, then surfaces a clear error if the limit persists." },
      ],
      glossary: [
        { term: "Rate limit", definition: "Cap a provider sets on requests-per-minute or tokens-per-minute." },
      ],
      cta: { label: "Add your OpenRouter key", href: "/settings" },
    },
  },
};
