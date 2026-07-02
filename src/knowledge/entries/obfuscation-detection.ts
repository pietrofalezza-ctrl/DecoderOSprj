import type { KnowledgeEntry } from "../types";

export const obfuscationDetection: KnowledgeEntry = {
  slug: "obfuscation-detection",
  type: "capability",
  category: "Malware",
  tags: ["obfuscation", "entropy", "malware", "deobfuscation"],
  related: ["entropy", "powershell-analysis", "yara-rules", "ai-origin-detection"],
  i18n: {
    en: {
      title: "Obfuscation Detection — Spotting hidden code",
      metaTitle: "Obfuscation Detection in Decoder — Entropy, base64, packing",
      metaDescription:
        "Decoder detects obfuscated code in PowerShell, JavaScript, and binaries via entropy, base64 density, and structural heuristics.",
      intro:
        "Obfuscation hides intent. Decoder flags suspicious entropy, base64 walls, eval chains, and packing markers so reviewers can focus on what's actually hidden.",
      byLevel: {
        dev: {
          whatItIs: "Set of heuristics that score how unreadable / non-natural a chunk of code is.",
          whyUseful:
            "Most malicious payloads are obfuscated before delivery — detecting that is half the job.",
          howDecoderImplements:
            "Combines entropy windows, base64 / hex density, eval/exec/Invoke-Expression patterns, and AI explanation for context.",
          whenToUse: "Any script or binary from an untrusted source.",
          whenNotToUse:
            "Minified production bundles — expect false positives; pair with AI explain.",
          practicalExample:
            "A PowerShell loader with 0.92 entropy and Invoke-Expression on a base64 blob trips multiple rules at once.",
        },
      },
      faq: [
        {
          q: "Will minified JS be flagged?",
          a: "Yes — minification raises entropy. Use AI explain to confirm benign intent.",
        },
        {
          q: "Does it deobfuscate?",
          a: "Decoder identifies and explains; manual deobfuscation tools are out of scope.",
        },
      ],
      glossary: [
        {
          term: "Packing",
          definition: "Compressing/encrypting an executable to hide its real code until runtime.",
        },
        {
          term: "Base64 wall",
          definition: "Large base64 blob embedded inline — common loader pattern.",
        },
      ],
      cta: { label: "Try a malware scan", href: "/" },
    },
  },
};
