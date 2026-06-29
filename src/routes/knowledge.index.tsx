import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { KnowledgeIndex } from "@/components/knowledge/KnowledgeIndex";
import { KNOWLEDGE_ENTRIES, getLocale } from "@/knowledge/registry";
import type { KnowledgeLang } from "@/knowledge/types";

const URL = "https://decoderead.dev/knowledge";

export const Route = createFileRoute("/knowledge")({
  component: KnowledgeHubIndex,
  head: () => ({
    meta: [
      { title: "Knowledge Hub — Decoder" },
      {
        name: "description",
        content:
          "A reference base for code understanding, explainable static analysis, BYOK AI, malware triage and the formats Decoder supports.",
      },
      { property: "og:title", content: "Knowledge Hub — Decoder" },
      {
        property: "og:description",
        content:
          "Capabilities, concepts, integrations and formats behind Decoder. Indexed for humans and LLMs.",
      },
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
          name: "Decoder Knowledge Hub",
          url: URL,
          description:
            "Reference base of capabilities, concepts, integrations and formats behind Decoder.",
          hasPart: KNOWLEDGE_ENTRIES.map((e) => {
            const locale = getLocale(e, "en");
            return {
              "@type": "TechArticle",
              headline: locale.title,
              url: `https://decoderead.dev/knowledge/${e.slug}`,
              description: locale.metaDescription,
            };
          }),
        }),
      },
    ],
  }),
});

function KnowledgeHubIndex() {
  const { i18n } = useTranslation();
  const lang = (["en", "it", "zh"].includes(i18n.language) ? i18n.language : "en") as KnowledgeLang;
  return <KnowledgeIndex lang={lang} />;
}
