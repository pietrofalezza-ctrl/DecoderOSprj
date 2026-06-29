import type { KnowledgeEntry } from "../types";

export const cweMapping: KnowledgeEntry = {
  slug: "cwe-mapping",
  type: "concept",
  category: "Analysis",
  tags: ["cwe", "mitre", "taxonomy", "security"],
  related: ["static-malware-analysis", "severity-scoring", "sast"],
  i18n: {
    en: {
      title: "CWE Mapping — Mapping findings to MITRE CWE",
      metaTitle: "CWE Mapping in Decoder — MITRE weakness IDs on every finding",
      metaDescription:
        "Decoder maps static and malware findings to MITRE CWE IDs so you can reason about weakness classes, dedupe across tools, and align with compliance.",
      intro:
        "CWE (Common Weakness Enumeration) is the MITRE taxonomy of software weaknesses. Decoder attaches a CWE ID where applicable so findings are comparable across tools and reports.",
      byLevel: {
        dev: {
          whatItIs: "Standard ID (e.g. CWE-798) attached to a finding to describe the weakness class.",
          whyUseful: "Stable vocabulary across SAST tools, easy mapping to OWASP Top 10 and compliance frameworks.",
          howDecoderImplements: "Rules declare a cweId; the report renders it as a link to the MITRE entry.",
          whenToUse: "Compliance reporting, dedup across multiple scanners, training material.",
          whenNotToUse: "Quick local triage — the severity badge is enough.",
          practicalExample: "A hardcoded credential lands as CWE-798; SQL injection as CWE-89.",
        },
      },
      faq: [
        { q: "Do all findings have a CWE?", a: "Most static rules do. Malware heuristics may not — they describe behaviour, not weaknesses." },
        { q: "OWASP Top 10?", a: "CWE IDs map cleanly to OWASP categories via MITRE's published table." },
      ],
      glossary: [
        { term: "CWE", definition: "Common Weakness Enumeration — MITRE's catalog of software weaknesses." },
        { term: "MITRE", definition: "Non-profit that maintains CWE, CVE, and ATT&CK." },
      ],
      cta: { label: "See the static analyzer", href: "/knowledge/static-malware-analysis" },
    },
  },
};
