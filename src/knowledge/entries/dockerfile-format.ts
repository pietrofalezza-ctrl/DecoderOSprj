import type { KnowledgeEntry } from "../types";

export const dockerfileFormat: KnowledgeEntry = {
  slug: "dockerfile-format",
  type: "format",
  category: "Formats",
  tags: ["docker", "dockerfile", "container", "devops"],
  related: ["static-malware-analysis", "supply-chain-security", "secret-detection"],
  i18n: {
    en: {
      title: "Dockerfile — Supported format",
      metaTitle: "Dockerfile support in Decoder — Container build static analysis",
      metaDescription:
        "Decoder reads Dockerfiles to spot risky patterns: latest tags, root user, ADD from URL, baked secrets, curl|sh installs.",
      intro:
        "Dockerfiles are configuration that becomes runtime. Decoder flags the common foot-guns before they hit your registry.",
      byLevel: {
        dev: {
          whatItIs: "Static analysis tuned to Dockerfile directives.",
          whyUseful: "Container security starts at the build — bad bases and root users are the most common issues.",
          howDecoderImplements: "Rules over FROM, RUN, USER, ADD, COPY, ENV; entropy on env values to flag baked secrets.",
          whenToUse: "Every container image review.",
          whenNotToUse: "Runtime container scanning — pair with a registry scanner.",
          practicalExample: "FROM ubuntu:latest + missing USER directive + ENV API_KEY=... → three findings stacked.",
        },
      },
      faq: [
        { q: "Compose files?", a: "docker-compose.yml support is on the roadmap." },
        { q: "Image layers?", a: "Decoder reads the Dockerfile, not built layers." },
      ],
      glossary: [
        { term: "Base image", definition: "The FROM line — your container's starting filesystem." },
      ],
      cta: { label: "Scan a Dockerfile", href: "/" },
    },
  },
};
