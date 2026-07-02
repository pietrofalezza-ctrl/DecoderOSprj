import type { KnowledgeEntry } from "../types";

export const repositoryAnalysis: KnowledgeEntry = {
  slug: "repository-analysis",
  type: "capability",
  category: "Analysis",
  tags: ["repo", "github", "zip", "analysis"],
  related: [
    "zip-analysis",
    "chat-with-code",
    "ai-origin-detection",
    "static-malware-analysis",
    "byok",
  ],
  i18n: {
    en: {
      title: "Repository Analysis",
      metaTitle: "Repository Analysis — Understand a Codebase Fast",
      metaDescription:
        "Drop a ZIP or paste a public Git URL. Decoder maps the repository, runs static and security checks, and lets you ask questions about any file.",
      intro:
        "Repository Analysis turns a codebase into something you can read, search and interrogate. Upload a ZIP or import a public GitHub project; Decoder indexes structure, runs static checks and gates AI features behind your own key.",
      byLevel: {
        dev: {
          whatItIs:
            "Whole-project ingest: tree, file metadata, language detection, per-file static signals.",
          whyUseful:
            "Replaces the 'clone, grep, hope' loop. You see the shape of the project, surface risky files first, then jump to AI explanations only where useful.",
          howDecoderImplements:
            "ZIP or Git URL → server-side extraction (zip-slip and size guards) → per-file language + size metadata → static + malware pass → on-demand AI explain / chat using your BYOK or local model.",
          whenToUse:
            "Onboarding to a new repo, reviewing a third-party drop, auditing an open-source dependency, triaging a suspected malicious archive.",
          whenNotToUse:
            "Tracking long-lived diffs across many commits — use a code-review tool for that.",
          practicalExample:
            "Paste a public GitHub URL of an abandoned plugin: Decoder shows the file tree, flags two files with high-entropy strings, and lets you chat with the codebase before integrating it.",
        },
      },
      faq: [
        { q: "What inputs are accepted?", a: "Single file, ZIP archive, or a public Git URL." },
        {
          q: "Is my repository visible to other users?",
          a: "No. Row-Level Security scopes every repository to its owner_id.",
        },
        {
          q: "Do I need an API key?",
          a: "Only for AI features. Static and malware scans run free.",
        },
      ],
      glossary: [
        {
          term: "Zip slip",
          definition:
            "Vulnerability where a crafted archive entry writes outside the extraction directory; Decoder rejects such entries.",
        },
        {
          term: "Indexing",
          definition: "Building a queryable representation of a repository's files and metadata.",
        },
      ],
      cta: { label: "Open a repository", href: "/dashboard" },
    },
  },
};
