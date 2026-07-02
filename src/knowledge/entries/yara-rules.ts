import type { KnowledgeEntry } from "../types";

export const yaraRules: KnowledgeEntry = {
  slug: "yara-rules",
  type: "concept",
  category: "Malware",
  tags: ["yara", "malware", "detection", "signatures"],
  related: ["static-malware-analysis", "binary-analysis", "obfuscation-detection"],
  i18n: {
    en: {
      title: "YARA Rules — Pattern-based malware detection",
      metaTitle: "YARA Rules in Decoder — Pattern matching for source and binary",
      metaDescription:
        "YARA is the de-facto standard for malware pattern matching. Decoder uses YARA-style heuristics alongside source-level rules to flag suspicious code.",
      intro:
        "YARA is a rule language used by malware analysts to describe families and behaviours. Decoder applies YARA-style heuristics during malware scans.",
      byLevel: {
        security: {
          whatItIs:
            "Declarative rules that match byte/string patterns and metadata to identify malware families.",
          whyUseful: "Fast, transparent, signature-style detection that explains itself.",
          howDecoderImplements:
            "Malware scan combines YARA-style heuristics with entropy and behavioural signals.",
          whenToUse: "Triaging suspicious binaries, scripts, or dropped payloads in a repo.",
          whenNotToUse:
            "Novel zero-days with no signature — pair with AI explain and obfuscation detection.",
          practicalExample:
            "A LockBit-style ransom note string trips a rule; severity escalates to Critical.",
        },
      },
      faq: [
        { q: "Can I add custom YARA rules?", a: "Custom rule packs are on the roadmap." },
        {
          q: "Are rules public?",
          a: "Heuristic packs are curated internally; we publish notes on major families.",
        },
      ],
      glossary: [
        { term: "Signature", definition: "A reusable pattern that identifies known malware." },
        {
          term: "IOC",
          definition: "Indicator of Compromise — observable artefact of an intrusion.",
        },
      ],
      cta: { label: "Run a malware scan", href: "/" },
    },
  },
};
