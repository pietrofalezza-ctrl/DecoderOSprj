import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, BookOpen, Users, FileCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Auditing outsourced AI-generated code — a checklist for buyers and vendors";
const DESC =
  "Practical guide to auditing AI-generated code from outsourcing vendors and offshore teams. Detect Copilot / Cursor / Claude patterns, run static & malware scans, and enforce IP hygiene before sign-off.";
const URL = "https://decoderead.dev/docs/ai-code-review-outsourcing";

const FAQ = [
  {
    q: "Can I detect AI-generated code from a vendor delivery?",
    a: "Decoder's AI-origin detector flags patterns typical of GitHub Copilot, Cursor and Claude — repetitive structure, boilerplate imports, characteristic comments. It's not a court-grade proof, but a strong signal for a review conversation.",
  },
  {
    q: "How do I write an AI-code clause in my SoW?",
    a: "Ask the vendor to disclose which AI tools were used, on which files, and confirm they hold licence to the training-derived output. Require a Decoder or equivalent AI-origin scan on final delivery.",
  },
  {
    q: "What about IP contamination risk?",
    a: "AI tools can output near-verbatim training data. Combine AI-origin detection with a licence-scan and a code-similarity check on suspect files before merging to your main branch.",
  },
  {
    q: "Does Decoder let a vendor prove their work?",
    a: "Yes — vendors can attach the analysis history to their delivery as evidence of quality, security and originality checks. Great for professional-services agencies.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-outsourcing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "audit outsourced code, vendor code review, ai generated code audit, ip hygiene, copilot detection, offshore code review, ai code review checklist",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
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
          Auditing outsourced AI-generated code
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Outsourcing and offshore delivery models — the backbone of the Indian and Sri Lankan tech
          industries — now routinely include AI-assisted code. Buyers need a way to trust
          deliverables; vendors need a way to prove their work. Decoder gives both sides a shared
          checklist.
        </p>

        <Section icon={<FileCheck className="h-5 w-5" />} title="Buyer checklist before sign-off">
          <ol>
            <li>Ask the vendor to disclose AI tools used and files touched.</li>
            <li>
              Run the delivery through Decoder's <strong>static analysis</strong> (free, no key) for
              complexity, dead code, dangerous patterns.
            </li>
            <li>
              Run the <strong>malware / secret scanner</strong> to catch leaked keys, obfuscated
              payloads, suspicious binaries.
            </li>
            <li>
              Run the <strong>AI-origin detector</strong> on suspect files; expect some AI, be
              sceptical if it's everywhere.
            </li>
            <li>
              Spot-check with the <strong>chat-with-code</strong> feature: pick 3 modules, ask the
              vendor to explain them live.
            </li>
            <li>Save the analysis history as delivery evidence.</li>
          </ol>
        </Section>

        <Section icon={<Users className="h-5 w-5" />} title="Vendor best practice">
          <ul>
            <li>Run Decoder before every delivery — treat it as your internal QA gate.</li>
            <li>
              Attach the analysis report to the delivery email — differentiates you from
              competitors.
            </li>
            <li>
              Use BYOK with your own model; no client code touches a third-party SaaS you didn't
              choose.
            </li>
            <li>For sensitive engagements, use local inference (Ollama) — zero egress.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Contract clauses to consider">
          <ul>
            <li>Disclosure of AI tooling and prompts used.</li>
            <li>Warranty that AI output is licensed for your use.</li>
            <li>Right to run automated audits (static, malware, AI-origin) on delivery.</li>
            <li>Remediation window for issues flagged by those audits.</li>
          </ul>
          <p className="text-xs">Not legal advice — talk to your counsel.</p>
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

        <Section icon={<BookOpen className="h-5 w-5" />} title="Related guides">
          <ul>
            <li>
              <Link to="/docs/ai-code-review-india" className="text-foreground underline">
                AI code review in India
              </Link>
            </li>
            <li>
              <Link to="/docs/detect-ai-generated-code" className="text-foreground underline">
                How to detect AI-generated code
              </Link>
            </li>
            <li>
              <Link to="/docs/how-to-review-ai-code" className="text-foreground underline">
                How to review AI code
              </Link>
            </li>
            <li>
              <Link to="/docs/dpdp-act-ai-code-analysis" className="text-foreground underline">
                DPDP Act &amp; AI code analysis
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
