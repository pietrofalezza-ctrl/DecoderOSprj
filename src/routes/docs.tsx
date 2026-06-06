import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";


import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Decoder — Documentation" },
      {
        name: "description",
        content:
          "How to use Decoder: BYOK cloud providers, local Ollama / LM Studio mode, security and ownership.",
      },
      { property: "og:title", content: "Decoder — Documentation" },
      {
        property: "og:description",
        content:
          "How to use Decoder: BYOK cloud providers, local Ollama / LM Studio mode, security and ownership.",
      },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  const { t } = useTranslation();
  const sections = [
    { id: "getting-started", title: "docs.gettingStartedTitle", body: "docs.gettingStartedBody" },
    { id: "byok", title: "docs.byokTitle", body: "docs.byokBody" },
    { id: "local", title: "docs.localTitle", body: "docs.localBody" },
    { id: "security", title: "docs.securityTitle", body: "docs.securityBody" },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span>{t("brand.name")}</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LangSwitcher />
          <PublicHeaderAuthSlot ctaLabelKey="landing.ctaSignIn" showArrow={false} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">{t("docs.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("docs.intro")}</p>

        <nav className="mt-8 flex flex-wrap gap-2 text-xs">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-md border border-border px-3 py-1 text-muted-foreground hover:text-foreground"
            >
              {t(s.title)}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="text-2xl font-semibold">{t(s.title)}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {t(s.body)}
              </p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        {t("footer.ownership")}
      </footer>
    </div>
  );
}
