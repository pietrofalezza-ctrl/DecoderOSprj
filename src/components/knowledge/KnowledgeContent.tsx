import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLocale, getRelatedEntries } from "@/knowledge/registry";
import { KnowledgeTopNav } from "@/components/knowledge/KnowledgeTopNav";
import type { KnowledgeEntry, KnowledgeLang, KnowledgeLevel } from "@/knowledge/types";
import { KNOWLEDGE_LEVELS } from "@/knowledge/types";

const LEVEL_LABEL: Record<KnowledgeLevel, string> = {
  beginner: "Beginner",
  junior: "Junior dev",
  dev: "Developer",
  senior: "Senior",
  security: "Security engineer",
  cto: "CTO",
};

export function KnowledgeContent({
  entry,
  lang,
  initialLevel,
}: {
  entry: KnowledgeEntry;
  lang: KnowledgeLang;
  initialLevel?: KnowledgeLevel;
}) {
  const locale = getLocale(entry, lang);
  const availableLevels = useMemo(
    () => KNOWLEDGE_LEVELS.filter((l) => locale.byLevel[l]),
    [locale],
  );
  const defaultLevel: KnowledgeLevel =
    initialLevel && availableLevels.includes(initialLevel)
      ? initialLevel
      : availableLevels.includes("dev")
        ? "dev"
        : (availableLevels[0] ?? "dev");
  const [level, setLevel] = useState<KnowledgeLevel>(defaultLevel);
  const content = locale.byLevel[level] ?? locale.byLevel[availableLevels[0]!];
  const related = getRelatedEntries(entry.slug);

  return (
    <>
      <KnowledgeTopNav />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/knowledge" className="hover:text-foreground">
            Knowledge Hub
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={
              entry.type === "capability"
                ? "/knowledge/capabilities"
                : entry.type === "concept"
                  ? "/knowledge/concepts"
                  : entry.type === "integration"
                    ? "/knowledge/integrations"
                    : "/knowledge/formats"
            }
            className="hover:text-foreground"
          >
            {entry.type === "capability"
              ? "Capabilities"
              : entry.type === "concept"
                ? "Concepts"
                : entry.type === "integration"
                  ? "Integrations"
                  : "Formats"}
          </Link>
          <span className="mx-2">/</span>
          <span>{entry.category}</span>
        </nav>

        <header className="mb-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{entry.type}</Badge>
            <Badge variant="outline">{entry.category}</Badge>
            {entry.tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="outline" className="text-muted-foreground">
                #{t}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{locale.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{locale.intro}</p>
        </header>

        {availableLevels.length > 1 && (
          <div className="mb-8 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <span className="text-sm font-medium">Reading level</span>
            <Select value={level} onValueChange={(v) => setLevel(v as KnowledgeLevel)}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LEVEL_LABEL[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {content && (
          <div className="space-y-8">
            <Section title="What it is">{content.whatItIs}</Section>
            <Section title="Why it's useful">{content.whyUseful}</Section>
            <Section title="How Decoder implements it">{content.howDecoderImplements}</Section>
            <Section title="When to use it">{content.whenToUse}</Section>
            <Section title="When NOT to use it">{content.whenNotToUse}</Section>
            <Section title="Practical example">{content.practicalExample}</Section>
          </div>
        )}

        {locale.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              {locale.faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {locale.glossary.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Glossary</h2>
            <dl className="space-y-3">
              {locale.glossary.map((g) => (
                <div key={g.term} className="rounded-md border border-border bg-card p-4">
                  <dt className="font-medium">{g.term}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => {
                const rl = getLocale(r, lang);
                return (
                  <Link
                    key={r.slug}
                    to="/knowledge/$slug"
                    params={{ slug: r.slug }}
                    className="rounded-lg border border-border bg-card p-4 transition hover:border-primary/50"
                  >
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {r.type}
                    </div>
                    <div className="mt-1 font-medium">{rl.title}</div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{rl.intro}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <Button asChild size="lg">
            <a href={locale.cta.href}>{locale.cta.label}</a>
          </Button>
        </div>
      </article>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="leading-relaxed text-foreground/90">{children}</p>
    </section>
  );
}
