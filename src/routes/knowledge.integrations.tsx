import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { KnowledgeList } from "@/components/knowledge/KnowledgeList";
import { KNOWLEDGE_ENTRIES, getLocale } from "@/knowledge/registry";
import type { KnowledgeLang } from "@/knowledge/types";

const BASE = "https://decoderead.dev";
const URL = `${BASE}/knowledge/integrations`;
const TITLE = "Integrations — Decoder Knowledge Hub";
const DESC =
  "AI providers, local runtimes (Ollama, LM Studio) and source-control surfaces (GitHub) that Decoder plugs into.";

export const Route = createFileRoute("/knowledge/integrations")({
  component: Page,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          url: URL,
          description: DESC,
          hasPart: KNOWLEDGE_ENTRIES.filter((e) => e.type === "integration").map((e) => {
            const l = getLocale(e, "en");
            return {
              "@type": "TechArticle",
              headline: l.title,
              url: `${BASE}/knowledge/${e.slug}`,
              description: l.metaDescription,
            };
          }),
        }),
      },
    ],
  }),
});

function Page() {
  const { i18n } = useTranslation();
  const lang = (["en", "it", "zh"].includes(i18n.language) ? i18n.language : "en") as KnowledgeLang;
  return <KnowledgeList lang={lang} lockedType="integration" />;
}
