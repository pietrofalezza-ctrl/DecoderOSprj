import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Decoder — Privacy Policy" },
      {
        name: "description",
        content:
          "Decoder Privacy Policy: what data is processed, why, retention, your GDPR rights, and how local vs cloud BYOK modes route your code.",
      },
      { property: "og:title", content: "Decoder — Privacy Policy" },
      {
        property: "og:description",
        content:
          "Privacy notice for the Decoder open-source educational demo. Covers data types, retention, deletion, and AI provider transfers.",
      },
      { property: "og:url", content: "https://decoderdev.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://decoderdev.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useTranslation();
  const dataKeys = [
    "account",
    "files",
    "explanations",
    "keys",
    "endpoints",
    "acks",
    "logs",
  ] as const;
  const sections = [
    "controllerTitle",
    "purposesTitle",
    "lawfulTitle",
    "retentionTitle",
    "rightsTitle",
    "thirdPartiesTitle",
    "minorsTitle",
    "securityTitle",
    "noWarrantyTitle",
  ] as const;

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
        <p className="text-xs uppercase tracking-wide text-primary">{t("privacy.kicker")}</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {t("privacy.title")}
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">{t("privacy.intro")}</p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("privacy.dataTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("privacy.dataIntro")}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {dataKeys.map((k) => (
              <li key={k}>{t(`privacy.data.${k}`)}</li>
            ))}
          </ul>
        </section>

        {sections.map((titleKey) => {
          const bodyKey = titleKey.replace("Title", "Body");
          return (
            <section key={titleKey} className="mt-10">
              <h2 className="text-2xl font-semibold">{t(`privacy.${titleKey}`)}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{t(`privacy.${bodyKey}`)}</p>
            </section>
          );
        })}

        <div className="mt-14 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/terms">{t("landing.nav.terms")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/data-flow">{t("footer.dataFlow")}</Link>
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
            <Link to="/cookies" className="hover:text-foreground">
              {t("footer.cookies")}
            </Link>
            <Link to="/data-flow" className="hover:text-foreground">
              {t("footer.dataFlow")}
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
