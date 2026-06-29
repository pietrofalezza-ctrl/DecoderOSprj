import type { KnowledgeEntry } from "../types";

export const supplyChainSecurity: KnowledgeEntry = {
  slug: "supply-chain-security",
  type: "concept",
  category: "Security",
  tags: ["supply-chain", "slsa", "sbom", "dependencies"],
  related: ["dependency-analysis", "static-malware-analysis", "lockbit-case-study"],
  i18n: {
    en: {
      title: "Supply Chain Security — Trusting what you ship",
      metaTitle: "Supply Chain Security in Decoder — SBOM, SLSA, dependency risk",
      metaDescription:
        "Software supply chain attacks target dependencies, build pipelines, and registries. Decoder helps inspect the third-party surface of any project.",
      intro:
        "Supply chain security is about trusting the code you didn't write. Decoder helps inventory and inspect that surface during analysis.",
      byLevel: {
        security: {
          whatItIs: "Discipline focused on the integrity of dependencies, build systems, and distribution channels.",
          whyUseful: "Modern breaches (SolarWinds, xz-utils, npm event-stream) come from upstream, not your code.",
          howDecoderImplements: "Dependency surfacing + malware scan on uploaded sources; reports highlight unexpected scripts or postinstall hooks.",
          whenToUse: "Reviewing new dependencies, auditing third-party drops, evaluating M&A repos.",
          whenNotToUse: "Build provenance / SLSA attestations — out of scope today.",
          practicalExample: "A postinstall hook executing curl|sh from a fresh npm package is flagged during scan.",
        },
      },
      faq: [
        { q: "SBOM support?", a: "Reading existing SBOMs is on the roadmap; generation is not." },
        { q: "Is local inference safer?", a: "Yes for confidentiality — code never leaves your machine." },
      ],
      glossary: [
        { term: "SBOM", definition: "Software Bill of Materials — inventory of components." },
        { term: "SLSA", definition: "Supply-chain Levels for Software Artifacts — build-integrity framework." },
      ],
      cta: { label: "Inspect a repository", href: "/" },
    },
  },
};
