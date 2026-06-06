import { createFileRoute, Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import {
  ArrowRight,
  Github,
  Globe2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Lock,
  Zap,
  Users,
  Bot,
  GitPullRequest,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { LandingMockup } from "@/components/LandingMockup";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decoder — Understand AI-generated code, in any language" },
      {
        name: "description",
        content:
          "Open-source code understanding for the AI era. Read, review and audit code written by Copilot, Cursor, Lovable and your team. BYOK cloud or fully local.",
      },
      { property: "og:title", content: "Decoder — Understand AI-generated code" },
      {
        property: "og:description",
        content:
          "Open-source code understanding for the AI era. BYOK cloud or fully local with Ollama / LM Studio.",
      },
      { property: "og:url", content: "https://decoder.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://decoder.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Decoder",
          description:
            "Open-source code understanding for the AI era — read, review and audit AI-generated code.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web, Linux, macOS, Windows",
          url: "https://decoder.lovable.app",
          license: "https://opensource.org/licenses/MIT",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();

  const nav = [
    { label: t("landing.nav.features"), href: "#features" },
    { label: t("landing.nav.howItWorks"), href: "#how-it-works" },
    { label: t("landing.nav.integrations"), href: "#integrations" },
    { label: t("landing.nav.openSource"), to: "/manifesto" as const },
    { label: t("landing.nav.docs"), to: "/docs" as const },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <Link to="/" aria-label={t("brand.name")}>
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
            <PublicHeaderAuthSlot />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex flex-wrap gap-2 text-xs">
              <Badge icon={<Sparkles className="h-3 w-3" />} label={t("landing.heroBadgeOpen")} />
              <Badge icon={<Lock className="h-3 w-3" />} label={t("landing.heroBadgePrivacy")} />
              <Badge icon={<Bot className="h-3 w-3" />} label={t("landing.heroBadgeAiEra")} />
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              <Trans
                i18nKey="landing.hero"
                components={{
                  1: (
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: "var(--gradient-accent)" }}
                    />
                  ),
                  2: (
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ backgroundImage: "var(--gradient-accent)" }}
                    />
                  ),
                }}
              />
            </h1>
            <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
              {t("landing.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  {t("landing.ctaStart")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={t("common.repoUrl")} target="_blank" rel="noreferrer">
                  {t("landing.ctaGithub")}
                  <Github className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="mt-10">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("landing.providersStrip")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <ProviderChip name="OpenAI" />
                <ProviderChip name="Anthropic" />
                <ProviderChip name="Google Gemini" />
                <ProviderChip name="OpenRouter" />
                <ProviderChip name="Ollama" />
              </div>
            </div>
          </div>
          <div className="relative flex items-center">
            <LandingMockup />
          </div>
        </div>
      </section>

      {/* Why now — AI-generated code era */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t("landing.whyNowKicker")}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
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

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Feature
            icon={<Globe2 className="h-5 w-5" />}
            title={t("landing.feature1Title")}
            body={t("landing.feature1Body")}
          />
          <Feature
            icon={<KeyRound className="h-5 w-5" />}
            title={t("landing.feature2Title")}
            body={t("landing.feature2Body")}
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title={t("landing.feature3Title")}
            body={t("landing.feature3Body")}
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl font-semibold tracking-tight">{t("landing.howTitle")}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("landing.howIntro")}</p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            <Step n={1} title={t("landing.step1Title")} body={t("landing.step1Body")} />
            <Step n={2} title={t("landing.step2Title")} body={t("landing.step2Body")} />
            <Step n={3} title={t("landing.step3Title")} body={t("landing.step3Body")} />
          </ol>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">{t("landing.integrationsTitle")}</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("landing.integrationsBody")}</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {["OpenAI", "Anthropic", "Google Gemini", "OpenRouter", "Ollama", "LM Studio", "GitHub"].map(
            (p) => (
              <div
                key={p}
                className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-card-foreground"
              >
                {p}
              </div>
            ),
          )}
        </div>
      </section>

      {/* Values strip */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
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

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <Logo />
          <nav className="flex gap-5">
            <Link to="/manifesto" className="hover:text-foreground">
              {t("landing.nav.manifesto")}
            </Link>
            <Link to="/docs" className="hover:text-foreground">
              {t("landing.nav.docs")}
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              {t("landing.nav.terms")}
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
      </footer>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

function ProviderChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70" />
      {name}
    </span>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <svg
        className="mt-5 h-10 w-full text-primary/40"
        viewBox="0 0 200 40"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 30 Q 25 5, 50 20 T 100 18 T 150 10 T 200 25"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
        {n}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </li>
  );
}

function WhyNowCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Value({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
