import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { KnowledgeList } from "@/components/knowledge/KnowledgeList";
import { KNOWLEDGE_ENTRIES, getLocale } from "@/knowledge/registry";
import type { KnowledgeLang } from "@/knowledge/types";

const BASE = "https://decoderead.dev";
const URL = `${BASE}/knowledge/concepts`;
const TITLE = "Concepts — Decoder Knowledge Hub";
const DESC =
  "Core concepts behind explainable code analysis: BYOK, severity, CWE mapping, EU AI Act, GDPR and more.";

export const Route = createFileRoute("/knowledge/concepts")({
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
          hasPart: KNOWLEDGE_ENTRIES.filter((e) => e.type === "concept").map((e) => {
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
  return <KnowledgeList lang={lang} lockedType="concept" />;
}
