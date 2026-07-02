import type { KnowledgeEntry } from "../types";

export const lmStudio: KnowledgeEntry = {
  slug: "lm-studio",
  type: "integration",
  category: "Integrations",
  tags: ["lm-studio", "local-ai", "inference"],
  related: ["local-ai", "ollama", "byok"],
  i18n: {
    en: {
      title: "LM Studio — Local inference with a GUI",
      metaTitle: "LM Studio in Decoder — Run AI features locally, no cloud",
      metaDescription:
        "Decoder talks to LM Studio's local OpenAI-compatible server, so AI explain and chat run entirely on your machine.",
      intro:
        "LM Studio is a desktop app that runs LLMs locally with an OpenAI-compatible API. Decoder targets that endpoint when you choose local inference.",
      byLevel: {
        dev: {
          whatItIs: "Local LLM runtime with a GUI and an OpenAI-compatible HTTP server.",
          whyUseful: "Zero data egress, no API key, runs on your laptop.",
          howDecoderImplements:
            "Set the local endpoint in Settings; Decoder routes AI calls to LM Studio.",
          whenToUse: "Confidential code, offline work, cost-free experimentation.",
          whenNotToUse: "When you need frontier-model quality on a thin laptop.",
          practicalExample:
            "Run Qwen2.5-Coder in LM Studio; Decoder's Explain uses it without ever calling the cloud.",
        },
      },
      faq: [
        {
          q: "Ollama or LM Studio?",
          a: "Both work. LM Studio has a richer GUI; Ollama is CLI-first.",
        },
        { q: "Does Decoder ship a model?", a: "No — install and pick one in LM Studio." },
      ],
      glossary: [
        {
          term: "OpenAI-compatible",
          definition: "An HTTP API mirroring OpenAI's chat/completions shape.",
        },
      ],
      cta: { label: "Read about local AI", href: "/knowledge/local-ai" },
    },
  },
};
