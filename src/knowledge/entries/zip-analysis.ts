import type { KnowledgeEntry } from "../types";

export const zipAnalysis: KnowledgeEntry = {
  slug: "zip-analysis",
  type: "format",
  category: "Formats",
  tags: ["zip", "archive", "security"],
  related: ["repository-analysis", "static-malware-analysis", "entropy"],
  i18n: {
    en: {
      title: "ZIP Archive Analysis",
      metaTitle: "Analyse a ZIP Archive Safely — Decoder",
      metaDescription:
        "Upload a ZIP and inspect every file without extracting it on your machine. Decoder enforces zip-slip and size guards server-side.",
      intro:
        "ZIPs are the most common way to ship code and the most abused way to ship malware. Decoder ingests a ZIP server-side with hardened guards and exposes its content for review.",
      byLevel: {
        dev: {
          whatItIs:
            "Server-side extraction and analysis of a ZIP archive with zip-slip and size protections.",
          whyUseful: "Lets you inspect untrusted archives without unpacking them locally.",
          howDecoderImplements:
            "Streaming extractor rejects entries with traversal paths or oversized members; per-file static analysis runs on the contents.",
          whenToUse: "Any untrusted ZIP — source drops, vendor deliveries, suspect attachments.",
          whenNotToUse:
            "Very large archives intended for batch processing — Decoder enforces upload limits.",
          practicalExample:
            "A vendor delivers a 40MB ZIP. Decoder extracts safely, flags a packed .exe inside and shows its entropy.",
        },
      },
      faq: [
        {
          q: "Is the ZIP extracted on my machine?",
          a: "No. Extraction happens server-side in a controlled environment.",
        },
        {
          q: "What is zip-slip?",
          a: "An attack where a ZIP entry writes outside the extraction directory via crafted paths. Decoder rejects such entries.",
        },
      ],
      glossary: [
        {
          term: "Zip slip",
          definition:
            "Archive-extraction vulnerability that lets an attacker write files outside the target directory.",
        },
      ],
      cta: { label: "Upload a ZIP", href: "/dashboard" },
    },
  },
};
