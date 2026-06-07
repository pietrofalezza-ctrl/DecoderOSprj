import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Github, ShieldCheck, Bug } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Decoder — Contacts" },
      {
        name: "description",
        content:
          "How to reach the Decoder project: privacy & GDPR requests, security reports, bug feedback.",
      },
      { property: "og:title", content: "Decoder — Contacts" },
      {
        property: "og:description",
        content: "Privacy, GDPR, security and feedback contacts for the Decoder open source project.",
      },
      { property: "og:url", content: "https://decoderdev.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://decoderdev.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
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
        <p className="text-xs uppercase tracking-wide text-primary">{t("contact.kicker")}</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {t("contact.title")}
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">{t("contact.intro")}</p>

        <section className="mt-10 rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{t("contact.privacyTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("contact.privacyBody")}</p>
              <a
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                href={`${t("common.repoUrl")}/issues/new?labels=gdpr&title=${encodeURIComponent("GDPR request")}`}
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                {t("contact.privacyCta")}
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h2 className="text-xl font-semibold">{t("contact.securityTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("contact.securityBody")}</p>
              <a
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                href={`${t("common.repoUrl")}/security/advisories/new`}
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                {t("contact.securityCta")}
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <Bug className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{t("contact.bugsTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("contact.bugsBody")}</p>
              <a
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                href={`${t("common.repoUrl")}/issues`}
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                {t("contact.bugsCta")}
              </a>
            </div>
          </div>
        </section>

        <p className="mt-10 text-xs text-muted-foreground">{t("contact.cookieNote")}</p>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <Logo />
          <nav className="flex gap-5">
            <Link to="/manifesto" className="hover:text-foreground">
              {t("landing.nav.manifesto")}
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              {t("landing.nav.terms")}
            </Link>
            <Link to="/docs" className="hover:text-foreground">
              {t("landing.nav.docs")}
            </Link>
          </nav>
          <span>{t("footer.ownership")}</span>
        </div>
      </footer>
    </div>
  );
}
