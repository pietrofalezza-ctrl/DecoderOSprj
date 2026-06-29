import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_ENTRIES,
  getLocale,
} from "@/knowledge/registry";
import type { KnowledgeLang, KnowledgeType } from "@/knowledge/types";

const TYPES: ("all" | KnowledgeType)[] = [
  "all",
  "capability",
  "concept",
  "integration",
  "format",
];

export function KnowledgeIndex({ lang }: { lang: KnowledgeLang }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | KnowledgeType>("all");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return KNOWLEDGE_ENTRIES.filter((e) => {
      if (type !== "all" && e.type !== type) return false;
      if (category !== "all" && e.category !== category) return false;
      if (!needle) return true;
      const locale = getLocale(e, lang);
      const hay = [
        locale.title,
        locale.intro,
        locale.metaDescription,
        e.tags.join(" "),
        e.category,
        locale.faq.map((f) => f.q).join(" "),
        locale.glossary.map((g) => g.term).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [q, type, category, lang]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Knowledge Hub
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          A reference for code understanding and explainable static analysis
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Capabilities, concepts, integrations and formats behind Decoder — each page is a
          standalone reference, written for the level of detail you need.
        </p>
      </header>

      <nav aria-label="Browse by type" className="mb-6 flex flex-wrap gap-2">
        <Link to="/knowledge/capabilities" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:border-primary/50">
          Capabilities
        </Link>
        <Link to="/knowledge/concepts" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:border-primary/50">
          Concepts
        </Link>
        <Link to="/knowledge/integrations" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:border-primary/50">
          Integrations
        </Link>
        <Link to="/knowledge/formats" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:border-primary/50">
          Formats
        </Link>
      </nav>



      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <Input
          placeholder="Search capabilities, concepts, formats…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search the knowledge hub"
        />
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "all" ? "All types" : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {KNOWLEDGE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          No entries match these filters.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const locale = getLocale(e, lang);
            return (
              <li key={e.slug}>
                <Link
                  to="/knowledge/$slug"
                  params={{ slug: e.slug }}
                  className="block h-full rounded-xl border border-border bg-card p-5 transition hover:border-primary/50"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{e.type}</Badge>
                    <Badge variant="outline">{e.category}</Badge>
                  </div>
                  <h2 className="text-lg font-semibold leading-snug">{locale.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {locale.intro}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {e.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
