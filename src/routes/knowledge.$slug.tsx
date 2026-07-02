import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { KnowledgeContent } from "@/components/knowledge/KnowledgeContent";
import { getEntry, getLocale } from "@/knowledge/registry";
import type { KnowledgeLang } from "@/knowledge/types";

const BASE = "https://decoderead.dev";

export const Route = createFileRoute("/knowledge/$slug")({
  loader: ({ params }) => {
    const entry = getEntry(params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  component: KnowledgePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">Not found in the Knowledge Hub</h1>
      <p className="mt-2 text-muted-foreground">
        That entry doesn't exist (yet). Browse the index for what we cover today.
      </p>
      <Button asChild className="mt-6">
        <Link to="/knowledge">Open Knowledge Hub</Link>
      </Button>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  ),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [] };
    const { entry } = loaderData;
    const locale = getLocale(entry, "en");
    const url = `${BASE}/knowledge/${params.slug}`;
    return {
      meta: [
        { title: locale.metaTitle },
        { name: "description", content: locale.metaDescription },
        { property: "og:title", content: locale.metaTitle },
        { property: "og:description", content: locale.metaDescription },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: locale.metaTitle },
        { name: "twitter:description", content: locale.metaDescription },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: locale.title,
            description: locale.metaDescription,
            url,
            inLanguage: "en",
            about: entry.tags,
            articleSection: entry.category,
            publisher: {
              "@type": "Organization",
              name: "Decoder",
              url: BASE,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Knowledge Hub",
                item: `${BASE}/knowledge`,
              },
              { "@type": "ListItem", position: 2, name: entry.category },
              { "@type": "ListItem", position: 3, name: locale.title, item: url },
            ],
          }),
        },
        ...(locale.faq.length > 0
          ? [
              {
                type: "application/ld+json" as const,
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: locale.faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              },
            ]
          : []),
        ...(locale.glossary.length > 0
          ? [
              {
                type: "application/ld+json" as const,
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "DefinedTermSet",
                  name: `${locale.title} — Glossary`,
                  hasDefinedTerm: locale.glossary.map((g) => ({
                    "@type": "DefinedTerm",
                    name: g.term,
                    description: g.definition,
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
});

function KnowledgePage() {
  const { entry } = Route.useLoaderData();
  const { i18n } = useTranslation();
  const lang = (["en", "it", "zh"].includes(i18n.language) ? i18n.language : "en") as KnowledgeLang;
  return <KnowledgeContent entry={entry} lang={lang} />;
}
