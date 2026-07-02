import type { KnowledgeEntry } from "../types";

export const dependencyAnalysis: KnowledgeEntry = {
  slug: "dependency-analysis",
  type: "capability",
  category: "Analysis",
  tags: ["dependencies", "sca", "supply-chain", "lockfile"],
  related: ["supply-chain-security", "repository-analysis", "static-malware-analysis"],
  i18n: {
    en: {
      title: "Dependency Analysis — Inspecting third-party code",
      metaTitle: "Dependency Analysis in Decoder — package.json, requirements, lockfiles",
      metaDescription:
        "Decoder parses package.json, requirements.txt, Cargo.toml, go.mod and lockfiles to surface third-party risk in any uploaded project.",
      intro:
        "Most code in any modern project isn't yours. Decoder reads manifests and lockfiles to map the dependency surface and flag suspicious entries.",
      byLevel: {
        dev: {
          whatItIs: "Static parse of manifests to enumerate packages, versions, and pinning state.",
          whyUseful:
            "Shows the real attack surface — typosquats, abandoned packages, unpinned ranges.",
          howDecoderImplements:
            "Parses common manifests during repo/ZIP analysis and surfaces them in the Insights tab.",
          whenToUse: "Auditing any third-party project, especially before merging or shipping.",
          whenNotToUse: "For runtime CVE tracking — pair with a dedicated SCA in CI.",
          practicalExample:
            "A package named reqeusts (typo) is flagged for review during a Python repo scan.",
        },
      },
      faq: [
        { q: "Does it check CVEs?", a: "Not yet — CVE/SCA integration is on the roadmap." },
        { q: "Which ecosystems?", a: "npm, pip, Cargo, Go modules, Maven, Gradle (basic)." },
      ],
      glossary: [
        { term: "SCA", definition: "Software Composition Analysis — auditing third-party code." },
        {
          term: "Lockfile",
          definition: "Pinned dependency manifest (package-lock.json, poetry.lock…).",
        },
      ],
      cta: { label: "Analyse a repo", href: "/" },
    },
  },
};
