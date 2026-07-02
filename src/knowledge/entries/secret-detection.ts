import type { KnowledgeEntry } from "../types";

export const secretDetection: KnowledgeEntry = {
  slug: "secret-detection",
  type: "capability",
  category: "Analysis",
  tags: ["secrets", "api-keys", "credentials", "leak"],
  related: ["static-malware-analysis", "entropy", "cwe-mapping"],
  i18n: {
    en: {
      title: "Secret Detection — Finding leaked keys",
      metaTitle: "Secret Detection in Decoder — Spot API keys, tokens, passwords",
      metaDescription:
        "Decoder scans source for hardcoded API keys, tokens, and credentials using regex + entropy. Catch leaks before they ship.",
      intro:
        "A leaked key is the most common breach vector. Decoder combines provider-specific regex (AWS, GitHub, Stripe…) with entropy to flag secrets that don't belong in code.",
      byLevel: {
        dev: {
          whatItIs: "Detector class that flags strings looking like credentials in source files.",
          whyUseful: "Stops .env values, OAuth tokens, or private keys from reaching git history.",
          howDecoderImplements:
            "Provider regex catalog + Shannon entropy threshold + path heuristics (.env*, config/*).",
          whenToUse: "Before committing, before publishing, and on every CI run.",
          whenNotToUse: "Test fixtures with obvious dummy keys — add a comment to suppress.",
          practicalExample: "An AKIA... string in src/config.ts is flagged Critical with CWE-798.",
        },
      },
      faq: [
        {
          q: "False positives?",
          a: "Yes for high-entropy non-secrets (UUIDs, hashes). Use the severity filter to focus.",
        },
        {
          q: "Does it check git history?",
          a: "Decoder scans uploaded files only — pair with git-leaks for history scans.",
        },
      ],
      glossary: [
        {
          term: "Entropy",
          definition: "Measure of randomness — high entropy suggests a real secret.",
        },
        { term: "CWE-798", definition: "Use of Hard-coded Credentials." },
      ],
      cta: { label: "Scan a project", href: "/" },
    },
  },
};
