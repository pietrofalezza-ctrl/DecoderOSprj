import type { KnowledgeEntry } from "../types";

export const githubIntegration: KnowledgeEntry = {
  slug: "github-integration",
  type: "integration",
  category: "Integrations",
  tags: ["github", "repo", "import"],
  related: ["repository-analysis", "zip-analysis", "dependency-analysis"],
  i18n: {
    en: {
      title: "GitHub Integration — Import a repo by URL",
      metaTitle: "GitHub in Decoder — Analyse any public repo by URL",
      metaDescription:
        "Paste any public GitHub URL into Decoder to import, scan, and chat with the repository. No git clone, no setup.",
      intro:
        "Decoder accepts any public GitHub URL: it pulls the tree and runs the same analysis pipeline as a ZIP upload.",
      byLevel: {
        beginner: {
          whatItIs: "A way to analyse code that lives on GitHub without downloading it yourself.",
          whyUseful: "One paste and you're scanning.",
          howDecoderImplements: "Enter the URL on the homepage, Decoder fetches and analyses.",
          whenToUse: "Auditing OSS, reviewing a PR you didn't write, exploring a new project.",
          whenNotToUse: "Private repos — use ZIP upload for those today.",
          practicalExample:
            "Paste github.com/owner/repo, hit Analyse, get findings in under a minute.",
        },
      },
      faq: [
        { q: "Private repos?", a: "Not yet — use ZIP upload. OAuth import is on the roadmap." },
        {
          q: "How big can a repo be?",
          a: "Size limits apply to keep the scan responsive; very large monorepos may need partial uploads.",
        },
      ],
      glossary: [
        { term: "Tarball", definition: "Compressed archive used to fetch a repo snapshot." },
      ],
      cta: { label: "Import a repo", href: "/" },
    },
  },
};
