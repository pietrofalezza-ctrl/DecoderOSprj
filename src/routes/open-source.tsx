import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  FileText,
  Github,
  Globe2,
  Languages,
  Layers,
  ListChecks,
  MessageSquare,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/open-source")({
  head: () => ({
    meta: [
      { title: "Decoder — Open source guardrail for AI-generated code" },
      {
        name: "description",
        content:
          "Decoder is an open-source guardrail that grows with its community: open code, open prompts, open rules to question AI-generated code. MIT licensed.",
      },
      { property: "og:title", content: "Decoder — Open Source Guardrail" },
      {
        property: "og:description",
        content:
          "Open code, open prompts, open rules. A community-driven tool to question AI-generated code.",
      },
      { property: "og:url", content: "https://decoderead.dev/open-source" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://decoderead.dev/open-source" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Decoder",
          description:
            "Open-source guardrail to question AI-generated code. Open prompts, open rules, community-driven.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web, Linux, macOS, Windows",
          license: "https://opensource.org/licenses/MIT",
          codeRepository: "https://github.com/pietrofalezza-ctrl/DecoderOSprj",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: OpenSourcePage,
});

function OpenSourcePage() {
  const { t } = useTranslation();
  const repo = t("common.repoUrl");

  const openItems = [
    {
      icon: <Code2 className="h-5 w-5" />,
      title: t("openSource.open.codeTitle"),
      body: t("openSource.open.codeBody"),
      href: repo,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: t("openSource.open.promptsTitle"),
      body: t("openSource.open.promptsBody"),
      href: `${repo}/blob/main/src/lib/analysis-prompt.ts`,
    },
    {
      icon: <ListChecks className="h-5 w-5" />,
      title: t("openSource.open.rulesTitle"),
      body: t("openSource.open.rulesBody"),
      href: `${repo}/blob/main/src/lib/findings.ts`,
    },
    {
      icon: <Languages className="h-5 w-5" />,
      title: t("openSource.open.i18nTitle"),
      body: t("openSource.open.i18nBody"),
      href: `${repo}/tree/main/src/i18n/locales`,
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: t("openSource.open.designTitle"),
      body: t("openSource.open.designBody"),
      href: `${repo}/blob/main/src/styles.css`,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: t("manifesto.principles.localFirst.title"),
      body: t("manifesto.principles.localFirst.body"),
      href: `${repo}#local-mode`,
    },
  ];

  const roadmap = ["r1", "r2", "r3", "r4", "r5"] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.home")}
              </Link>
            </Button>
            <LangSwitcher />
            <ThemeToggle />
            <PublicHeaderAuthSlot showArrow={false} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
        {/* Hero */}
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            {t("openSource.kicker")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-medium leading-[1.1] tracking-tight md:text-6xl">
            {t("openSource.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t("openSource.intro")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-none">
              <a href={repo} target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {t("openSource.ctaRepo")}
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-none">
              <a href={`${repo}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
                {t("openSource.ctaContribute")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Cosa è aperto */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            {t("openSource.openTitle")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {openItems.map((it) => (
              <a
                key={it.title}
                href={it.href}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-4 border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  {it.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-medium">{it.title}</h3>
                    <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{it.body}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Roadmap pubblica */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            {t("openSource.roadmapTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("openSource.roadmapIntro")}</p>
          <p className="mt-4 max-w-2xl border-l-2 border-primary/60 bg-primary/5 px-4 py-3 text-sm text-foreground">
            {t("openSource.roadmapShipped")}
          </p>

          <ol className="mt-8 space-y-3">
            {roadmap.map((k, i) => (
              <li
                key={k}
                className="flex gap-4 border-l-2 border-border bg-card/40 p-4 pl-5 transition-colors hover:border-primary"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  R0{i + 1}
                </span>
                <span className="text-sm text-foreground">{t(`openSource.roadmap.${k}`)}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Estendi il guardrail */}
        <section className="mt-20 border border-border bg-card p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-medium tracking-tight">
                {t("openSource.extendTitle")}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                {t("openSource.extendBody")}
              </p>
              <Button asChild variant="link" className="mt-3 h-auto p-0">
                <a
                  href={`${repo}/blob/main/src/lib/analysis-prompt.ts`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("openSource.extendCta")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="mt-20">
          <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            {t("openSource.communityTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("openSource.communityBody")}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                icon: <MessageSquare className="h-4 w-4" />,
                label: t("landing.community.cta1Link"),
                href: `${repo}/issues`,
              },
              {
                icon: <Github className="h-4 w-4" />,
                label: t("openSource.joinCta"),
                href: repo,
              },
              {
                icon: <Globe2 className="h-4 w-4" />,
                label: t("contact.kicker"),
                href: "/contact",
                internal: true,
              },
            ].map((cta) =>
              cta.internal ? (
                <Link
                  key={cta.label}
                  to="/contact"
                  className="inline-flex items-center justify-between gap-2 border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="inline-flex items-center gap-2">
                    {cta.icon}
                    {cta.label}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <a
                  key={cta.label}
                  href={cta.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-2 border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="inline-flex items-center gap-2">
                    {cta.icon}
                    {cta.label}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              ),
            )}
          </div>
        </section>

        {/* Reassurance strip */}
        <section className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("landing.osStrip.license")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {t("landing.osStrip.communityOwned")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {t("landing.osStrip.noProfit")}
          </span>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <Logo />
          <nav className="flex flex-wrap justify-center gap-5">
            <Link to="/open-source" className="hover:text-foreground">
              {t("landing.nav.openSource")}
            </Link>
            <Link to="/manifesto" className="hover:text-foreground">
              {t("landing.nav.manifesto")}
            </Link>
            <Link to="/docs" className="hover:text-foreground">
              {t("landing.nav.docs")}
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              {t("landing.nav.terms")}
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              {t("contact.kicker")}
            </Link>
            <a href={repo} target="_blank" rel="noreferrer" className="hover:text-foreground">
              GitHub
            </a>
            <InstagramLink />
          </nav>
          <span>{t("footer.ownership")}</span>
        </div>
      </footer>
    </div>
  );
}
