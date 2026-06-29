import type { KnowledgeEntry } from "../types";

export const severityScoring: KnowledgeEntry = {
  slug: "severity-scoring",
  type: "concept",
  category: "Analysis",
  tags: ["severity", "risk", "scoring", "cvss"],
  related: ["static-malware-analysis", "cwe-mapping", "sast"],
  i18n: {
    en: {
      title: "Severity Scoring — How Decoder ranks findings",
      metaTitle: "Severity Scoring in Decoder — Critical, High, Medium, Low",
      metaDescription:
        "How Decoder assigns severity to findings: signal weight, exploitability, and context. Map results to CVSS-like buckets and triage faster.",
      intro:
        "Severity tells you what to fix first. Decoder normalises every finding into Critical / High / Medium / Low using signal strength, exploitability, and project context.",
      byLevel: {
        beginner: {
          whatItIs: "A label on every issue that tells you how urgent it is.",
          whyUseful: "You fix the most dangerous things first instead of guessing.",
          howDecoderImplements: "Each finding carries a severity badge in the Insights tab.",
          whenToUse: "Always — use it to plan what to patch this sprint.",
          whenNotToUse: "When you want raw output: switch to the unfiltered list.",
          practicalExample: "A hardcoded admin password is flagged Critical; an unused import stays Low.",
        },
        dev: {
          whatItIs: "Normalised priority score across heterogeneous detectors (static, malware, secrets).",
          whyUseful: "Comparable triage across rule packs and languages.",
          howDecoderImplements: "Each rule emits a base severity, refined by entropy, reachability hints, and detector confidence.",
          whenToUse: "Sorting backlog, gating CI, building reports.",
          whenNotToUse: "When you need raw CVSS — Decoder severity is policy-relative, not CVSS-equivalent.",
          practicalExample: "Filter Critical+High and export to share with the security team.",
        },
      },
      faq: [
        { q: "Is it CVSS?", a: "No — it's a Decoder-internal label aligned to CVSS buckets but not a CVSS score." },
        { q: "Can I change thresholds?", a: "Not yet — severity is rule-defined. Custom policies are on the roadmap." },
        { q: "Does AI affect severity?", a: "AI explanations don't change severity. Only detector signals do." },
      ],
      glossary: [
        { term: "Critical", definition: "Likely exploitable, immediate risk." },
        { term: "Triage", definition: "Sorting findings by urgency before fixing." },
      ],
      cta: { label: "Open a project", href: "/" },
    },
  },
};
