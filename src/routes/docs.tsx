import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Decoder" },
      {
        name: "description",
        content:
          "How to use Decoder: BYOK cloud providers, local Ollama / LM Studio mode, security and ownership.",
      },
      { property: "og:title", content: "Documentation — Decoder" },
      {
        property: "og:description",
        content:
          "Get started with Decoder: connect a cloud provider with your own key, or run fully local with Ollama / LM Studio.",
      },
      { property: "og:url", content: "https://decoderead.dev/docs" },
    ],
    links: [{ rel: "canonical", href: "https://decoderead.dev/docs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Documentation — Decoder",
          description:
            "How to use Decoder: BYOK cloud providers, local Ollama / LM Studio mode, security and ownership.",
          url: "https://decoderead.dev/docs",
        }),
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
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

        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-2xl font-semibold">India &amp; Sri Lanka</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Regional guides for developers in Bharat, tuned for DPDP Act 2023 compliance and BYOK
            cost efficiency.
          </p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <li>
              <Link to="/docs/ai-code-review-india" className="text-foreground underline">
                AI code review in India
              </Link>
            </li>
            <li>
              <Link to="/docs/dpdp-act-ai-code-analysis" className="text-foreground underline">
                DPDP Act &amp; AI code analysis
              </Link>
            </li>
            <li>
              <Link to="/docs/ai-code-review-outsourcing" className="text-foreground underline">
                Auditing outsourced code
              </Link>
            </li>
            <li>
              <Link to="/docs/ai-code-review-bangalore" className="text-foreground underline">
                Bangalore edition
              </Link>
            </li>
            <li>
              <Link
                to="/docs/ai-code-review-hyderabad-chennai"
                className="text-foreground underline"
              >
                Hyderabad &amp; Chennai
              </Link>
            </li>
            <li>
              <Link
                to="/docs/ai-code-review-sri-lanka-colombo"
                className="text-foreground underline"
              >
                Sri Lanka / Colombo
              </Link>
            </li>
            <li>
              <Link to="/docs/hi/ai-code-review-bharat" className="text-foreground underline">
                हिन्दी: भारत में AI कोड रिव्यू
              </Link>
            </li>
            <li>
              <Link to="/docs/ta/ai-code-review-chennai" className="text-foreground underline">
                தமிழ்: சென்னையில் AI கோட் ரிவியூ
              </Link>
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        {t("footer.ownership")}
      </footer>
    </div>
  );
}
