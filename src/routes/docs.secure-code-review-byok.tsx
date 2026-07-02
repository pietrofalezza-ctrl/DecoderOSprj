import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, KeyRound, Cpu, BookOpen, Lock, GitCompare } from "lucide-react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Secure code review with BYOK and local models — Decoder";
const DESC =
  "Run a secure code review using BYOK (OpenAI, Anthropic, OpenRouter) or fully local models. Code stays on your machine or goes only to your chosen provider.";
const URL = "https://decoderead.dev/docs/secure-code-review-byok";

const FAQ = [
  { q: "What makes a code review 'secure' from a data perspective?", a: "Code that is reviewed should touch the minimum number of vendors. BYOK means code goes to one provider you already audited. Local models mean it never leaves your machine at all." },
  { q: "Is BYOK code review compliant with SOC 2 / ISO 27001?", a: "Decoder's BYOK flow routes code to the provider you specify — the same one you likely already have a DPA with. Local model mode is zero-egress, which satisfies the strictest data residency requirements." },
  { q: "How are API keys stored in Decoder?", a: "Keys are encrypted with AES-256-GCM at rest, stored in a row-level-security scoped table so only your user can read them, and never logged or sent to Decoder's own servers." },
  { q: "Can I do a secure code review fully offline?", a: "Yes. Add an Ollama or LM Studio endpoint in Settings → Credentials. All inference — chunking, prompting, chat — runs locally. The static and malware pass are also offline by default." },
  { q: "Which regulated industries use local-model code review?", a: "Finance, healthcare, and defence teams are the most common. Any team operating under data residency requirements, IP confidentiality clauses, or air-gap mandates benefits from local-only review." },
];

export const Route = createFileRoute("/docs/secure-code-review-byok")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "secure code review byok, secure ai code review, local model code review, air gap code review, private code review ai" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: URL, mainEntityOfPage: URL, inLanguage: "en", datePublished: "2026-06-29", dateModified: "2026-06-29", author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" }, publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" } }) },
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) },
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://decoderead.dev/" }, { "@type": "ListItem", position: 2, name: "Docs", item: "https://decoderead.dev/docs" }, { "@type": "ListItem", position: 3, name: "Secure code review with BYOK", item: URL }] }) },
    ],
  }),
  component: SecureByokPage,
});

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary">{icon}</span>
        <h2 className="font-display text-2xl font-medium tracking-tight">{title}</h2>
      </div>
      <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:marker:text-muted-foreground">{children}</div>
    </section>
  );
}

function SecureByokPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur">
        <Link to="/" aria-label="Decoder"><Logo /></Link>
        <div className="flex items-center gap-1"><ThemeToggle /><LangSwitcher /><PublicHeaderAuthSlot ctaLabelKey="landing.ctaSignIn" showArrow={false} /></div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Back to docs</Link>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">Secure code review with BYOK and local models</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Standard AI code review tools send your source code to a vendor's backend — adding a
          fourth party to your data chain without a DPA. <strong>Secure code review with BYOK</strong>{" "}
          means your code goes only to the provider you already chose and audited, or — with a local
          model — never leaves your machine at all.
        </p>

        <Section icon={<Lock className="h-5 w-5" />} title="The data-flow problem with managed review tools">
          <p>
            When you use a managed AI code review SaaS, code travels:
          </p>
          <ol>
            <li>From your Git host → to the review vendor's backend.</li>
            <li>From the review vendor → to whichever model provider they chose.</li>
            <li>Responses flow back through both hops before you see a comment.</li>
          </ol>
          <p>
            That is two vendors seeing your IP, often under opaque sub-processor agreements. For
            teams in regulated industries or operating under IP confidentiality clauses, this is a
            blocker.
          </p>
        </Section>

        <Section icon={<KeyRound className="h-5 w-5" />} title="BYOK: one provider, your account">
          <p>
            With Decoder's BYOK model, the flow collapses to:
          </p>
          <ol>
            <li>Your file → Decoder's analysis engine (static + malware, no external call).</li>
            <li>Flagged snippets → directly to your chosen provider (OpenAI, Anthropic, Google, OpenRouter) on your account.</li>
          </ol>
          <p>
            The review vendor (Decoder) never sees the content of the AI call. The model provider
            is the same one you likely already have a DPA or BAA with.
          </p>
          <ul>
            <li>Keys stored AES-256-GCM, row-level-security scoped.</li>
            <li>No Decoder server is in the inference path.</li>
            <li>You pay the provider directly at metered API rates.</li>
          </ul>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Local models: zero egress">
          <p>
            For the strictest requirements — air-gapped environments, data residency mandates,
            classified code — Decoder also supports Ollama and LM Studio as local endpoints. In
            this mode:
          </p>
          <ul>
            <li>Static and malware scan: always local, no network call.</li>
            <li>AI inference: routed to your local Ollama / LM Studio process.</li>
            <li>Chat with findings: also local.</li>
            <li>Result: zero bytes leave the machine at any step.</li>
          </ul>
          <p>Recommended models for local secure review: <strong>Qwen2.5-Coder 14B</strong> (best quality), <strong>Llama 3.1 8B</strong> (fast, M-series Macs), <strong>DeepSeek-Coder-V2-Lite</strong> (lower VRAM).</p>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="Security posture comparison">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr><th className="px-3 py-2 text-left font-medium">Configuration</th><th className="px-3 py-2 text-left font-medium">Vendors who see code</th><th className="px-3 py-2 text-left font-medium">Network egress</th></tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr><td className="text-foreground">Managed SaaS (CodeRabbit)</td><td>Review vendor + model vendor</td><td>Yes</td></tr>
                <tr><td className="text-foreground">Decoder + BYOK (cloud)</td><td>Model vendor only (your account)</td><td>Yes (your provider)</td></tr>
                <tr><td className="text-foreground">Decoder + local Ollama</td><td>None</td><td>None</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Compliance notes">
          <p>
            Decoder is not a compliance product and this is not legal advice. That said, the
            zero-egress local model configuration eliminates most sub-processor disclosure
            obligations and satisfies the "data stays in the EU / US / your jurisdiction"
            requirement without any DPA negotiation. BYOK with a provider you already have a DPA
            with (e.g. Azure OpenAI, Anthropic) adds AI review to an existing compliant data
            agreement.
          </p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Frequently asked questions">
          <dl className="space-y-4">{FAQ.map((f) => (<div key={f.q}><dt className="font-medium text-foreground">{f.q}</dt><dd className="mt-1">{f.a}</dd></div>))}</dl>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Related guides">
          <ul>
            <li><Link to="/docs/ai-code-review-tools-byok" className="text-foreground underline">AI code review tools with BYOK — provider, pricing and key storage</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">Open-source AI code review with local inference</Link></li>
            <li><Link to="/docs/chat-with-your-codebase" className="text-foreground underline">Chat with your codebase using AI (BYOK)</Link></li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">Decoder — open-source code understanding for the AI era.</footer>
    </div>
  );
}
