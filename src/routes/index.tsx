import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  ArrowRight,
  Github,
  ShieldCheck,
  Sparkles,
  Zap,
  Users,
  Bot,
  GitPullRequest,
  Eye,
  GitFork,
  MessageSquare,
  Languages,
  Scale,
  HeartHandshake,
  Menu,
  Download,
  Monitor,
  Smartphone,
  Apple,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import {
  GuardrailDiagram,
  CommunityCard,
  Step,
  WhyNowCard,
  Value,
} from "@/components/landing/landing-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decoder — AI code analysis & AI-generated code review" },
      {
        name: "description",
        content:
          "Open-source AI code analysis. Audit AI-generated code from Copilot, Cursor and Claude with BYOK cloud or local models, plus static and malware checks.",
      },
      { property: "og:title", content: "Decoder — AI code analysis & AI-generated code review" },
      {
        property: "og:description",
        content:
          "Open-source AI code analysis. Review AI-generated code, run static & malware checks, chat with your repo. BYOK cloud or fully local with Ollama / LM Studio.",
      },
      { property: "og:url", content: "https://decoderead.dev/" },
    ],
    links: [{ rel: "canonical", href: "https://decoderead.dev/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Decoder",
          description:
            "Open-source AI code analysis tool. Review AI-generated code, run static and malware checks, chat with your repository.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web, Linux, macOS, Windows",
          url: "https://decoderead.dev",
          license: "https://opensource.org/licenses/MIT",
          keywords:
            "AI code analysis, AI code review, AI-generated code, static code analysis, malware analysis",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { canPrompt, installed, isIos, promptInstall } = usePwaInstall();
  const handleInstall = async () => {
    if (canPrompt) {
      await promptInstall();
      return;
    }
    document.getElementById("install")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const showInstallBtn = !installed;

  const nav = [
    { label: t("landing.nav.howItWorks"), href: "#how-it-works" },
    { label: t("landing.nav.integrations"), href: "#integrations" },
    { label: t("landing.nav.openSource"), to: "/open-source" as const },
    { label: t("landing.nav.manifesto"), to: "/manifesto" as const },
    { label: t("landing.nav.docs"), to: "/docs" as const },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background sm:bg-background/80 sm:backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link to="/" aria-label={t("brand.name")} className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {nav.map((item) =>
              "to" in item && item.to ? (
                <Link key={item.label} to={item.to} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} className="hover:text-foreground">
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="flex items-center gap-1">
            <LangSwitcher />
            <ThemeToggle />
            <div className="hidden sm:block">
              <PublicHeaderAuthSlot />
            </div>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>{t("brand.name")}</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1 text-base">
                  {nav.map((item) =>
                    "to" in item && item.to ? (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-md px-3 py-3 hover:bg-accent"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-md px-3 py-3 hover:bg-accent"
                      >
                        {item.label}
                      </a>
                    ),
                  )}
                  <a
                    href={t("common.repoUrl")}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 inline-flex items-center gap-2 rounded-md px-3 py-3 hover:bg-accent"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                  <div className="mt-4 border-t border-border pt-4">
                    <Link
                      to="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      {t("landing.ctaStart")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero — editorial */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-12 md:gap-16 md:py-28">
          <div className="md:col-span-7 space-y-8 min-w-0">
            <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
              <span className="border-b border-border pb-1">Case Study 01</span>
              <span className="border-b border-border pb-1">{t("landing.heroBadgeOpen")}</span>
              <span className="border-b border-border pb-1">{t("landing.heroBadgePrivacy")}</span>
            </div>

            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-7xl">
              <Trans
                i18nKey="landing.hero"
                components={{
                  1: <span className="italic" />,
                  2: <span className="italic" />,
                }}
              />
            </h1>

            <p className="max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
              {t("landing.heroSubtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 sm:gap-6">
              <Button asChild size="lg" className="rounded-none px-6 w-full sm:w-auto">
                <Link to="/auth">
                  {t("landing.ctaStart")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <a
                href={t("common.repoUrl")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-5 w-5" />
                {t("landing.ctaGithub")}
              </a>
            </div>

            <div className="pt-8 md:pt-10">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                {t("landing.providersStrip")}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-tight text-muted-foreground sm:gap-x-8 sm:text-xs">
                <span>01. OPENAI</span>
                <span>02. ANTHROPIC</span>
                <span>03. GOOGLE</span>
                <span>04. OPENROUTER</span>
                <span>05. OLLAMA</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center min-w-0">
            <div className="relative mx-auto w-full max-w-[min(384px,100%)] aspect-square border border-border bg-card p-6 sm:p-8 flex flex-col items-center justify-center md:max-w-none">
              <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-border" />
              <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-border" />
              <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-border" />
              <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-border" />

              <div className="w-full space-y-6 opacity-90">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <div className="border border-border px-3 py-1 font-mono text-[10px] text-muted-foreground">
                    RAW_INPUT
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="relative border border-border p-6">
                  <div className="space-y-3">
                    <div className="h-1.5 w-full bg-muted" />
                    <div className="h-1.5 w-3/4 bg-muted" />
                    <div className="h-1.5 w-5/6 bg-muted/60" />
                    <div className="h-1.5 w-1/2 bg-muted" />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative h-12 w-px bg-border">
                    <span className="absolute -left-1 bottom-0 h-2 w-2 rotate-45 border-b border-r border-border" />
                  </div>
                </div>

                <div className="border border-border bg-background/40 p-6">
                  <div className="mb-4 flex justify-between">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                    <span className="font-mono text-[9px] text-muted-foreground">
                      PARSED_SCHEMA.V1
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="h-1 w-4 bg-muted-foreground/60" />
                      <div className="h-1 w-full bg-muted" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-1 w-4 bg-muted-foreground/60" />
                      <div className="h-1 w-2/3 bg-muted" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                Analysis · Logic Visualization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open-source strip — guardrail framing */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {t("landing.osStrip.kicker")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight md:text-3xl">
              {t("landing.osStrip.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("landing.osStrip.body")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-5 md:justify-end">
            <Button asChild size="sm" variant="outline" className="rounded-none">
              <a href={t("common.repoUrl")} target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {t("landing.osStrip.ctaRepo")}
              </a>
            </Button>
            <Button asChild size="sm" className="rounded-none">
              <Link to="/open-source">
                <GitFork className="mr-2 h-4 w-4" />
                {t("landing.osStrip.ctaContribute")}
              </Link>
            </Button>
          </div>
          <div className="md:col-span-12">
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Scale className="h-3 w-3" />
                {t("landing.osStrip.license")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HeartHandshake className="h-3 w-3" />
                {t("landing.osStrip.noProfit")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                {t("landing.osStrip.communityOwned")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Guardrail mission */}
      <section className="border-b border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {t("landing.guardrail.kicker")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl">
                {t("landing.guardrail.title")}
              </h2>
              <p className="mt-5 text-muted-foreground">{t("landing.guardrail.intro")}</p>
              <div className="mt-8">
                <GuardrailDiagram t={t} />
              </div>
            </div>

            <ol className="space-y-6 md:col-span-7">
              {[
                {
                  icon: <ShieldCheck className="h-5 w-5" />,
                  title: t("landing.guardrail.point1Title"),
                  body: t("landing.guardrail.point1Body"),
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: t("landing.guardrail.point2Title"),
                  body: t("landing.guardrail.point2Body"),
                },
                {
                  icon: <GitPullRequest className="h-5 w-5" />,
                  title: t("landing.guardrail.point3Title"),
                  body: t("landing.guardrail.point3Body"),
                },
              ].map((p, i) => (
                <li
                  key={p.title}
                  className="flex gap-5 border-l-2 border-border pl-6 transition-colors hover:border-primary"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-primary">
                      {p.icon}
                    </div>
                    <h3 className="font-display text-xl font-medium">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Why now — AI-generated code era */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("landing.whyNowKicker")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
              {t("landing.whyNowTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("landing.whyNowIntro")}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <WhyNowCard
              icon={<Bot className="h-5 w-5" />}
              title={t("landing.whyNow1Title")}
              body={t("landing.whyNow1Body")}
            />
            <WhyNowCard
              icon={<GitPullRequest className="h-5 w-5" />}
              title={t("landing.whyNow2Title")}
              body={t("landing.whyNow2Body")}
            />
            <WhyNowCard
              icon={<Eye className="h-5 w-5" />}
              title={t("landing.whyNow3Title")}
              body={t("landing.whyNow3Body")}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {t("landing.howTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("landing.howIntro")}</p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            <Step n={1} title={t("landing.step1Title")} body={t("landing.step1Body")} />
            <Step n={2} title={t("landing.step2Title")} body={t("landing.step2Body")} />
            <Step n={3} title={t("landing.step3Title")} body={t("landing.step3Body")} />
          </ol>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {t("landing.integrationsTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("landing.integrationsBody")}</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            "OpenAI",
            "Anthropic",
            "Google Gemini",
            "OpenRouter",
            "Ollama",
            "LM Studio",
            "GitHub",
          ].map((p) => (
            <div
              key={p}
              className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-card-foreground"
            >
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* Values strip */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 md:py-12">
          <Value
            icon={<Sparkles className="h-5 w-5" />}
            title={t("landing.value100Open")}
            body={t("landing.valueOpenSource")}
          />
          <Value
            icon={<ShieldCheck className="h-5 w-5" />}
            title={t("landing.valuePrivacy")}
            body={t("landing.valuePrivacyBody")}
          />
          <Value
            icon={<Zap className="h-5 w-5" />}
            title={t("landing.valueNoLockin")}
            body={t("landing.valueNoLockinBody")}
          />
          <Value
            icon={<Users className="h-5 w-5" />}
            title={t("landing.valueForAll")}
            body={t("landing.valueForAllBody")}
          />
        </div>
      </section>

      {/* Community CTA */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {t("landing.community.kicker")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
              {t("landing.community.title")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("landing.community.body")}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <CommunityCard
              icon={<MessageSquare className="h-5 w-5" />}
              title={t("landing.community.cta1Title")}
              body={t("landing.community.cta1Body")}
              link={t("landing.community.cta1Link")}
              href={`${t("common.repoUrl")}/issues`}
            />
            <CommunityCard
              icon={<GitPullRequest className="h-5 w-5" />}
              title={t("landing.community.cta2Title")}
              body={t("landing.community.cta2Body")}
              link={t("landing.community.cta2Link")}
              href={`${t("common.repoUrl")}/blob/main/src/lib/analysis-prompt.ts`}
            />
            <CommunityCard
              icon={<Languages className="h-5 w-5" />}
              title={t("landing.community.cta3Title")}
              body={t("landing.community.cta3Body")}
              link={t("landing.community.cta3Link")}
              href={`${t("common.repoUrl")}/tree/main/src/i18n/locales`}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
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
              <a
                href={t("common.repoUrl")}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </nav>
            <span>{t("footer.ownership")}</span>
          </div>
          <p className="mt-6 border-t border-border/40 pt-6 text-center text-[11px] leading-relaxed text-muted-foreground/80 md:text-left">
            {t("footer.disclaimer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
