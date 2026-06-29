import type { KnowledgeEntry } from "../types";

export const binaryAnalysis: KnowledgeEntry = {
  slug: "binary-analysis",
  type: "capability",
  category: "Analysis",
  tags: ["binary", "pe", "malware", "static"],
  related: ["static-malware-analysis", "entropy", "zip-analysis"],
  i18n: {
    en: {
      title: "Binary (PE) Analysis",
      metaTitle: "PE Binary Static Analysis — Decoder",
      metaDescription:
        "Parse Windows PE binaries to surface sections, imports, entropy and indicators — without executing them.",
      intro:
        "Decoder parses Windows PE binaries to expose the structural signals a reviewer needs: sections, imports, exports, per-section entropy and known IoCs.",
      byLevel: {
        dev: {
          whatItIs: "PE header and section parsing combined with entropy and IoC matching.",
          whyUseful: "Most static malware verdicts come from structure, not bytes. Surfacing imports and packed sections fast accelerates triage.",
          howDecoderImplements: "Custom PE parser → section metadata + entropy → import table extraction → IoC and string matchers → normalised report.",
          whenToUse: "Untrusted executables, dropped artefacts, suspicious attachments.",
          whenNotToUse: "Runtime behaviour analysis — that needs a sandbox.",
          practicalExample: "A dropper with a packed `.text` (entropy 7.85), Win32 imports (`VirtualAlloc`, `CreateProcessW`) and an encoded PowerShell stage embedded in `.rdata`.",
        },
      },
      faq: [
        { q: "What binary formats are supported?", a: "Windows PE today. ELF and Mach-O are on the roadmap." },
        { q: "Is the binary executed?", a: "No. Only parsed and inspected." },
      ],
      glossary: [
        { term: "PE", definition: "Portable Executable — the Windows binary format for .exe/.dll." },
        { term: "Import table", definition: "List of external functions a binary calls — often a strong behavioural hint." },
      ],
      cta: { label: "Analyse a binary", href: "/dashboard" },
    },
  },
};
