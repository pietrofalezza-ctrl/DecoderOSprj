import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  ArrowRight,
  Github,
  ShieldCheck,
  Menu,
  Download,
  FileCode2,
  FileArchive,
  Link2,
  Bug,
  Sparkles,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramIcon, InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";


import { usePwaInstall } from "@/hooks/use-pwa-install";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Decoder — AI code analysis & AI-generated code review" },
      {
        name: "description",
        content:
          "Open-source AI code analysis. Audit AI-generated code from Copilot, Cursor and Claude with BYOK cloud or local models, plus free static and malware checks.",
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
            "Open-source AI code analysis tool. Review AI-generated code, run static and malware checks, chat with your repository, keep a persistent analysis history.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web, Linux, macOS, Windows",
          url: "https://decoderead.dev",
          license: "https://opensource.org/licenses/MIT",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Can I upload just one file?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Decoder accepts a single source file (.js, .ts, .py, .java, .go, .rs, .sql and 20+ more), a ZIP archive of a folder, or a public GitHub/GitLab URL. All three options behave the same way — no setup required.",
              },
            },
            {
              "@type": "Question",
              name: "Do I need an API key to use Decoder?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. Static code analysis and malware scanning run fully offline with no API key. A BYOK cloud key (OpenAI, Anthropic, Gemini, OpenRouter) or a local Ollama / LM Studio endpoint is only needed for LLM-assisted explanations and chat.",
              },
            },
            {
              "@type": "Question",
              name: "Can I chat with my code?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Open a repository, pick a folder or file, then open the Chat tab. Conversations are persisted per repository so you can resume them later.",
              },
            },
            {
              "@type": "Question",
              name: "Are my analyses saved across sessions?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Every explanation, quality / security / AI-origin analysis, static scan and chat turn is persisted in your account history and is recoverable from the History page.",
              },
            },
            {
              "@type": "Question",
              name: "Which languages does the static analysis support?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "20+ languages including JavaScript, TypeScript, Python, Java, Rust, Go, C/C++, C#, Ruby, PHP, Kotlin, Swift and SQL.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
});

type Capability = {
  key: "static" | "malware" | "aiExplain" | "chat";
  icon: React.ReactNode;
  href?: string;
};

function CapabilityCard({ cap }: { cap: Capability }) {
  const { t } = useTranslation();
  const base = `landing.capabilities.${cap.key}`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex h-full min-h-[148px] w-full flex-col items-start gap-3 border border-border bg-card p-5 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary">
            {cap.icon}
          </span>
          <h3 className="font-display text-base font-medium">{t(`${base}.title`)}</h3>
          <p className="text-sm text-muted-foreground">{t(`${base}.short`)}</p>
          <span className="mt-auto inline-flex items-center gap-1 text-xs text-primary opacity-80 group-hover:opacity-100">
            {t("landing.capabilities.moreLink")}
            <ChevronRight className="h-3 w-3" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{t(`${base}.title`)}</DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed text-muted-foreground">
            {t(`${base}.long`)}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function Landing() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { canPrompt, installed, promptInstall } = usePwaInstall();
  const handleInstall = async () => {
    if (canPrompt) {
      await promptInstall();
      return;
    }
    window.location.href = "/install";
  };
  const showInstallBtn = !installed;

  const nav = [
    { label: "Knowledge", to: "/knowledge" as const },
    { label: t("landing.nav.docs"), to: "/docs" as const },
    { label: t("landing.nav.openSource"), to: "/open-source" as const },
    { label: t("landing.nav.manifesto"), to: "/manifesto" as const },
    { label: t("landing.learnMore.install"), to: "/install" as const },
  ];

  const capabilities: Capability[] = [
    { key: "static", icon: <ShieldCheck className="h-5 w-5" /> },
    { key: "malware", icon: <Bug className="h-5 w-5" /> },
    { key: "aiExplain", icon: <Sparkles className="h-5 w-5" /> },
    { key: "chat", icon: <MessageSquare className="h-5 w-5" /> },
  ];

  const inputs = [
    {
      icon: <FileCode2 className="h-5 w-5" />,
      title: t("landing.inputs.fileTitle"),
      body: t("landing.inputs.fileBody"),
    },
    {
      icon: <FileArchive className="h-5 w-5" />,
      title: t("landing.inputs.zipTitle"),
      body: t("landing.inputs.zipBody"),
    },
    {
      icon: <Link2 className="h-5 w-5" />,
      title: t("landing.inputs.urlTitle"),
      body: t("landing.inputs.urlBody"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b border-border/60 bg-background sm:bg-background/80 sm:backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div
          className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6"
          style={{
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          <Link to="/" aria-label={t("brand.name")} className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {nav.map((item) => (
              <Link key={item.label} to={item.to} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
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
                  className="h-10 w-10 md:hidden"
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
                  {nav.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-3 hover:bg-accent"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    to="/contributors"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-3 hover:bg-accent"
                  >
                    {t("landing.learnMore.contributors")}
                  </Link>
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
                  <a
                    href={t("common.instagramUrl")}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-3 hover:bg-accent"
                  >
                    <InstagramLink showLabel={false} className="text-foreground" />
                    Instagram
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

      {/* 1. Hero */}
      <section className="relative">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20 md:py-24">
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="border-b border-border pb-1">{t("landing.heroBadgeOpen")}</span>
            <span className="border-b border-border pb-1">{t("landing.heroBadgePrivacy")}</span>
          </div>

          <h1 className="mt-6 font-display text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <Trans
              i18nKey="landing.hero"
              components={{
                1: <span className="italic" />,
                2: <span className="italic" />,
              }}
            />
          </h1>

          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            {t("landing.heroSubtitle")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Button asChild size="lg" className="rounded-none px-6">
              <Link to="/auth">
                {t("landing.ctaStart")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {showInstallBtn && (
              <Button
                type="button"
                onClick={handleInstall}
                size="lg"
                variant="outline"
                className="rounded-none px-6"
              >
                <Download className="mr-2 h-4 w-4" />
                {t("landing.install.ctaInstall")}
              </Button>
            )}
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
        </div>
      </section>

      {/* 2. Inputs */}
      <section id="inputs" className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {t("landing.inputs.kicker")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">
              {t("landing.inputs.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {t("landing.inputs.body")}
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {inputs.map((item, i) => (
              <li
                key={item.title}
                className="flex flex-col gap-3 border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary">
                    {item.icon}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-md border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            {t("landing.inputs.pricingNote")}
          </p>
        </div>
      </section>

      {/* 3. Capabilities — 4 tiles with detail dialogs */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {t("landing.capabilities.kicker")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl md:text-4xl">
              {t("landing.capabilities.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              {t("landing.capabilities.body")}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {capabilities.map((cap) => (
              <CapabilityCard key={cap.key} cap={cap} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trust / open source — compact strip */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">MIT · BYOK · Local-friendly.</span>{" "}
            {t("landing.osStrip.body")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-none">
              <a href={t("common.repoUrl")} target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {t("landing.osStrip.ctaRepo")}
              </a>
            </Button>
            <Button asChild size="sm" variant="ghost" className="rounded-none">
              <Link to="/privacy">{t("landing.valuePrivacy")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            {t("landing.faq.kicker")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {t("landing.faq.title")}
          </h2>
          <Accordion type="single" collapsible className="mt-6">
            {["q1", "q2", "q3", "q4", "q5"].map((k) => (
              <AccordionItem key={k} value={k}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {t(`landing.faq.${k}.q`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {t(`landing.faq.${k}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 6. Learn more — links out */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              {t("landing.learnMore.kicker")}
            </p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-tight sm:text-2xl">
              {t("landing.learnMore.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("landing.learnMore.body")}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { to: "/docs" as const, label: t("landing.learnMore.docs") },
              { to: "/manifesto" as const, label: t("landing.learnMore.manifesto") },
              { to: "/open-source" as const, label: t("landing.learnMore.openSource") },
              { to: "/contributors" as const, label: t("landing.learnMore.contributors") },
              { to: "/install" as const, label: t("landing.learnMore.install") },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-1 border border-border bg-background px-3 py-2 text-sm hover:border-primary hover:text-foreground"
              >
                {l.label}
                <ChevronRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <Logo />
            <nav className="flex flex-wrap justify-center gap-5">
              <Link to="/open-source" className="hover:text-foreground">
                {t("landing.nav.openSource")}
              </Link>
              <Link to="/manifesto" className="hover:text-foreground">
                {t("landing.nav.manifesto")}
              </Link>
              <Link to="/contributors" className="hover:text-foreground">
                {t("landing.learnMore.contributors")}
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
