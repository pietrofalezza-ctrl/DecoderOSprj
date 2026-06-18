import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Cloud, Github, Laptop, Server, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/data-flow")({
  head: () => ({
    meta: [
      { title: "Decoder — Data flow" },
      {
        name: "description",
        content:
          "How code flows through Decoder in local, cloud BYOK and GitHub import modes. Transparency for the open-source educational demo.",
      },
      { property: "og:title", content: "Decoder — Data flow" },
      {
        property: "og:description",
        content: "Local vs cloud BYOK vs GitHub: where your code goes and what to avoid uploading.",
      },
      { property: "og:url", content: "https://decoderdev.lovable.app/data-flow" },
    ],
    links: [{ rel: "canonical", href: "https://decoderdev.lovable.app/data-flow" }],
  }),
  component: DataFlowPage,
});

function Node({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
      {icon}
      <span>{label}</span>
    </span>
  );
}

function FlowRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-3">
      {children}
    </div>
  );
}

function DataFlowPage() {
  const { t } = useTranslation();
  const arrow = <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <p className="text-xs uppercase tracking-wide text-primary">{t("dataFlow.kicker")}</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {t("dataFlow.title")}
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">{t("dataFlow.intro")}</p>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-semibold">{t("dataFlow.localTitle")}</h2>
          <FlowRow>
            <Node icon={<Laptop className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.code")} />
            {arrow}
            <Node
              icon={<Server className="h-3.5 w-3.5 text-emerald-500" />}
              label={t("dataFlow.nodes.localModel")}
            />
            {arrow}
            <Node icon={<Laptop className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.ui")} />
          </FlowRow>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-semibold">{t("dataFlow.cloudTitle")}</h2>
          <FlowRow>
            <Node icon={<Laptop className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.code")} />
            {arrow}
            <Node icon={<Server className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.backend")} />
            {arrow}
            <Node
              icon={<Cloud className="h-3.5 w-3.5 text-primary" />}
              label={t("dataFlow.nodes.provider")}
            />
            {arrow}
            <Node icon={<Laptop className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.ui")} />
          </FlowRow>
        </section>

        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-semibold">{t("dataFlow.githubTitle")}</h2>
          <FlowRow>
            <Node icon={<Github className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.github")} />
            {arrow}
            <Node icon={<Server className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.import")} />
            {arrow}
            <Node icon={<Laptop className="h-3.5 w-3.5" />} label={t("dataFlow.nodes.ui")} />
          </FlowRow>
          <p className="text-sm text-muted-foreground">{t("dataFlow.githubBody")}</p>
        </section>

        <section className="mt-10 rounded-lg border border-amber-500/40 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            <h2 className="text-sm font-semibold">{t("dataFlow.warningsTitle")}</h2>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {(["secrets", "env", "terms", "demo"] as const).map((k) => (
              <li key={k}>{t(`dataFlow.warnings.${k}`)}</li>
            ))}
          </ul>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/terms">{t("landing.nav.terms")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/privacy">{t("footer.privacy")}</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <Logo />
          <nav className="flex flex-wrap gap-5">
            <Link to="/terms" className="hover:text-foreground">
              {t("landing.nav.terms")}
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link to="/manifesto" className="hover:text-foreground">
              {t("landing.nav.manifesto")}
            </Link>
          </nav>
          <span className="max-w-md text-right">{t("footer.disclaimer")}</span>
        </div>
      </footer>
    </div>
  );
}
