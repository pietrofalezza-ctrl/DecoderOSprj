import type { KnowledgeEntry } from "../types";

export const pythonFormat: KnowledgeEntry = {
  slug: "python-format",
  type: "format",
  category: "Formats",
  tags: ["python", "py", "language"],
  related: ["static-malware-analysis", "secret-detection", "dependency-analysis"],
  i18n: {
    en: {
      title: "Python — Supported format",
      metaTitle: "Python support in Decoder — .py static and malware analysis",
      metaDescription:
        "Decoder analyses .py files and Python projects: static rules, secret detection, dependency parsing for requirements.txt / pyproject.toml.",
      intro:
        "Python is a first-class format in Decoder. Upload a single .py, a ZIP, or import a GitHub repo and get static + malware findings.",
      byLevel: {
        dev: {
          whatItIs: "Static + malware analysis tuned for Python idioms.",
          whyUseful:
            "Catches eval/exec misuse, hardcoded secrets, subprocess shell=True, pickle deserialisation, suspicious imports.",
          howDecoderImplements:
            "Language-aware rules + manifest parsing for requirements.txt, pyproject.toml, Pipfile.",
          whenToUse: "Any Python project review.",
          whenNotToUse: "Runtime profiling — Decoder is static-only.",
          practicalExample: "A pickle.loads on untrusted input lands as CWE-502 / High.",
        },
      },
      faq: [
        { q: "Which Python versions?", a: "Rules are version-agnostic at the source level." },
        { q: "Notebooks?", a: ".ipynb support is on the roadmap — export to .py for now." },
      ],
      glossary: [{ term: "CWE-502", definition: "Deserialisation of Untrusted Data." }],
      cta: { label: "Scan a Python file", href: "/" },
    },
  },
};
