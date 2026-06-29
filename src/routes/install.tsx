import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Download, Monitor, Apple, Smartphone, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export const Route = createFileRoute("/install")({
  head: () => ({
    meta: [
      { title: "Install Decoder as an app — desktop, iOS and Android" },
      {
        name: "description",
        content:
          "Add Decoder to your home screen or desktop. No app store, no download — just a one-tap PWA install on Chrome, Edge, Safari and Android.",
      },
      { property: "og:title", content: "Install Decoder as an app" },
      {
        property: "og:description",
        content:
          "Add Decoder to your home screen for a full-screen, one-tap AI code analysis experience.",
      },
      { property: "og:url", content: "https://decoderead.dev/install" },
    ],
    links: [{ rel: "canonical", href: "https://decoderead.dev/install" }],
  }),
  component: InstallPage,
});

function InstallPage() {
  const { t } = useTranslation();
  const { canPrompt, installed, promptInstall } = usePwaInstall();

  const steps = [
    {
      icon: <Monitor className="h-5 w-5" />,
      title: t("landing.install.desktopTitle"),
      body: t("landing.install.desktopBody"),
    },
    {
      icon: <Apple className="h-5 w-5" />,
      title: t("landing.install.iosTitle"),
      body: t("landing.install.iosBody"),
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: t("landing.install.androidTitle"),
      body: t("landing.install.androidBody"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link to="/" aria-label={t("brand.name")} className="shrink-0">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("brand.name")}
        </Link>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          {t("landing.install.kicker")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl">
          {t("landing.install.title")}
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          {t("landing.install.body")}
        </p>

        <div className="mt-6">
          {installed ? (
            <span className="inline-flex items-center gap-2 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Download className="h-3 w-3" />
              {t("landing.install.installedBadge")}
            </span>
          ) : (
            <Button
              type="button"
              onClick={() => canPrompt && promptInstall()}
              disabled={!canPrompt}
              size="lg"
              className="rounded-none px-6"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("landing.install.ctaInstall")}
            </Button>
          )}
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary">
                  {step.icon}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  0{i + 1}
                </span>
              </div>
              <h2 className="mt-4 font-display text-lg font-medium">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
