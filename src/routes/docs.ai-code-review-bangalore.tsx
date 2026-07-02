import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, BookOpen, Building2, Coins } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI code review in Bangalore — open-source, BYOK, low-cost";
const DESC =
  "AI code analysis for Bangalore's product startups, enterprise SaaS teams and service providers. Open-source, BYOK, DPDP-aligned. Zero per-seat fees — pay only your own model usage or run local with Ollama.";
const URL = "https://decoderead.dev/docs/ai-code-review-bangalore";

const FAQ = [
  {
    q: "Which teams in Bangalore use Decoder?",
    a: "Product startups in Koramangala, HSR and Indiranagar, enterprise SaaS teams in Whitefield and ORR, and service providers across Electronic City. Anyone shipping AI-generated code who wants a review pass without a per-seat SaaS bill.",
  },
  {
    q: "How does BYOK save money for a Bangalore startup?",
    a: "A 15-person Bangalore team paying $30/seat/month on a SaaS AI reviewer spends ~₹4.5 lakh/year. With Decoder + BYOK on a mid-tier model, the same team typically spends a small fraction of that — often under ₹1 lakh/year — and can drop to zero using local Ollama.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-bangalore")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "ai code review bangalore, bengaluru ai tools, code analysis karnataka, byok code review india, open source developer tools bangalore" },
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
            { "@type": "City", name: "Bangalore" },
            { "@type": "City", name: "Bengaluru" },
            { "@type": "AdministrativeArea", name: "Karnataka" },
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
          AI code review in Bangalore
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Bangalore is India's largest concentration of software developers — and one of the world's largest. From
          product startups in Koramangala to enterprise SaaS in Whitefield and service providers in Electronic City,
          teams here ship huge amounts of AI-assisted code every day. Decoder gives every team a free, open-source,
          BYOK-friendly review layer that scales with them.
        </p>

        <Section icon={<MapPin className="h-5 w-5" />} title="Where Decoder fits the Bangalore stack">
          <ul>
            <li><strong>Product startups</strong> — free static + malware scan on every PR before human review.</li>
            <li><strong>Enterprise SaaS</strong> — BYOK on Anthropic or Gemini, DPDP-aligned, EU-hosted models if selling to Europe.</li>
            <li><strong>Service providers &amp; agencies</strong> — audit AI-code deliveries for clients; attach reports to invoices.</li>
            <li><strong>Educational programs (IIIT-B, IISc, bootcamps)</strong> — teach students to critique AI code, not just accept it.</li>
          </ul>
        </Section>

        <Section icon={<Coins className="h-5 w-5" />} title="The Bangalore math">
          <p>
            A typical 15-person team runs ₹4–5 lakh/year on a SaaS AI reviewer at USD per seat. With Decoder's BYOK
            model you pay only your model usage (often under ₹1 lakh/year for the same volume), and you can drop that
            to zero by running local models on a beefy Mac / workstation.
          </p>
        </Section>

        <Section icon={<Building2 className="h-5 w-5" />} title="Related">
          <ul>
            <li><Link to="/docs/ai-code-review-india" className="text-foreground underline">AI code review in India (main guide)</Link></li>
            <li><Link to="/docs/ai-code-review-hyderabad-chennai" className="text-foreground underline">Hyderabad &amp; Chennai</Link></li>
            <li><Link to="/docs/dpdp-act-ai-code-analysis" className="text-foreground underline">DPDP Act &amp; AI code analysis</Link></li>
            <li><Link to="/docs/ai-code-review-outsourcing" className="text-foreground underline">Auditing outsourced AI code</Link></li>
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
