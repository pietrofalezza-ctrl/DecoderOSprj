import type { KnowledgeEntry } from "../types";

export const entropy: KnowledgeEntry = {
  slug: "entropy",
  type: "concept",
  category: "Security",
  tags: ["security", "malware", "binary", "math"],
  related: ["static-malware-analysis", "binary-analysis", "zip-analysis"],
  i18n: {
    en: {
      title: "Entropy in Malware Analysis",
      metaTitle: "Entropy in Malware — Why High Entropy Matters",
      metaDescription:
        "Entropy measures randomness in a file. Packed and encrypted malware sections push entropy above 7.5 — a classic static-analysis red flag.",
      intro:
        "Entropy is a statistical measure of how 'random' the bytes in a file look. In malware analysis, abnormally high entropy is a strong signal that a section is packed, encrypted or otherwise obfuscated.",
      byLevel: {
        beginner: {
          whatItIs: "A number that says how mixed-up the bytes in a file look. Normal text is low; encrypted data is high.",
          whyUseful: "Helps spot files that try to hide what's inside.",
          howDecoderImplements: "Decoder computes entropy per section of a binary and flags anything above the suspicious threshold.",
          whenToUse: "Any time you analyse an unknown binary.",
          whenNotToUse: "On plain text files — entropy is naturally lower and the metric is less useful.",
          practicalExample: "An EXE with a `.text` section showing entropy 7.8: very likely packed.",
        },
        dev: {
          whatItIs: "Shannon entropy: H = −Σ p(x) log₂ p(x). Range 0 (constant) to 8 (uniform random byte).",
          whyUseful: "Cheap, deterministic signal. Strong correlation with packing/encryption; useful to gate deeper analysis.",
          howDecoderImplements: "Computed per PE section and per file in the static pipeline; values > 7.0 are surfaced with a rationale.",
          whenToUse: "Triage of PE/ELF binaries, suspect ZIP members, dropped artefacts.",
          whenNotToUse: "As a sole verdict — high entropy ≠ malicious (compressed installers are also high-entropy). Always combine with other signals.",
          practicalExample: "LockBit dropper showed `.text` H ≈ 7.85 — combined with suspicious imports and an encoded PowerShell stage, it was a confident static verdict.",
        },
      },
      faq: [
        { q: "What entropy value is suspicious?", a: "Above ~7.0 is worth a look; above 7.5 on an executable section is a strong packing/encryption signal." },
        { q: "Is high entropy enough to call something malware?", a: "No. Many benign installers and compressed files are high-entropy. Combine with structural and behavioural signals." },
      ],
      glossary: [
        { term: "Shannon entropy", definition: "Information-theoretic measure of uncertainty in a distribution." },
        { term: "Packing", definition: "Compressing or encrypting an executable to hide its real payload until runtime." },
      ],
      cta: { label: "Analyse a binary", href: "/dashboard" },
    },
  },
};
