import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Scale, ShieldCheck, ClipboardCheck, BookOpen, AlertTriangle } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "EU AI Act and AI code analysis — compliance guide for dev teams";
const DESC =
  "How the EU AI Act applies to AI code review and analysis tools. Risk tiers, transparency obligations, GPAI rules, and a practical compliance checklist for European engineering teams.";
const URL = "https://decoderead.dev/docs/eu-ai-act-code-analysis";

const FAQ = [
  {
    q: "Does the EU AI Act apply to AI code review tools?",
    a: "Yes, when they're used inside the EU. Most AI code review tools fall under the general-purpose AI (GPAI) provisions because they wrap a foundation model. The obligations focus on transparency, technical documentation, copyright disclosures, and downstream user information.",
  },
  {
    q: "Is AI code analysis high-risk under the AI Act?",
    a: "Reviewing third-party code is not in Annex III, so it isn't high-risk by default. It becomes high-risk only when the output materially drives decisions in regulated domains (critical infrastructure, employment, essential services). Most engineering use is limited-risk with transparency duties.",
  },
  {
    q: "What changes for GPAI providers in 2025–2026?",
    a: "GPAI providers must publish a model card, a training-data summary, and an EU copyright policy. Downstream users (you, the engineering team) inherit the duty to keep humans in the loop and to disclose AI involvement to affected parties.",
  },
  {
    q: "How does BYOK help with AI Act compliance?",
    a: "BYOK keeps the model provider relationship under your existing DPA. The review tool becomes a thin client, your inference happens on the provider you already audited, and you can switch providers without re-papering contracts.",
  },
];

export const Route = createFileRoute("/docs/eu-ai-act-code-analysis")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "eu ai act, ai act code review, gpai compliance, ai code analysis europe, ai act developer obligations" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
      { rel: "alternate", hrefLang: "it", href: "https://decoderead.dev/docs/it/eu-ai-act-analisi-codice" },
      { rel: "alternate", hrefLang: "zh", href: "https://decoderead.dev/docs/zh/eu-ai-act-code-analysis" },
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
          about: ["EU AI Act", "AI compliance", "Code review", "GPAI"],
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://decoderead.dev/" },
            { "@type": "ListItem", position: 2, name: "Docs", item: "https://decoderead.dev/docs" },
            { "@type": "ListItem", position: 3, name: "EU AI Act and code analysis", item: URL },
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
          <Link to="/docs/eu-ai-act-code-analysis" className="rounded border border-border bg-card px-2 py-1 text-foreground">EN</Link>
          <Link to="/docs/it/eu-ai-act-analisi-codice" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">IT</Link>
          <Link to="/docs/zh/eu-ai-act-code-analysis" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">中文</Link>
        </div>

        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">
          EU AI Act and AI code analysis
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The EU AI Act entered into force in August 2024 and phases in through 2026–2027. If you ship code in Europe and you use AI to read,
          review or generate it, this is the practical version of what changes for your team and how a <strong>privacy-first, BYOK</strong> tool like
          Decoder fits the new regime.
        </p>

        <Section icon={<Scale className="h-5 w-5" />} title="Where AI code analysis sits in the risk pyramid">
          <p>The Act uses four tiers: <strong>unacceptable</strong>, <strong>high-risk</strong>, <strong>limited-risk</strong>, <strong>minimal-risk</strong>. AI code review is not listed in Annex III, so it sits in the limited-risk band by default. The obligation is mainly <em>transparency</em>: tell users when output is AI-generated, document the model you're using, and keep a human reviewer in the loop for anything that ships to production.</p>
          <p>It escalates to high-risk only when the AI's output materially decides outcomes in regulated areas — critical infrastructure, employment, credit scoring, essential public services. Reviewing a pull request rarely qualifies; auto-merging it into a payments gateway might.</p>
        </Section>

        <Section icon={<AlertTriangle className="h-5 w-5" />} title="GPAI: what changes for foundation-model users">
          <p>The general-purpose AI (GPAI) chapter, applicable from August 2025, puts the bulk of obligations on the <strong>provider</strong> of the model: model cards, a training-data summary, an EU copyright policy, and (for systemic-risk models above 10^25 FLOPs) red-teaming and incident reporting.</p>
          <p>As a <strong>downstream deployer</strong> you inherit lighter but real duties:</p>
          <ul>
            <li>Inform reviewers and affected developers when AI is in the loop.</li>
            <li>Keep technical documentation of how you use the model (prompts, retention, who can read outputs).</li>
            <li>Maintain a human-in-the-loop process for decisions that affect people.</li>
            <li>Respect copyright reservations on training data — relevant if you fine-tune on internal code.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Why BYOK and local inference simplify compliance">
          <p>BYOK means the model provider relationship lives under <strong>your</strong> DPA, not the review tool's. The tool becomes a thin client; your auditors only have to assess one new sub-processor (the review tool itself, not the LLM provider you already cleared).</p>
          <p>Local inference (Ollama, LM Studio) collapses the picture further: no provider, no transfer, no DPA. For finance, health and defence teams in the EU this is often the only path that gets through procurement.</p>
        </Section>

        <Section icon={<ClipboardCheck className="h-5 w-5" />} title="Compliance checklist for engineering teams">
          <ul>
            <li>Document which AI models are allowed for code work, and which are blocked.</li>
            <li>Record AI involvement in code-review metadata (commit trailer, PR label).</li>
            <li>Keep the human reviewer named and accountable on every merge.</li>
            <li>Use BYOK or local inference for anything covered by an NDA or IP clause.</li>
            <li>Refresh the AI-use policy yearly and after every model-provider change.</li>
            <li>Train developers on prompt injection and on what counts as personal data in code.</li>
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
            <li><Link to="/docs/gdpr-ai-code-review" className="text-foreground underline">GDPR and AI code review</Link></li>
            <li><Link to="/docs/privacy-first-ai-europe" className="text-foreground underline">Privacy-first AI in Europe — 2026 buyer's guide</Link></li>
            <li><Link to="/docs/ai-code-review-milano-nord-italia" className="text-foreground underline">AI code review a Milano e nel Nord Italia</Link></li>
            <li><Link to="/docs/ai-code-review-tools-byok" className="text-foreground underline">AI code review tools with BYOK</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
