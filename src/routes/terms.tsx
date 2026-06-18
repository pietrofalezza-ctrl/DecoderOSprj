import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Decoder — Terms and Conditions" },
      {
        name: "description",
        content:
          "Decoder Terms and Conditions: MIT License, permitted uses, trademark restrictions, disclaimer.",
      },
      { property: "og:title", content: "Decoder — Terms and Conditions" },
      {
        property: "og:description",
        content:
          "Decoder Terms and Conditions: MIT License, permitted uses, trademark restrictions, disclaimer.",
      },
      { property: "og:url", content: "https://decoderdev.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://decoderdev.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useTranslation();

  const allowed = ["usePersonal", "modify", "distribute", "develop"] as const;
  const forbidden = ["claimCreator", "attribution"] as const;

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
        <p className="text-xs uppercase tracking-wide text-primary">{t("terms.kicker")}</p>
        <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {t("terms.title")}
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">{t("terms.intro")}</p>

        <section className="mt-12 rounded-lg border-l-4 border-primary bg-primary/5 p-6">
          <h2 className="text-xl font-semibold">{t("terms.natureTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("terms.natureBody")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.licenseTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.licenseBody")}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.allowedTitle")}</h2>
          <ul className="mt-6 space-y-4">
            {allowed.map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{t(`terms.allowed.${k}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.forbiddenTitle")}</h2>
          <ul className="mt-6 space-y-4">
            {forbidden.map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <span className="text-sm">{t(`terms.forbidden.${k}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.ownershipTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.ownershipBody")}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.analyzedCodeTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.analyzedCodeBody")}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.contributionsTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.contributionsBody")}</p>
        </section>

        <section className="mt-10 rounded-lg border-l-4 border-primary bg-primary/5 p-6">
          <h2 className="text-xl font-semibold">{t("intendedUse.title")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("intendedUse.intro")}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {(["edu", "comprehension", "docs", "maintain", "learning"] as const).map((k) => (
              <li key={k}>{t(`intendedUse.items.${k}`)}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-base font-semibold">{t("intendedUse.notTitle")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("intendedUse.notIntro")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {(["audit", "legal", "production", "highRisk", "regulated", "replace"] as const).map(
              (k) => (
                <li key={k}>{t(`intendedUse.notItems.${k}`)}</li>
              ),
            )}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("privacy.minorsTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("privacy.minorsBody")}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.dataCollectedTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.dataCollectedIntro")}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("terms.dataCollected.account")}</li>
            <li>{t("terms.dataCollected.content")}</li>
            <li>{t("terms.dataCollected.credentials")}</li>
            <li>{t("terms.dataCollected.usage")}</li>
            <li>{t("terms.dataCollected.notracking")}</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.gdprTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.gdprIntro")}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("terms.gdpr.lawful")}</li>
            <li>{t("terms.gdpr.rights")}</li>
            <li>{t("terms.gdpr.transfers")}</li>
            <li>{t("terms.gdpr.retention")}</li>
            <li>{t("terms.gdpr.contact")}</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{t("terms.aiActTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.aiActIntro")}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("terms.aiAct.risk")}</li>
            <li>{t("terms.aiAct.transparency")}</li>
            <li>{t("terms.aiAct.prohibited")}</li>
            <li>{t("terms.aiAct.humanOversight")}</li>
          </ul>
        </section>

        <section className="mt-10 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">{t("terms.disclaimerTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.disclaimerBody")}</p>
        </section>

        <section
          id="liability"
          className="mt-10 rounded-lg border border-destructive/40 bg-destructive/5 p-6"
        >
          <h2 className="text-xl font-semibold">{t("terms.liabilityTitle")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("terms.liabilityIntro")}</p>
          <ul className="mt-4 space-y-3">
            {(["aiOutput", "ipCode", "dataTransfer", "security", "unlawful"] as const).map((k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-md border border-border bg-background p-4"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <span className="text-sm">{t(`terms.liability.${k}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/auth">{t("landing.ctaStart")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/manifesto">{t("landing.nav.manifesto")}</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
          <Logo />
          <nav className="flex flex-wrap gap-5">
            <Link to="/privacy" className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link to="/data-flow" className="hover:text-foreground">
              {t("footer.dataFlow")}
            </Link>
            <Link to="/manifesto" className="hover:text-foreground">
              {t("landing.nav.manifesto")}
            </Link>
            <Link to="/docs" className="hover:text-foreground">
              {t("landing.nav.docs")}
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
      </footer>
    </div>
  );
}
