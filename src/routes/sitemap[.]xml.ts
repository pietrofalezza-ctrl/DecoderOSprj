import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { KNOWLEDGE_ENTRIES } from "@/knowledge/registry";

const BASE_URL = "https://decoderead.dev";
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  alternates?: { hreflang: string; href: string }[];
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/auth", changefreq: "yearly", priority: "0.3" },
  { path: "/install", changefreq: "monthly", priority: "0.6" },
  { path: "/manifesto", changefreq: "monthly", priority: "0.8" },
  { path: "/contributors", changefreq: "daily", priority: "0.7" },
  { path: "/open-source", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/cookies", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/data-flow", changefreq: "monthly", priority: "0.5" },
  { path: "/docs", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/how-to-review-ai-code", changefreq: "monthly", priority: "0.8" },
  { path: "/docs/comparison-coderabbit", changefreq: "monthly", priority: "0.8" },
  { path: "/docs/ai-code-review-tools-byok", changefreq: "monthly", priority: "0.8" },
  { path: "/docs/open-source-ai-code-review", changefreq: "monthly", priority: "0.8" },
  { path: "/docs/detect-ai-generated-code", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/free-malware-scanner-source-code", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/static-code-analysis-no-api-key", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/chat-with-your-codebase", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/ai-code-review-vs-human", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/secure-code-review-byok", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/ai-code-review-milano-nord-italia", changefreq: "monthly", priority: "0.7" },
  {
    path: "/docs/eu-ai-act-code-analysis",
    changefreq: "monthly",
    priority: "0.8",
    alternates: [
      { hreflang: "en", href: `${BASE_URL}/docs/eu-ai-act-code-analysis` },
      { hreflang: "it", href: `${BASE_URL}/docs/it/eu-ai-act-analisi-codice` },
      { hreflang: "zh", href: `${BASE_URL}/docs/zh/eu-ai-act-code-analysis` },
      { hreflang: "x-default", href: `${BASE_URL}/docs/eu-ai-act-code-analysis` },
    ],
  },
  { path: "/docs/it/eu-ai-act-analisi-codice", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/zh/eu-ai-act-code-analysis", changefreq: "monthly", priority: "0.7" },
  {
    path: "/docs/gdpr-ai-code-review",
    changefreq: "monthly",
    priority: "0.8",
    alternates: [
      { hreflang: "en", href: `${BASE_URL}/docs/gdpr-ai-code-review` },
      { hreflang: "it", href: `${BASE_URL}/docs/it/gdpr-revisione-codice-ai` },
      { hreflang: "zh", href: `${BASE_URL}/docs/zh/gdpr-ai-code-review` },
      { hreflang: "x-default", href: `${BASE_URL}/docs/gdpr-ai-code-review` },
    ],
  },
  { path: "/docs/it/gdpr-revisione-codice-ai", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/zh/gdpr-ai-code-review", changefreq: "monthly", priority: "0.7" },
  {
    path: "/docs/privacy-first-ai-europe",
    changefreq: "monthly",
    priority: "0.8",
    alternates: [
      { hreflang: "en", href: `${BASE_URL}/docs/privacy-first-ai-europe` },
      { hreflang: "it", href: `${BASE_URL}/docs/it/ai-privacy-first-europa` },
      { hreflang: "zh", href: `${BASE_URL}/docs/zh/privacy-first-ai-europe` },
      { hreflang: "x-default", href: `${BASE_URL}/docs/privacy-first-ai-europe` },
    ],
  },
  { path: "/docs/it/ai-privacy-first-europa", changefreq: "monthly", priority: "0.7" },
  { path: "/docs/zh/privacy-first-ai-europe", changefreq: "monthly", priority: "0.7" },
  { path: "/knowledge", changefreq: "weekly", priority: "0.9" },
  { path: "/knowledge/capabilities", changefreq: "weekly", priority: "0.8" },
  { path: "/knowledge/concepts", changefreq: "weekly", priority: "0.8" },
  { path: "/knowledge/integrations", changefreq: "weekly", priority: "0.8" },
  { path: "/knowledge/formats", changefreq: "weekly", priority: "0.8" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const knowledgeEntries: SitemapEntry[] = KNOWLEDGE_ENTRIES.map((entry) => {
          const langs = (["en", "it", "zh"] as const).filter((l) => entry.i18n[l]);
          const alternates =
            langs.length > 1
              ? [
                  ...langs.map((l) => ({
                    hreflang: l,
                    href: `${BASE_URL}/knowledge/${entry.slug}${l === "en" ? "" : `?lang=${l}`}`,
                  })),
                  { hreflang: "x-default", href: `${BASE_URL}/knowledge/${entry.slug}` },
                ]
              : undefined;
          return {
            path: `/knowledge/${entry.slug}`,
            changefreq: "monthly",
            priority: "0.7",
            alternates,
          };
        });

        const entries: SitemapEntry[] = [...STATIC_ENTRIES, ...knowledgeEntries].map((e) => ({
          ...e,
          lastmod: e.lastmod ?? TODAY,
        }));

        const urls = entries.map((e) => {
          const lines = [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            `    <lastmod>${e.lastmod}</lastmod>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            ...(e.alternates ?? []).map(
              (a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`,
            ),
            `  </url>`,
          ];
          return lines.filter(Boolean).join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
