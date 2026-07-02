import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, BookOpen, Building2 } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI code review in Hyderabad & Chennai — southern India's IT corridors";
const DESC =
  "AI code analysis for teams across Hyderabad (HITEC City, Gachibowli) and Chennai (OMR, Tidel Park). Open-source, BYOK, low-cost, DPDP-aligned. Free static & malware scans, no API key required.";
const URL = "https://decoderead.dev/docs/ai-code-review-hyderabad-chennai";

const FAQ = [
  {
    q: "Why group Hyderabad and Chennai in one guide?",
    a: "Both cities anchor massive service-provider and product-engineering ecosystems for southern India, host large captive centres for global companies, and share similar buying patterns around developer tooling.",
  },
  {
    q: "Is Decoder useful for large captive engineering centres?",
    a: "Yes. Captive centres often need a reproducible, auditable AI review pipeline that respects the parent company's data-transfer rules. BYOK + optional local inference makes that straightforward.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-hyderabad-chennai")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "ai code review hyderabad, ai code review chennai, hitec city, tidel park, gachibowli, omr, southern india developer tools, byok code review" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "en_IN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
      { rel: "alternate", hrefLang: "en-IN", href: URL },
      { rel: "alternate", hrefLang: "ta", href: "https://decoderead.dev/docs/ta/ai-code-review-chennai" },
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
            { "@type": "City", name: "Hyderabad" },
            { "@type": "City", name: "Chennai" },
            { "@type": "AdministrativeArea", name: "Telangana" },
            { "@type": "AdministrativeArea", name: "Tamil Nadu" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }),
      },
    ],
  }),
  component: Page,
});

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary">{icon}</span>
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
        <Link to="/" aria-label="Decoder"><Logo /></Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LangSwitcher />
          <PublicHeaderAuthSlot ctaLabelKey="landing.ctaSignIn" showArrow={false} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to documentation
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          AI code review in Hyderabad &amp; Chennai
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Hyderabad's HITEC City and Chennai's OMR IT corridor are two of southern India's largest concentrations of
          software engineering. Both host massive captive centres, service providers and a fast-growing product-startup
          scene. Decoder is the open-source, BYOK-friendly AI review layer built for that mix.
        </p>

        <Section icon={<MapPin className="h-5 w-5" />} title="Hyderabad — HITEC City, Gachibowli, Madhapur">
          <p>
            Home to product engineering centres for global tech companies and a strong SaaS ecosystem. Common Decoder
            uses here: DPDP-aligned analysis with BYOK on Anthropic or Gemini, and local inference for regulated
            verticals.
          </p>
        </Section>

        <Section icon={<MapPin className="h-5 w-5" />} title="Chennai — OMR, Tidel Park, Sholinganallur">
          <p>
            Chennai is India's second-largest software exporter and a hub for BFSI, automotive-tech and healthcare
            engineering. Service providers on OMR use Decoder to audit AI-code deliveries before hand-off; product teams
            use it as a cheap, private review pass.
          </p>
        </Section>

        <Section icon={<Building2 className="h-5 w-5" />} title="Related">
          <ul>
            <li><Link to="/docs/ai-code-review-india" className="text-foreground underline">AI code review in India (main)</Link></li>
            <li><Link to="/docs/ai-code-review-bangalore" className="text-foreground underline">Bangalore</Link></li>
            <li><Link to="/docs/ai-code-review-sri-lanka-colombo" className="text-foreground underline">Sri Lanka &amp; Colombo</Link></li>
            <li><Link to="/docs/ai-code-review-outsourcing" className="text-foreground underline">Auditing outsourced code</Link></li>
          </ul>
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
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
