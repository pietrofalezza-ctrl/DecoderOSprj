import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Cookie, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Decoder — Cookie Policy" },
      {
        name: "description",
        content:
          "Decoder uses only strictly necessary and functional storage. No analytics, marketing, profiling cookies or third-party tracking pixels.",
      },
      { property: "og:title", content: "Decoder — Cookie Policy" },
      {
        property: "og:description",
        content:
          "Cookie and local storage notice for Decoder. Privacy-first: no third-party trackers, no profiling, no marketing cookies.",
      },
      { property: "og:url", content: "https://decoderead.dev/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://decoderead.dev/cookies" }],
  }),
  component: CookiesPage,
});

const ROWS = ["auth", "lang", "theme", "disclaimer", "ack"] as const;

function CookiesPage() {
  const { t } = useTranslation();

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
        <p className="text-xs uppercase tracking-wide text-primary">{t("cookies.kicker")}</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {t("cookies.title")}
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">{t("cookies.intro")}</p>

        <div className="mt-8 rounded-lg border border-border/60 bg-muted/30 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">{t("cookies.noBanner.title")}</p>
              <p className="text-muted-foreground">{t("cookies.noBanner.body")}</p>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("cookies.whatWeUseTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("cookies.whatWeUseBody")}</p>
          <div className="mt-5 overflow-hidden rounded-lg border border-border/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("cookies.col.name")}</th>
                  <th className="px-4 py-3 font-medium">{t("cookies.col.purpose")}</th>
                  <th className="px-4 py-3 font-medium">{t("cookies.col.storage")}</th>
                  <th className="px-4 py-3 font-medium">{t("cookies.col.retention")}</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((k) => (
                  <tr key={k} className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 font-mono text-xs">{t(`cookies.rows.${k}.name`)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t(`cookies.rows.${k}.purpose`)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t(`cookies.rows.${k}.storage`)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t(`cookies.rows.${k}.retention`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("cookies.noTrackingTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("cookies.noTrackingBody")}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("cookies.noTracking.analytics")}</li>
            <li>{t("cookies.noTracking.marketing")}</li>
            <li>{t("cookies.noTracking.heatmaps")}</li>
            <li>{t("cookies.noTracking.pixels")}</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("cookies.thirdPartyTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("cookies.thirdPartyBody")}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("cookies.controlTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("cookies.controlBody")}</p>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/privacy">
              <Cookie className="mr-2 h-4 w-4" />
              {t("footer.privacy")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/data-flow">{t("footer.dataFlow")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/terms">{t("landing.nav.terms")}</Link>
          </Button>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">{t("cookies.updated")}</p>
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
            <Link to="/cookies" className="hover:text-foreground">
              {t("footer.cookies")}
            </Link>
            <Link to="/data-flow" className="hover:text-foreground">
              {t("footer.dataFlow")}
            </Link>
            <InstagramLink />
          </nav>
          <span className="max-w-md text-right">{t("footer.disclaimer")}</span>
        </div>
      </footer>
    </div>
  );
}
