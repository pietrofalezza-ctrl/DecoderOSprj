import type { KnowledgeEntry } from "../types";

export const powershellAnalysis: KnowledgeEntry = {
  slug: "powershell-analysis",
  type: "format",
  category: "Formats",
  tags: ["powershell", "scripting", "security", "windows"],
  related: ["static-malware-analysis", "entropy", "ai-origin-detection"],
  i18n: {
    en: {
      title: "PowerShell Script Analysis",
      metaTitle: "Analyse a PowerShell Script Safely — Decoder",
      metaDescription:
        "Upload a .ps1 file to inspect obfuscation, encoded commands and suspicious cmdlets — without executing it.",
      intro:
        "PowerShell is the workhorse of Windows post-exploitation. Decoder reads `.ps1` files statically and surfaces the patterns attackers rely on: encoded commands, `Invoke-Expression`, download cradles, AMSI bypasses.",
      byLevel: {
        dev: {
          whatItIs: "Static, no-execution inspection of PowerShell scripts.",
          whyUseful:
            "Most malicious PowerShell is obfuscated; reading it by eye is slow and dangerous to run.",
          howDecoderImplements:
            "Lexical scan for high-signal cmdlets, decoded base64 payloads, entropy on string literals, optional AI verbalisation.",
          whenToUse: "Any untrusted `.ps1`, IR triage, training material, blue-team workflows.",
          whenNotToUse: "Live process behaviour — that needs ETW / sandboxing.",
          practicalExample:
            "A pasted script with `powershell -enc <base64>`: Decoder decodes the payload, flags the download cradle and shows the dropped URL.",
        },
      },
      faq: [
        { q: "Is the script executed?", a: "Never. It is read, not run." },
        {
          q: "Does Decoder decode `-EncodedCommand`?",
          a: "Yes — the decoded body is shown alongside the original.",
        },
      ],
      glossary: [
        {
          term: "Download cradle",
          definition:
            "A one-liner that pulls and executes remote PowerShell — a common malware staging pattern.",
        },
        {
          term: "AMSI",
          definition:
            "Anti-Malware Scan Interface — the Windows API that AV/EDR uses to inspect scripts at runtime.",
        },
      ],
      cta: { label: "Analyse a PowerShell file", href: "/dashboard" },
    },
  },
};
