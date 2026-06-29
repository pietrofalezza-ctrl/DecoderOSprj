import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Flag, Users, BookOpen, GitCompare } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Privacy-first AI in Europe — 2026 buyer's guide for engineering teams";
const DESC =
  "Why European teams pick BYOK, open source and local inference for AI tooling. EU AI ecosystem map (Mistral, Aleph Alpha, Silo AI), procurement criteria, and a side-by-side comparison.";
const URL = "https://decoderead.dev/docs/privacy-first-ai-europe";

const FAQ = [
  {
    q: "What does 'privacy-first AI' actually mean?",
    a: "Three things: the data doesn't leave your perimeter without an explicit decision, you control the keys, and the tool is auditable. BYOK + open source + (optionally) local inference covers all three.",
  },
  {
    q: "Are there serious EU alternatives to OpenAI and Anthropic?",
    a: "Yes. Mistral (France) ships strong open-weight and hosted models. Aleph Alpha (Germany) targets sovereign deployments. Silo AI (Finland, part of AMD) builds European LLMs. OpenEuroLLM is the EU-funded multilingual initiative.",
  },
  {
    q: "Is hosting an LLM in the EU enough to be GDPR-compliant?",
    a: "Necessary but not sufficient. You also need lawful basis, a DPA with the provider, transparency to data subjects, and a way to honour deletion. EU hosting just removes the cross-border-transfer headache.",
  },
  {
    q: "Does Decoder lock me into a specific provider?",
    a: "No. Decoder is BYOK across OpenAI, Anthropic, Google and OpenRouter, and supports local Ollama / LM Studio. You can route through Mistral via OpenRouter today and switch any time.",
  },
];

export const Route = createFileRoute("/docs/privacy-first-ai-europe")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "privacy first ai europe, eu ai tools, sovereign ai, mistral aleph alpha, byok ai europe, gdpr ai tools" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
      { rel: "alternate", hrefLang: "it", href: "https://decoderead.dev/docs/it/ai-privacy-first-europa" },
      { rel: "alternate", hrefLang: "zh", href: "https://decoderead.dev/docs/zh/privacy-first-ai-europe" },
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
          datePublished: "2026-06-29",
          dateModified: "2026-06-29",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          about: ["Privacy", "Sovereign AI", "EU AI ecosystem", "BYOK"],
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
          <ArrowLeft className="h-3 w-3" /> Back to docs
        </Link>

        <div className="mt-6 flex gap-2 text-xs">
          <Link to="/docs/privacy-first-ai-europe" className="rounded border border-border bg-card px-2 py-1 text-foreground">EN</Link>
          <Link to="/docs/it/ai-privacy-first-europa" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">IT</Link>
          <Link to="/docs/zh/privacy-first-ai-europe" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">中文</Link>
        </div>

        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">
          Privacy-first AI in Europe
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          European engineering teams are converging on a shared playbook: <strong>BYOK</strong>, <strong>open source</strong>, and when the data is
          sensitive, <strong>local inference</strong>. This guide explains why, names the European players worth knowing in 2026, and gives a
          procurement checklist you can paste into your next vendor questionnaire.
        </p>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="What 'privacy-first' looks like in practice">
          <ul>
            <li>The model provider relationship lives under <strong>your</strong> contract (BYOK).</li>
            <li>The tool's prompts and rules are <strong>auditable</strong> (open source).</li>
            <li>You can run end-to-end <strong>offline</strong> when needed (Ollama / LM Studio).</li>
            <li>Storage is minimised and <strong>encrypted at rest</strong> (AES-256-GCM for credentials).</li>
            <li>The vendor doesn't train on your data — written in the contract, not just the blog post.</li>
          </ul>
        </Section>

        <Section icon={<Flag className="h-5 w-5" />} title="The EU AI ecosystem worth knowing">
          <ul>
            <li><strong>Mistral</strong> (Paris) — open-weight and hosted models, EU-hosted endpoints, available through OpenRouter.</li>
            <li><strong>Aleph Alpha</strong> (Heidelberg) — sovereign deployments for government and regulated industry.</li>
            <li><strong>Silo AI / AMD</strong> (Helsinki) — Poro and Viking model families, focus on European languages.</li>
            <li><strong>OpenEuroLLM</strong> — EU-funded consortium for multilingual open LLMs.</li>
            <li><strong>LightOn</strong> (France) — enterprise RAG and on-premise.</li>
            <li><strong>Hugging Face</strong> (Franco-American) — model and dataset hub, EU-hosted Inference Endpoints.</li>
          </ul>
          <p>Decoder works with all of these via BYOK through OpenRouter or a direct provider endpoint.</p>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="SaaS AI vs privacy-first stack">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">&nbsp;</th>
                  <th className="px-3 py-2 text-left font-medium">Typical SaaS AI</th>
                  <th className="px-3 py-2 text-left font-medium">Decoder (BYOK)</th>
                  <th className="px-3 py-2 text-left font-medium">Decoder (local)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr><td className="text-foreground">Who holds the model key</td><td>Vendor</td><td>You</td><td>N/A</td></tr>
                <tr><td className="text-foreground">Where inference runs</td><td>Vendor cloud</td><td>Provider you chose</td><td>Your machine</td></tr>
                <tr><td className="text-foreground">Sub-processors to audit</td><td>Many</td><td>One (Decoder)</td><td>Zero</td></tr>
                <tr><td className="text-foreground">Training on your data</td><td>Depends on plan</td><td>No</td><td>No</td></tr>
                <tr><td className="text-foreground">Source available</td><td>Rarely</td><td>MIT</td><td>MIT</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<Users className="h-5 w-5" />} title="Procurement checklist">
          <ul>
            <li>BYOK supported with no extra fee?</li>
            <li>Open source under a permissive license (MIT / Apache 2.0)?</li>
            <li>Encrypted-at-rest credentials, documented algorithm?</li>
            <li>No training on customer data, in writing?</li>
            <li>EU-hosted inference option or local-inference path?</li>
            <li>DPA available, sub-processor list public?</li>
            <li>Auditable prompts and rules?</li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Frequently asked questions">
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
            <li><Link to="/docs/eu-ai-act-code-analysis" className="text-foreground underline">EU AI Act and code analysis</Link></li>
            <li><Link to="/docs/gdpr-ai-code-review" className="text-foreground underline">GDPR and AI code review</Link></li>
            <li><Link to="/docs/ai-code-review-milano-nord-italia" className="text-foreground underline">AI code review a Milano e nel Nord Italia</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">Open-source AI code review</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
