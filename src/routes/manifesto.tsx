import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/manifesto")({
  head: () => ({
    meta: [
      { title: "Decoder — Manifesto" },
      {
        name: "description",
        content:
          "What Decoder stands for: open source, privacy-first, BYOK, local-first, multilingual, accessible. And what we will never do.",
      },
      { property: "og:title", content: "Decoder — Manifesto" },
      {
        property: "og:description",
        content:
          "Our principles: open source, privacy-first, BYOK, local-first, multilingual, accessible.",
      },
      { property: "og:url", content: "https://decoder.lovable.app/manifesto" },
    ],
    links: [{ rel: "canonical", href: "https://decoder.lovable.app/manifesto" }],
  }),
  component: ManifestoPage,
});

function ManifestoPage() {
  const { t } = useTranslation();

  const principles = ["open", "privacy", "byok", "localFirst", "multilang", "accessible"] as const;
  const wonts = ["w1", "w2", "w3", "w4"] as const;

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

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs uppercase tracking-wide text-primary">{t("manifesto.kicker")}</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {t("manifesto.title")}
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">
          {t("manifesto.intro")}
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{t("manifesto.principlesTitle")}</h2>
          <ul className="mt-6 space-y-4">
            {principles.map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <div className="font-medium">{t(`manifesto.principles.${k}.title`)}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`manifesto.principles.${k}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{t("manifesto.wontTitle")}</h2>
          <ul className="mt-6 space-y-3">
            {wonts.map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <span className="text-sm">{t(`manifesto.wont.${k}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{t("manifesto.roadmapTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("manifesto.roadmapBody")}</p>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/auth">{t("landing.ctaStart")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/docs">{t("landing.nav.docs")}</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
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
