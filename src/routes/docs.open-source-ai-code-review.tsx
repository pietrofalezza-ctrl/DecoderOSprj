import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Cpu, GitBranch, ShieldCheck, GitCompare, BookOpen, Terminal } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Open-source AI code review — local inference, BYOK, zero egress";
const DESC =
  "An open-source AI code review tool you can fork, audit and self-host. Compare Decoder (MIT, BYOK, local Ollama / LM Studio) to closed SaaS like CodeRabbit and Greptile.";
const URL = "https://decoderead.dev/docs/open-source-ai-code-review";

const FAQ = [
  {
    q: "Is there a truly open-source AI code review tool?",
    a: "Yes — Decoder is MIT-licensed. The repository, the analysis pipeline, the prompts and the static/malware rules are all auditable on GitHub, and you can self-host the whole stack.",
  },
  {
    q: "Can open-source AI code review work fully offline?",
    a: "Yes, when you pair it with a local model runner. Decoder integrates with Ollama and LM Studio so chunking, prompting and chat all happen on your machine — no bytes leave the network.",
  },
  {
    q: "How does open-source AI code review compare to CodeRabbit and Greptile?",
    a: "CodeRabbit and Greptile are closed-source SaaS billed per seat. They require sending code to their backend and don't expose model choice. Decoder is open source, BYOK, and supports local-only review.",
  },
  {
    q: "Which models work best for local AI code review?",
    a: "Qwen2.5-Coder (7B / 14B / 32B) and Llama 3.1 8B / 70B are the strongest open-weight choices today. For lighter machines, DeepSeek-Coder-V2-Lite or Phi-3.5 give usable explanations.",
  },
  {
    q: "Can I run open-source AI code review in CI?",
    a: "Yes. Because Decoder's static and malware passes work without an API key, you can wire them into CI and only call a model on flagged diffs — keeping CI fast and cheap.",
  },
  {
    q: "Where is my code stored?",
    a: "With a local model nothing leaves your machine. With BYOK only the model provider you chose (OpenAI, Anthropic, Google, OpenRouter) sees the snippet, on your own account.",
  },
];

export const Route = createFileRoute("/docs/open-source-ai-code-review")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "open source ai code review, self-hosted code review, ollama code review, lm studio code review, mit ai code review, coderabbit open source alternative",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
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
          about: ["Open source", "AI code review", "Ollama", "LM Studio", "Self-hosted"],
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
            { "@type": "ListItem", position: 3, name: "Open-source AI code review", item: URL },
          ],
        }),
      },
    ],
  }),
  component: OpenSourcePage,
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

function OpenSourcePage() {
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
          <ArrowLeft className="h-3 w-3" /> Back to docs
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          Open-source AI code review
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Most AI code review runs on someone else's GPUs, behind someone else's NDA. Decoder is the
          opposite: <strong>MIT-licensed</strong>, <strong>BYOK</strong>, and able to run end-to-end
          against a <strong>local model</strong>. This page is the short version of why that
          matters and how to set it up.
        </p>

        <Section icon={<GitBranch className="h-5 w-5" />} title="Why open source matters for code review">
          <ul>
            <li><strong>Auditable prompts.</strong> You can read every prompt sent to the model.</li>
            <li><strong>Auditable rules.</strong> The static and malware patterns are in the repo, not a vendor blackbox.</li>
            <li><strong>Forkable.</strong> Add a rule, change a scorer, ship internally.</li>
            <li><strong>No lock-in.</strong> Swap provider or run local without changing tools.</li>
          </ul>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Local inference: zero egress">
          <p>
            Decoder speaks Ollama and LM Studio natively. Pull a model, point Decoder at the local
            endpoint, and chunking, prompting and follow-up chat all run on your machine. Nothing
            leaves the network — important for regulated code (finance, health, defence) and for
            anything covered by an IP clause that bans third-party processing.
          </p>
          <p>Recommended starting models:</p>
          <ul>
            <li><strong>Qwen2.5-Coder 14B</strong> — best quality on a single 16GB GPU.</li>
            <li><strong>Llama 3.1 8B Instruct</strong> — fast, runs on M-series Macs.</li>
            <li><strong>DeepSeek-Coder-V2-Lite</strong> — great for tight VRAM budgets.</li>
          </ul>
        </Section>

        <Section icon={<Terminal className="h-5 w-5" />} title="Quickstart">
          <ol>
            <li>Install <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline">Ollama</a> and run <code>ollama pull qwen2.5-coder:14b</code>.</li>
            <li>Open <Link to="/settings" className="text-foreground underline">Settings → Credentials</Link> and add an Ollama endpoint (default <code>http://localhost:11434</code>).</li>
            <li>Upload a file or ZIP from the dashboard.</li>
            <li>Run Static and Malware (no key needed), then "Explain with AI" against your local model.</li>
          </ol>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="Open source vs closed SaaS">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">&nbsp;</th>
                  <th className="px-3 py-2 text-left font-medium">Decoder</th>
                  <th className="px-3 py-2 text-left font-medium">CodeRabbit</th>
                  <th className="px-3 py-2 text-left font-medium">Greptile</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr><td className="text-foreground">License</td><td>MIT, open source</td><td>Closed source</td><td>Closed source</td></tr>
                <tr><td className="text-foreground">Self-hostable</td><td>Yes</td><td>No</td><td>No</td></tr>
                <tr><td className="text-foreground">Local-only review</td><td>Yes (Ollama / LM Studio)</td><td>No</td><td>No</td></tr>
                <tr><td className="text-foreground">BYOK</td><td>Yes</td><td>No</td><td>No</td></tr>
                <tr><td className="text-foreground">Auditable prompts</td><td>Yes</td><td>No</td><td>No</td></tr>
                <tr><td className="text-foreground">Static + malware scan</td><td>Built-in, no key</td><td>No</td><td>No</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Privacy and compliance">
          <p>
            For regulated teams the calculus is simple: if the review never leaves the laptop,
            there is no DPA to negotiate, no sub-processor to disclose, no leak to investigate.
            Open-source + local inference is the only configuration that delivers that, and it's
            Decoder's default story.
          </p>
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
            <li>
              <Link to="/docs/ai-code-review-tools-byok" className="text-foreground underline">
                AI code review tools with BYOK
              </Link>
            </li>
            <li>
              <Link to="/docs/comparison-coderabbit" className="text-foreground underline">
                Decoder vs CodeRabbit vs Greptile — full comparison
              </Link>
            </li>
            <li>
              <Link to="/docs/how-to-review-ai-code" className="text-foreground underline">
                How to review AI-generated code
              </Link>
            </li>
            <li>
              <Link to="/contributors" className="text-foreground underline">
                Community contributors
              </Link>
            </li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      
        <div className="mt-2"><InstagramLink /></div></footer>
    </div>
  );
}
