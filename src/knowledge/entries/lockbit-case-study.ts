import type { KnowledgeEntry } from "../types";

export const lockbitCaseStudy: KnowledgeEntry = {
  slug: "lockbit-case-study",
  type: "concept",
  category: "Malware",
  tags: ["lockbit", "ransomware", "case-study", "malware"],
  related: ["static-malware-analysis", "yara-rules", "obfuscation-detection", "powershell-analysis"],
  i18n: {
    en: {
      title: "LockBit 3.0 — Case study in Decoder",
      metaTitle: "LockBit 3.0 case study — How Decoder detects ransomware patterns",
      metaDescription:
        "Walkthrough of how Decoder's static + malware analysis surfaces LockBit 3.0 indicators in leaked source, contributed by the community.",
      intro:
        "LockBit 3.0 leaked source provided a real-world benchmark. This entry walks through what Decoder flags and why — useful as a reference for ransomware patterns.",
      byLevel: {
        security: {
          whatItIs: "Worked example of running Decoder against a known ransomware codebase.",
          whyUseful: "Demonstrates the signal mix — strings, behaviour, obfuscation — that flags ransomware-class code.",
          howDecoderImplements: "Static rules + malware heuristics combine on the upload; AI explain summarises the chain.",
          whenToUse: "Training, threat-modelling exercises, validating your own rule expectations.",
          whenNotToUse: "Live IR — use a dedicated EDR/sandbox.",
          practicalExample: "Ransom-note strings, shadow-copy deletion via wmic, and crypto routines line up as a coherent ransomware profile.",
        },
      },
      faq: [
        { q: "Do you ship the sample?", a: "No. We discuss patterns and let users bring their own samples." },
        { q: "Who contributed this?", a: "Community contribution highlighted in the project changelog." },
      ],
      glossary: [
        { term: "Ransomware", definition: "Malware that encrypts data and demands payment for decryption." },
        { term: "Shadow copy", definition: "Windows backup feature commonly deleted by ransomware." },
      ],
      cta: { label: "Read about malware analysis", href: "/knowledge/static-malware-analysis" },
    },
  },
};
