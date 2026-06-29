import type { KnowledgeEntry } from "../types";

export const sast: KnowledgeEntry = {
  slug: "sast",
  type: "concept",
  category: "Analysis",
  tags: ["sast", "static-analysis", "security"],
  related: ["static-malware-analysis", "cwe-mapping", "severity-scoring", "secret-detection"],
  i18n: {
    en: {
      title: "SAST — Static Application Security Testing",
      metaTitle: "SAST in Decoder — Static security analysis without running code",
      metaDescription:
        "SAST analyses source without executing it. Decoder's free SAST covers 20+ languages, mapped to CWE, with no key required.",
      intro:
        "SAST inspects source code to find security weaknesses before runtime. Decoder ships SAST as a free, no-key feature across 20+ languages.",
      byLevel: {
        dev: {
          whatItIs: "Class of tooling that reasons about code structure to spot weaknesses pre-runtime.",
          whyUseful: "Cheap, fast, repeatable — catches a huge class of bugs before they ship.",
          howDecoderImplements: "Pattern-based rules with CWE mapping, language-aware parsing, and severity ranking.",
          whenToUse: "Every commit, every PR, every audit.",
          whenNotToUse: "For taint flow across services — that's DAST/IAST territory.",
          practicalExample: "A SQL string concatenation in a Java DAO is flagged CWE-89 / High.",
        },
      },
      faq: [
        { q: "SAST vs DAST?", a: "SAST reads code; DAST hits the running app." },
        { q: "Does AI run by default?", a: "No — SAST runs without any key. AI is opt-in via BYOK." },
      ],
      glossary: [
        { term: "DAST", definition: "Dynamic Application Security Testing — runtime probing." },
        { term: "IAST", definition: "Interactive AST — instruments running code." },
      ],
      cta: { label: "Run SAST", href: "/" },
    },
  },
};
