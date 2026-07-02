import type { KnowledgeEntry } from "../types";

export const aiOriginDetection: KnowledgeEntry = {
  slug: "ai-origin-detection",
  type: "capability",
  category: "Analysis",
  tags: ["ai", "origin", "review"],
  related: ["repository-analysis", "chat-with-code", "byok"],
  i18n: {
    en: {
      title: "AI-Origin Detection",
      metaTitle: "Detect AI-Generated Code — Decoder",
      metaDescription:
        "Spot likely AI-generated code in a file or repository. Decoder produces a verbalised, explainable signal — not a black-box score.",
      intro:
        "AI-Origin Detection estimates whether a code artefact was likely produced by an LLM, and explains why. The goal is informed review, not gatekeeping.",
      byLevel: {
        dev: {
          whatItIs:
            "Heuristic + LLM-assisted analysis of stylistic, structural and comment patterns associated with model-generated code.",
          whyUseful:
            "Helps reviewers calibrate scrutiny: AI code is often syntactically clean but semantically off in subtle ways.",
          howDecoderImplements:
            "Static heuristics produce a base signal; if a BYOK or local model is available, Decoder verbalises the rationale in the user's selected tone.",
          whenToUse:
            "Code review of unfamiliar PRs, onboarding to a repository, security triage of pasted snippets.",
          whenNotToUse:
            "As a binary verdict for hiring or grading — no detector is reliable enough for that.",
          practicalExample:
            "A PR shows uniform docstrings, exhaustive type hints and generic identifiers; Decoder flags it as AI-likely and explains which signals contributed.",
        },
      },
      faq: [
        {
          q: "Is the result a definitive verdict?",
          a: "No. It is an explainable signal designed to guide human review.",
        },
        {
          q: "Does it require an AI key?",
          a: "The base static signal does not. The verbalised explanation needs a BYOK or local model.",
        },
      ],
      glossary: [
        {
          term: "Verbalisation",
          definition:
            "Turning a numeric signal into a plain-language explanation a reviewer can act on.",
        },
      ],
      cta: { label: "Run AI-Origin on a file", href: "/dashboard" },
    },
  },
};
