import type { KnowledgeEntry } from "../types";

export const chatWithCode: KnowledgeEntry = {
  slug: "chat-with-code",
  type: "capability",
  category: "Analysis",
  tags: ["chat", "ai", "repo"],
  related: ["repository-analysis", "byok", "local-ai", "ollama"],
  i18n: {
    en: {
      title: "Chat with Your Code",
      metaTitle: "Chat with a Repository — Decoder",
      metaDescription:
        "Ask questions about a repository in natural language. Decoder grounds answers in your files and remembers the conversation across sessions.",
      intro:
        "Chat with Your Code turns a repository into a queryable knowledge surface. Ask 'where is auth handled?' or 'what does this script do?' and get answers grounded in your actual files.",
      byLevel: {
        dev: {
          whatItIs:
            "Folder-scoped LLM chat with file-citation grounding and per-session persistence.",
          whyUseful:
            "Removes the cold-start cost of reading an unfamiliar codebase; pairs nicely with static analysis findings.",
          howDecoderImplements:
            "Folder-scoped chat sessions persist across logins; answers cite the files used; tone and proficiency hydrate from your profile.",
          whenToUse:
            "Onboarding, code review prep, exploring third-party drops, drafting documentation.",
          whenNotToUse:
            "Production decisions without verifying the cited code — LLMs still hallucinate.",
          practicalExample:
            "'Where does this app validate uploads?' → Decoder cites the relevant server function and quotes the zip-slip guard.",
        },
      },
      faq: [
        {
          q: "Does chat need an API key?",
          a: "Yes — BYOK or a local model. Static and malware analysis remain free without a key.",
        },
        {
          q: "Are chats saved?",
          a: "Yes, scoped to your account and the folder/repository they ran against.",
        },
      ],
      glossary: [
        {
          term: "Grounding",
          definition:
            "Anchoring an LLM answer in retrieved source content rather than the model's general knowledge.",
        },
      ],
      cta: { label: "Open the workspace", href: "/dashboard" },
    },
  },
};
