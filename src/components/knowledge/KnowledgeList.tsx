import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { KNOWLEDGE_ENTRIES, getLocale } from "@/knowledge/registry";
import type { KnowledgeLang, KnowledgeType } from "@/knowledge/types";
import { KnowledgeTopNav } from "@/components/knowledge/KnowledgeTopNav";

const TYPE_LABEL: Record<KnowledgeType, { title: string; intro: string }> = {
  capability: {
    title: "Capabilities",
    intro: "What Decoder can do — every analysis, chat and origin-detection flow shipped today.",
  },
  concept: {
    title: "Concepts",
    intro: "The ideas behind explainable code analysis: BYOK, severity, CWE mapping, regulations.",
  },
  integration: {
    title: "Integrations",
    intro: "AI providers, local runtimes and source-control surfaces Decoder plugs into.",
  },
  format: {
    title: "Formats",
    intro: "Languages, packaging and binary formats Decoder can ingest and reason about.",
  },
};

export function KnowledgeList({
  lang,
  lockedType,
}: {
  lang: KnowledgeLang;
  lockedType: KnowledgeType;
}) {
  const [q, setQ] = useState("");
  const meta = TYPE_LABEL[lockedType];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return KNOWLEDGE_ENTRIES.filter((e) => e.type === lockedType).filter((e) => {
      if (!needle) return true;
      const locale = getLocale(e, lang);
      const hay = [locale.title, locale.intro, e.tags.join(" "), e.category]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, lang, lockedType]);

  return (
    <>
      <KnowledgeTopNav />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/knowledge" className="hover:text-foreground">
            Knowledge Hub
          </Link>
          <span className="mx-2">/</span>
          <span>{meta.title}</span>
        </nav>
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Knowledge Hub · {lockedType}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{meta.title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{meta.intro}</p>
        </header>
        <div className="mb-6">
          <Input
            placeholder={`Search ${meta.title.toLowerCase()}…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((e) => {
            const locale = getLocale(e, lang);
            return (
              <li key={e.slug}>
                <Link
                  to="/knowledge/$slug"
                  params={{ slug: e.slug }}
                  className="block h-full rounded-lg border border-border bg-card p-4 transition hover:border-primary/50"
                >
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{e.category}</Badge>
                    {e.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="outline" className="text-muted-foreground">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                  <div className="font-medium">{locale.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{locale.intro}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        {filtered.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">No entries match your search.</p>
        )}
      </div>
    </>
  );
}
