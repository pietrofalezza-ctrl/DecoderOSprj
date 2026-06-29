import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, FileText, Globe, BookOpen, ShieldCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "GDPR-compliant AI code review — data residency and source code as personal data";
const DESC =
  "When source code becomes personal data under GDPR, why EU data residency matters for AI code review, and how BYOK plus encrypted-at-rest credentials reduce the controller's exposure.";
const URL = "https://decoderead.dev/docs/gdpr-ai-code-review";

const FAQ = [
  {
    q: "Can source code be personal data under GDPR?",
    a: "Yes, often. Author names in commits, email addresses in comments, IP addresses in logs, sample data with names and identifiers, and secrets that reveal an individual all qualify as personal data when present in the code or its history.",
  },
  {
    q: "Where does Decoder process my code?",
    a: "ZIP uploads are processed ephemerally in our Cloudflare Workers edge runtime, then deleted. With BYOK, model calls go directly to your chosen provider on your account. With local inference (Ollama / LM Studio) nothing leaves your machine.",
  },
  {
    q: "Do I need a DPA with Decoder?",
    a: "If you process personal data through Decoder on behalf of others, yes — we are a processor. Email contact@decoderead.dev. With local inference Decoder typically isn't a processor at all because the platform is the orchestrator and the data stays on your side.",
  },
  {
    q: "How are BYOK keys stored?",
    a: "API keys are encrypted at rest with AES-256-GCM and only decrypted server-side at the moment of an outbound provider call. The encrypted ciphertext is not exposed to the browser. See the Data flow page for the full picture.",
  },
];

export const Route = createFileRoute("/docs/gdpr-ai-code-review")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "gdpr ai code review, ai code analysis gdpr, data residency ai code, source code personal data, ai dpa europe" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
      { rel: "alternate", hrefLang: "it", href: "https://decoderead.dev/docs/it/gdpr-revisione-codice-ai" },
      { rel: "alternate", hrefLang: "zh", href: "https://decoderead.dev/docs/zh/gdpr-ai-code-review" },
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
          about: ["GDPR", "AI code review", "Data residency", "BYOK"],
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://decoderead.dev/" },
            { "@type": "ListItem", position: 2, name: "Docs", item: "https://decoderead.dev/docs" },
            { "@type": "ListItem", position: 3, name: "GDPR AI code review", item: URL },
          ],
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
          <Link to="/docs/gdpr-ai-code-review" className="rounded border border-border bg-card px-2 py-1 text-foreground">EN</Link>
          <Link to="/docs/it/gdpr-revisione-codice-ai" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">IT</Link>
          <Link to="/docs/zh/gdpr-ai-code-review" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">中文</Link>
        </div>

        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">
          GDPR and AI code review
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          GDPR doesn't mention "code", but the moment a repository contains author identifiers, sample data, or operator comments, parts of it become
          <strong> personal data</strong>. Once an AI tool reads that code, you have a processing chain to govern. Here's the short, practical version
          for engineering teams in Europe.
        </p>

        <Section icon={<FileText className="h-5 w-5" />} title="When source code becomes personal data">
          <ul>
            <li><strong>Commit metadata</strong> — author name, email, IP. Always personal data.</li>
            <li><strong>Comments</strong> — names, ticket assignees, internal slack handles.</li>
            <li><strong>Test fixtures</strong> — sample customers, real-looking emails, demo accounts.</li>
            <li><strong>Logs and dumps</strong> committed by mistake — IPs, user IDs, sometimes credentials.</li>
            <li><strong>Secrets</strong> — when a key identifies an individual operator, it counts too.</li>
          </ul>
          <p>If any of these end up in a prompt to a third-party LLM, that LLM provider becomes a sub-processor and you need a legal basis plus the right contractual cover.</p>
        </Section>

        <Section icon={<Globe className="h-5 w-5" />} title="Data residency: where the bytes actually land">
          <p>EU teams usually need to know two things: <em>where does the review tool process my code</em>, and <em>where does the model run</em>. Decoder's answer:</p>
          <ul>
            <li>ZIP uploads and analysis run in <strong>Cloudflare Workers</strong> — globally distributed but encrypted in transit, processed ephemerally, and deleted after the analysis.</li>
            <li><strong>BYOK</strong> means the model call goes directly to the provider on <em>your</em> account, under <em>your</em> DPA with that provider. You pick OpenAI, Anthropic, Google or OpenRouter, and you pick the region they offer.</li>
            <li><strong>Local inference</strong> (Ollama / LM Studio) keeps everything on your machine — the cleanest residency story possible.</li>
          </ul>
        </Section>

        <Section icon={<Lock className="h-5 w-5" />} title="Credentials and storage">
          <p>BYOK keys are encrypted at rest with <strong>AES-256-GCM</strong> using a server-side key. The encrypted ciphertext is never returned to the browser — only a non-sensitive hint (last 4 characters and provider name) is exposed for UI display. Decryption happens server-side, at the exact moment of an outbound provider call, and the plaintext lives only in memory for that request.</p>
          <p>Read the full picture on the <Link to="/data-flow" className="text-foreground underline">Data flow</Link> page.</p>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="DPA, sub-processors and your paperwork">
          <p>If you process personal data through Decoder on behalf of customers (typical for agencies, consultancies, SaaS vendors), Decoder is your processor and you need a DPA. Request one at <a href="mailto:contact@decoderead.dev" className="text-foreground underline">contact@decoderead.dev</a>. Sub-processors are listed in the privacy page and kept short on purpose: Cloudflare for compute and a transactional email provider for notifications. With local inference there are usually no sub-processors at all.</p>
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
            <li><Link to="/docs/eu-ai-act-code-analysis" className="text-foreground underline">EU AI Act and AI code analysis</Link></li>
            <li><Link to="/docs/privacy-first-ai-europe" className="text-foreground underline">Privacy-first AI in Europe</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">Open-source AI code review</Link></li>
            <li><Link to="/privacy" className="text-foreground underline">Privacy policy</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
