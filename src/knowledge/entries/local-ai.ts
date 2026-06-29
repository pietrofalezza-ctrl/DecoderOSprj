import type { KnowledgeEntry } from "../types";

export const localAi: KnowledgeEntry = {
  slug: "local-ai",
  type: "capability",
  category: "Privacy",
  tags: ["privacy", "ai", "local", "ollama", "lm-studio"],
  related: ["ollama", "byok", "chat-with-code", "repository-analysis"],
  i18n: {
    en: {
      title: "Local AI Inference",
      metaTitle: "Local AI Code Analysis with Ollama / LM Studio",
      metaDescription:
        "Run AI explanations and code chat against a model on your own machine. No file bodies leave your environment.",
      intro:
        "Local AI lets you use Decoder's explain and chat features against a model running on your own hardware via Ollama or LM Studio — useful when code cannot leave your environment.",
      byLevel: {
        dev: {
          whatItIs: "Routing AI calls to a locally-served OpenAI-compatible endpoint (Ollama, LM Studio) instead of a cloud provider.",
          whyUseful: "Strongest privacy posture: file content stays in your environment, no third-party billing, works offline.",
          howDecoderImplements: "Configure a local base URL in Settings; Decoder uses the OpenAI-compatible chat completion shape — same prompt pipeline as cloud providers.",
          whenToUse: "Code under NDA, regulated environments, air-gapped reviews, exploration without per-token cost.",
          whenNotToUse: "When you need frontier-model reasoning quality and have no local GPU — a small local model will under-perform.",
          practicalExample: "Ollama running llama3.1:8b on your laptop. Decoder Explain hits http://localhost:11434/v1 and never touches the cloud.",
        },
      },
      faq: [
        { q: "Do uploaded files stay local with Local AI?", a: "File bodies are not sent to any AI provider. They still live in your private server storage on Decoder for the session." },
        { q: "Which local runtimes are supported?", a: "Any OpenAI-compatible endpoint — Ollama and LM Studio are the common ones." },
      ],
      glossary: [
        { term: "Local inference", definition: "Running model inference on hardware you control, not on a hosted API." },
      ],
      cta: { label: "Configure a local provider", href: "/settings" },
    },
  },
};
