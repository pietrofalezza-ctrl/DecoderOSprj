import type { KnowledgeEntry } from "../types";

export const gdprCompliance: KnowledgeEntry = {
  slug: "gdpr-compliance",
  type: "concept",
  category: "Compliance",
  tags: ["gdpr", "privacy", "eu", "compliance"],
  related: ["eu-ai-act", "byok", "local-ai"],
  i18n: {
    en: {
      title: "GDPR — Code analysis and personal data",
      metaTitle: "GDPR and code analysis — Decoder's data minimisation approach",
      metaDescription:
        "Decoder minimises personal data in the analysis pipeline: no training on user code, BYOK for AI, optional local inference for full data residency.",
      intro:
        "GDPR governs personal data in the EU. Even code can carry personal data (logs, fixtures, PII in test files). Decoder's defaults minimise exposure.",
      byLevel: {
        cto: {
          whatItIs: "EU regulation on processing personal data of EU residents.",
          whyUseful:
            "Defines lawful bases, data minimisation, residency, and breach notification obligations.",
          howDecoderImplements:
            "No training on user code; BYOK isolates AI calls to your chosen provider; local inference keeps code on your machine.",
          whenToUse: "Vendor due diligence, DPA negotiation, internal audit.",
          whenNotToUse: "Don't rely on this page for legal qualification — consult counsel.",
          practicalExample:
            "A reviewer pastes a log fixture with emails: running locally via Ollama keeps everything on-device.",
        },
      },
      faq: [
        { q: "Is user code used for training?", a: "No. Decoder does not train on user code." },
        {
          q: "Where are AI requests sent?",
          a: "To the provider tied to the key you configured, or nowhere with local inference.",
        },
      ],
      glossary: [
        { term: "DPA", definition: "Data Processing Agreement." },
        { term: "Data residency", definition: "Where data is physically processed/stored." },
      ],
      cta: { label: "See local inference", href: "/knowledge/local-ai" },
    },
  },
};
