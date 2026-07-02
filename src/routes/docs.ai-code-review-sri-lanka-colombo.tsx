import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, BookOpen, ShieldCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI code review in Sri Lanka & Colombo — open-source and PDPA-aligned";
const DESC =
  "AI code analysis for Sri Lankan software teams — Colombo, Kandy, Galle. Open-source, BYOK, low-cost. Aligned with Sri Lanka's Personal Data Protection Act 2022. Free static & malware scans, no API key required.";
const URL = "https://decoderead.dev/docs/ai-code-review-sri-lanka-colombo";

const FAQ = [
  {
    q: "Does Decoder support Sri Lanka's Personal Data Protection Act 2022?",
    a: "Decoder's design — BYOK, ephemeral uploads, optional local inference — helps Sri Lankan teams minimise personal-data movement, which aligns with the PDPA's data-minimisation and cross-border principles. Not legal advice; consult your DPO.",
  },
  {
    q: "Is Decoder usable for service-export teams in Colombo?",
    a: "Yes. Many Sri Lankan software agencies deliver code to European and North American clients under strict IP and privacy terms. BYOK + local inference lets a Colombo team run AI review without exporting client code to a third-party SaaS.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-sri-lanka-colombo")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "ai code review sri lanka, colombo developer tools, pdpa sri lanka, byok code review, open source ai review lanka",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "en_LK" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
      { rel: "alternate", hrefLang: "en-LK", href: URL },
      {
        rel: "alternate",
        hrefLang: "ta",
        href: "https://decoderead.dev/docs/ta/ai-code-review-chennai",
      },
      { rel: "alternate", hrefLang: "x-default", href: URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESC,
          url: URL,
          mainEntityOfPage: URL,
          inLanguage: "en",
          datePublished: "2026-07-02",
          dateModified: "2026-07-02",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Decoder",
          url: "https://decoderead.dev",
          areaServed: [
            { "@type": "Country", name: "Sri Lanka" },
            { "@type": "City", name: "Colombo" },
            { "@type": "City", name: "Kandy" },
            { "@type": "City", name: "Galle" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Page,
});

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary">
          {icon}
        </span>
        <h2 className="font-display text-2xl font-medium tracking-tight">{title}</h2>
      </div>
      <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:marker:text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur">
        <Link to="/" aria-label="Decoder">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LangSwitcher />
          <PublicHeaderAuthSlot ctaLabelKey="landing.ctaSignIn" showArrow={false} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to documentation
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          AI code review in Sri Lanka &amp; Colombo
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sri Lanka's software-services industry — anchored in Colombo, with growing hubs in Kandy
          and Galle — delivers code to clients across Europe, the Middle East, Australia and North
          America. Decoder is a free, open-source AI review tool that Sri Lankan teams can add to
          their delivery pipeline without introducing new IP or privacy risk.
        </p>

        <Section
          icon={<MapPin className="h-5 w-5" />}
          title="Where Decoder fits the Sri Lankan stack"
        >
          <ul>
            <li>
              <strong>Colombo service providers</strong> — audit AI-code deliveries before hand-off
              to European clients (GDPR-adjacent).
            </li>
            <li>
              <strong>Product startups</strong> — free static + malware scan, BYOK for AI
              explanations.
            </li>
            <li>
              <strong>Fintech &amp; banking partners</strong> — local inference (Ollama) for
              zero-egress review of regulated code.
            </li>
            <li>
              <strong>Universities &amp; bootcamps</strong> — teach code literacy in an AI-first
              curriculum.
            </li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="PDPA 2022 alignment">
          <p>
            Sri Lanka's Personal Data Protection Act 2022 introduces data-minimisation and
            cross-border-transfer duties similar in spirit to the GDPR and the DPDP Act. Decoder's
            BYOK + local-inference options make it easier to keep code and any embedded personal
            data inside your chosen perimeter.
          </p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="FAQ">
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Related">
          <ul>
            <li>
              <Link to="/docs/ai-code-review-india" className="text-foreground underline">
                AI code review in India
              </Link>
            </li>
            <li>
              <Link to="/docs/ai-code-review-outsourcing" className="text-foreground underline">
                Auditing outsourced AI code
              </Link>
            </li>
            <li>
              <Link to="/docs/gdpr-ai-code-review" className="text-foreground underline">
                GDPR &amp; AI code review (for European clients)
              </Link>
            </li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
        <div className="mt-2">
          <InstagramLink />
        </div>
      </footer>
    </div>
  );
}
