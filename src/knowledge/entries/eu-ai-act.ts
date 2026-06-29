import type { KnowledgeEntry } from "../types";

export const euAiAct: KnowledgeEntry = {
  slug: "eu-ai-act",
  type: "concept",
  category: "Compliance",
  tags: ["eu", "ai-act", "compliance", "regulation"],
  related: ["gdpr-compliance", "byok", "local-ai", "ai-origin-detection"],
  i18n: {
    en: {
      title: "EU AI Act — What it means for code analysis",
      metaTitle: "EU AI Act and code analysis — BYOK, local inference, transparency",
      metaDescription:
        "The EU AI Act introduces obligations on AI systems used in development. Decoder's BYOK + local inference model keeps code under your control.",
      intro:
        "The EU AI Act (Regulation 2024/1689) sets obligations on providers and deployers of AI. For code analysis, transparency and data control are the levers that matter most.",
      byLevel: {
        cto: {
          whatItIs: "EU regulation establishing risk tiers and obligations for AI systems placed on the EU market.",
          whyUseful: "Defines what you must disclose, log, and control when AI touches your codebase or pipeline.",
          howDecoderImplements: "BYOK keeps the data plane under the customer's chosen provider; local inference via Ollama / LM Studio keeps code on-device.",
          whenToUse: "Procurement reviews, DPIA, vendor questionnaires.",
          whenNotToUse: "As a substitute for legal advice — this is engineering context, not counsel.",
          practicalExample: "Compliance asks where source goes during AI explain — answer: only to the provider whose key you configured, or nowhere if you run locally.",
        },
      },
      faq: [
        { q: "Is Decoder a 'high-risk' AI system?", a: "Decoder is a tool; classification depends on how you deploy it. Code analysis is generally not high-risk." },
        { q: "Where is data processed?", a: "Static and malware scans run server-side without AI. AI features call your BYOK provider — or your local model." },
      ],
      glossary: [
        { term: "DPIA", definition: "Data Protection Impact Assessment." },
        { term: "Risk tier", definition: "EU AI Act category (minimal, limited, high, unacceptable)." },
      ],
      cta: { label: "Read the privacy approach", href: "/knowledge/byok" },
    },
  },
};
