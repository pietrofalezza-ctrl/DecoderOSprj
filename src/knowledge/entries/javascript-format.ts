import type { KnowledgeEntry } from "../types";

export const javascriptFormat: KnowledgeEntry = {
  slug: "javascript-format",
  type: "format",
  category: "Formats",
  tags: ["javascript", "typescript", "js", "ts", "node"],
  related: [
    "static-malware-analysis",
    "secret-detection",
    "dependency-analysis",
    "obfuscation-detection",
  ],
  i18n: {
    en: {
      title: "JavaScript & TypeScript — Supported formats",
      metaTitle: "JS/TS support in Decoder — Static and malware analysis",
      metaDescription:
        "Decoder analyses .js, .ts, .jsx, .tsx files and npm projects. Rules cover eval, prototype pollution, postinstall hooks, secret leaks.",
      intro:
        "JavaScript and TypeScript are first-class in Decoder. Upload single files, ZIPs, or import a GitHub repo.",
      byLevel: {
        dev: {
          whatItIs: "Static + malware analysis for the JS/TS ecosystem.",
          whyUseful:
            "Most supply-chain attacks ship through npm — pattern detection plus manifest parsing matters.",
          howDecoderImplements:
            "Language-aware rules, package.json parsing, postinstall hook detection, entropy + obfuscation signals.",
          whenToUse: "Any JS/TS project review, especially fresh npm dependencies.",
          whenNotToUse: "Runtime taint tracking — Decoder is static.",
          practicalExample: "A postinstall script with curl|sh trips supply-chain alarms.",
        },
      },
      faq: [
        { q: "Minified bundles?", a: "Yes, but expect entropy noise — pair with AI explain." },
        { q: "Frameworks?", a: "Rules are framework-agnostic; React/Next/Vue/Svelte all work." },
      ],
      glossary: [
        {
          term: "Postinstall",
          definition: "npm lifecycle script that runs after install — common attack vector.",
        },
      ],
      cta: { label: "Scan a JS project", href: "/" },
    },
  },
};
