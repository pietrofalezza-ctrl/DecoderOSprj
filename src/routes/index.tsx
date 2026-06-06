import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Code2, Globe2, KeyRound, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LangSwitcher } from "@/components/LangSwitcher";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span>{t("brand.name")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">{t("landing.ctaSignIn")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">{t("landing.ctaStart")}</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Code2 className="h-3 w-3" /> {t("brand.tagline")}
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mt-6 text-balance text-lg text-muted-foreground">
          {t("landing.heroSubtitle")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth">{t("landing.ctaStart")}</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
        <Feature icon={<Globe2 className="h-5 w-5" />} title={t("landing.feature1Title")} body={t("landing.feature1Body")} />
        <Feature icon={<KeyRound className="h-5 w-5" />} title={t("landing.feature2Title")} body={t("landing.feature2Body")} />
        <Feature icon={<ShieldCheck className="h-5 w-5" />} title={t("landing.feature3Title")} body={t("landing.feature3Body")} />
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        {t("footer.ownership")}
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
