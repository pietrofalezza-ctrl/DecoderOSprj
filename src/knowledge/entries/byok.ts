import type { KnowledgeEntry } from "../types";

export const byok: KnowledgeEntry = {
  slug: "byok",
  type: "concept",
  category: "Privacy",
  tags: ["privacy", "ai", "key", "byok"],
  related: ["local-ai", "ollama", "openrouter", "repository-analysis", "chat-with-code"],
  i18n: {
    en: {
      title: "BYOK — Bring Your Own Key",
      metaTitle: "BYOK in Decoder — Bring Your Own AI Key",
      metaDescription:
        "BYOK lets you wire your own AI provider (OpenAI, Anthropic, Gemini, OpenRouter) into Decoder. Encrypted at rest, never shared, fully under your control.",
      intro:
        "BYOK means you bring your own AI provider key. Decoder never proxies AI calls through a shared account: your key, your billing, your privacy boundary.",
      byLevel: {
        beginner: {
          whatItIs:
            "You connect your personal AI account to Decoder, instead of using a shared one.",
          whyUseful: "Your usage is yours: your billing, your privacy, your limits.",
          howDecoderImplements:
            "You paste your provider key in Settings. Decoder encrypts it and uses it only for your AI requests.",
          whenToUse:
            "When you want to use AI features (explanations, chat) and care about who can read your code.",
          whenNotToUse: "If you only need static and malware scans — those don't need any key.",
          practicalExample:
            "You paste your OpenRouter key, then click Explain on a function: Decoder calls OpenRouter as you, your tokens are billed to you.",
        },
        dev: {
          whatItIs:
            "Pattern where the application accepts user-supplied API credentials for an external provider instead of operating a shared backend account.",
          whyUseful:
            "Removes the shared-trust boundary, simplifies compliance, eliminates per-user rate-limit contention, lets each user pick model and cost ceiling.",
          howDecoderImplements:
            "Keys are stored AES-256-GCM encrypted in the database, decrypted only inside the server function that issues the provider call, never returned to the client. Per-provider metadata is surfaced through an admin-scoped view.",
          whenToUse:
            "Whenever you want AI features (explain, AI-origin verbalisation, repo chat). Required unless you run a local model.",
          whenNotToUse:
            "If the user must never see a provider error: BYOK exposes provider rate-limits and 4xx responses directly.",
          practicalExample:
            "Settings → Add OpenRouter key → ciphertext lands in user_ai_credentials. Calling Explain pulls the key admin-side, hits OpenRouter, streams the result back. No other user can read or use the key.",
        },
        security: {
          whatItIs:
            "User-isolated credential model: each AI call is authenticated with the requesting user's own provider key.",
          whyUseful:
            "No shared blast radius, no shared quota, per-user revocation, clean audit trail.",
          howDecoderImplements:
            "AES-256-GCM at rest, RLS scoped to owner_id, decryption only inside service-role server functions; the client never receives ciphertext or plaintext.",
          whenToUse:
            "Default for any multi-tenant AI feature in regulated or privacy-sensitive contexts.",
          whenNotToUse: "Anonymous public demos — there's no user to bind a key to.",
          practicalExample:
            "A pen-test confirms client-side requests cannot read user_ai_credentials; rotation in Settings invalidates the previous ciphertext immediately.",
        },
      },
      faq: [
        {
          q: "Where is my key stored?",
          a: "Encrypted at rest with AES-256-GCM in the project database, scoped to your user with RLS.",
        },
        {
          q: "Can Decoder admins read my key?",
          a: "Decryption happens only inside server functions that issue the AI call. The plaintext never leaves that boundary.",
        },
        {
          q: "Which providers are supported?",
          a: "OpenAI, Anthropic, Gemini and OpenRouter today. Local inference via Ollama / LM Studio bypasses BYOK entirely.",
        },
        {
          q: "What happens if I rotate or remove my key?",
          a: "AI features stop working immediately; static and malware scans keep running.",
        },
      ],
      glossary: [
        {
          term: "BYOK",
          definition: "Bring Your Own Key — the user supplies their own provider credential.",
        },
        {
          term: "RLS",
          definition:
            "Row-Level Security — database-side policy that scopes rows to the authenticated user.",
        },
        {
          term: "AES-256-GCM",
          definition: "Authenticated symmetric encryption used to protect credentials at rest.",
        },
      ],
      cta: { label: "Add your key in Settings", href: "/settings" },
    },
  },
};
