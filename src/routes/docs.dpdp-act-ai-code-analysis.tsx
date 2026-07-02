import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, BookOpen, Scale, Lock } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "DPDP Act 2023 & AI code analysis — a practical guide for Indian teams";
const DESC =
  "How India's Digital Personal Data Protection Act 2023 affects AI code review. BYOK, ephemeral uploads and local inference minimise data movement and simplify DPDP compliance for Indian software teams.";
const URL = "https://decoderead.dev/docs/dpdp-act-ai-code-analysis";

const FAQ = [
  {
    q: "Does the DPDP Act apply to source code?",
    a: "The DPDP Act applies to personal data of data principals (people) in India. Source code is not itself personal data, but code often contains configuration, logs, comments, test fixtures or secrets that reference personal data — so review tools handling that content are in scope.",
  },
  {
    q: "Is sending code to a US-based AI model a cross-border transfer?",
    a: "Yes, if the code carries any personal data. BYOK does not change that — you are still the data fiduciary. Decoder makes it easy to run inference locally (Ollama, LM Studio) so no personal data crosses a border.",
  },
  {
    q: "Do I need explicit user consent to run code analysis?",
    a: "For your own production data, base your lawful basis assessment on your DPO's guidance. Decoder itself does not access customer data — it only processes code you or your team upload.",
  },
  {
    q: "What data does Decoder store?",
    a: "Only what you explicitly save: your account email, BYOK credentials encrypted at rest, and the analysis history you choose to persist. Uploaded ZIPs are processed ephemerally.",
  },
];

export const Route = createFileRoute("/docs/dpdp-act-ai-code-analysis")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "dpdp act, digital personal data protection act, ai code review india, data minimisation, cross border data transfer india, byok compliance" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "en_IN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
      { rel: "alternate", hrefLang: "hi", href: "https://decoderead.dev/docs/hi/dpdp-act-code-analysis" },
      { rel: "alternate", hrefLang: "ta", href: "https://decoderead.dev/docs/ta/dpdp-act-code-analysis" },
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
          about: ["DPDP Act", "India", "Data protection", "AI code review", "Cross-border data"],
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
          DPDP Act &amp; AI code analysis
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          India's Digital Personal Data Protection Act 2023 (DPDP) reshapes how software teams handle personal data —
          including the personal data that ends up inside source code, logs and test fixtures. Here is how Decoder is
          designed to make DPDP alignment easier for AI code review.
        </p>

        <Section icon={<Scale className="h-5 w-5" />} title="The three DPDP principles that matter for code review">
          <ul>
            <li><strong>Data minimisation</strong> — only process what's necessary. Local inference &amp; BYOK cut the number of parties who see your code.</li>
            <li><strong>Purpose limitation</strong> — Decoder analyses code you upload; it does not train models on it.</li>
            <li><strong>Storage limitation</strong> — uploads are ephemeral. You choose what history to save; you can delete it any time.</li>
          </ul>
        </Section>

        <Section icon={<Lock className="h-5 w-5" />} title="How Decoder aligns by design">
          <ul>
            <li><strong>BYOK credentials encrypted at rest</strong> with AES-256-GCM.</li>
            <li><strong>Local model support</strong> via Ollama and LM Studio — zero egress option.</li>
            <li><strong>No training</strong> on your code — ever.</li>
            <li><strong>Open source (MIT)</strong> — you can audit every line, self-host, or run offline.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Cross-border data transfers">
          <p>
            The DPDP Act allows cross-border transfers unless a country is on a government blocklist. Even so,
            most Indian teams prefer to minimise transfers where possible. Decoder's local-inference path lets you keep
            your code in India end-to-end, using models running on your own machine or on infrastructure inside the country.
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
          <p className="mt-6 text-xs text-muted-foreground">This page is educational, not legal advice. Consult your DPO or counsel for a formal DPIA.</p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Related guides">
          <ul>
            <li><Link to="/docs/ai-code-review-india" className="text-foreground underline">AI code review in India</Link></li>
            <li><Link to="/docs/gdpr-ai-code-review" className="text-foreground underline">GDPR &amp; AI code review (Europe)</Link></li>
            <li><Link to="/docs/secure-code-review-byok" className="text-foreground underline">Secure code review with BYOK</Link></li>
            <li><Link to="/docs/ai-code-review-outsourcing" className="text-foreground underline">Auditing outsourced AI code</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
