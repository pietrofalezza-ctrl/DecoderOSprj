import type { KnowledgeEntry } from "../types";

export const ollama: KnowledgeEntry = {
  slug: "ollama",
  type: "integration",
  category: "Runtime",
  tags: ["ai", "local", "ollama"],
  related: ["local-ai", "byok", "openrouter"],
  i18n: {
    en: {
      title: "Ollama with Decoder",
      metaTitle: "Use Ollama as Your AI Provider in Decoder",
      metaDescription:
        "Connect a locally-running Ollama instance to Decoder for fully private AI explanations and code chat.",
      intro:
        "Ollama is a lightweight runtime for serving open-weight LLMs locally. Decoder talks to it through its OpenAI-compatible endpoint.",
      byLevel: {
        dev: {
          whatItIs: "A local model server exposing an OpenAI-compatible HTTP API.",
          whyUseful: "Zero-config private inference; one binary, many open-weight models.",
          howDecoderImplements:
            "Settings → Local AI → base URL `http://localhost:11434/v1` → choose model (e.g. llama3.1, qwen2.5-coder).",
          whenToUse:
            "Private code analysis, offline work, learning prompts without burning cloud tokens.",
          whenNotToUse:
            "Frontier-quality reasoning on large diffs — cloud frontier models still lead.",
          practicalExample:
            "`ollama pull qwen2.5-coder:7b` then point Decoder at the local URL and run Explain on a function.",
        },
      },
      faq: [
        { q: "Is Ollama free?", a: "Yes — it's open source and you run it yourself." },
        {
          q: "Does Decoder send code to Ollama's servers?",
          a: "No. Ollama runs entirely on your machine.",
        },
      ],
      glossary: [
        {
          term: "Open-weight model",
          definition: "An LLM whose weights are publicly downloadable and runnable locally.",
        },
      ],
      cta: { label: "Wire Ollama in Settings", href: "/settings" },
    },
  },
};
