import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Cpu, ShieldCheck, GitCompare, Wallet, BookOpen } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Decoder vs CodeRabbit & Greptile — open-source AI code review tools compared";
const DESC =
  "An honest comparison of AI code review tools: Decoder (open-source, BYOK, local inference) vs CodeRabbit and Greptile. Pricing, privacy, model choice, and when each fits.";
const URL = "https://decoderead.dev/docs/comparison-coderabbit";

export const Route = createFileRoute("/docs/comparison-coderabbit")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "ai code review tools, coderabbit alternative, greptile alternative, open source code review, byok code review, local llm code review" },
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
          inLanguage: "en",
          author: { "@type": "Organization", name: "Decoder" },
          publisher: { "@type": "Organization", name: "Decoder" },
          about: ["AI code review tools", "CodeRabbit", "Greptile", "Decoder"],
        }),
      },
    ],
  }),
  component: ComparisonPage,
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

function ComparisonPage() {
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
          Decoder vs CodeRabbit vs Greptile
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The AI code review space is dominated by SaaS products like{" "}
          <strong>CodeRabbit</strong> and <strong>Greptile</strong>: hosted, opinionated, and
          billed per seat. Decoder takes a different angle — open source, bring-your-own-key, and
          able to run fully offline against a local model. Here&apos;s an honest, side-by-side look
          at the trade-offs.
        </p>

        <Section icon={<GitCompare className="h-5 w-5" />} title="At a glance">
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
                <tr><td className="text-foreground">License</td><td>MIT, open source</td><td>Closed source SaaS</td><td>Closed source SaaS</td></tr>
                <tr><td className="text-foreground">Pricing</td><td>Free — pay only your model</td><td>Per-seat subscription</td><td>Per-seat subscription</td></tr>
                <tr><td className="text-foreground">Model choice</td><td>BYOK or local (Ollama / LM Studio)</td><td>Vendor-selected</td><td>Vendor-selected</td></tr>
                <tr><td className="text-foreground">Local-only mode</td><td>Yes</td><td>No</td><td>No</td></tr>
                <tr><td className="text-foreground">Code leaves your machine</td><td>Only if you choose a cloud key</td><td>Always</td><td>Always</td></tr>
                <tr><td className="text-foreground">Static + malware scan</td><td>Built-in, no key required</td><td>AI-only</td><td>AI-only</td></tr>
                <tr><td className="text-foreground">Single file uploads</td><td>Yes (zip or single file)</td><td>PR-based</td><td>PR-based</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<KeyRound className="h-5 w-5" />} title="BYOK: you own the model relationship">
          <p>
            CodeRabbit and Greptile resell inference: you pay them, they pay the model provider,
            and you get whatever model they picked. Decoder is <strong>bring-your-own-key</strong>:
            paste an OpenAI, Anthropic, Google or OpenRouter key and the request goes straight to
            that provider on your account. Three practical consequences:
          </p>
          <ul>
            <li>You pay the raw API price — no markup, no seat tax.</li>
            <li>You pick the model per task — a cheap one for triage, a frontier one for hard reviews.</li>
            <li>Your code lands in the model provider you already audited, not a fourth party.</li>
          </ul>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Local inference: zero-egress reviews">
          <p>
            Decoder also speaks Ollama and LM Studio. Point it at a local endpoint and the entire
            review — chunking, prompting, follow-up chat — runs on your machine. No bytes leave the
            network. That is something neither CodeRabbit nor Greptile offer today, and it is the
            single biggest reason regulated teams (finance, health, defence) pick Decoder.
          </p>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Static + malware scan, without a key">
          <p>
            Before any AI call, Decoder runs deterministic checks: a static-pattern scan across 20+
            languages and a malware/IOC signature pass (the same flow that surfaced LockBit 3.0
            artefacts in a community PR). Both work without an API key and without a network
            connection. CodeRabbit and Greptile fold review into a single LLM step — fast, but
            non-deterministic and never offline.
          </p>
        </Section>

        <Section icon={<Wallet className="h-5 w-5" />} title="Cost model in the real world">
          <p>
            For a 10-person team running ~200 PRs/month:
          </p>
          <ul>
            <li>
              <strong>CodeRabbit / Greptile:</strong> ~$150–300/month in seat fees, billed whether
              you reviewed 5 PRs or 500.
            </li>
            <li>
              <strong>Decoder + OpenRouter key:</strong> typically $5–25/month in metered API
              spend, scaling with how much you actually used it.
            </li>
            <li>
              <strong>Decoder + local Llama 3.1 / Qwen Coder:</strong> $0 in API spend, only your
              own electricity.
            </li>
          </ul>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="When CodeRabbit or Greptile is the right call">
          <p>This guide isn&apos;t a hit piece. They&apos;re solid products and there are cases where they win:</p>
          <ul>
            <li>You want GitHub PR comments authored by a bot, fully managed, with zero install.</li>
            <li>You don&apos;t want to manage an API key or a local model.</li>
            <li>Per-seat billing through procurement is easier than usage-based API spend.</li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="When Decoder wins">
          <ul>
            <li>You need code <strong>never to leave your machine</strong> (regulated, IP-sensitive, classified).</li>
            <li>You want to <strong>pick the model</strong> per review and pay metered.</li>
            <li>You want <strong>static + malware</strong> checks alongside the AI explanation.</li>
            <li>You want the option to read <strong>a single file</strong>, not just a PR.</li>
            <li>You want an <strong>open-source</strong> tool you can fork, audit and self-host.</li>
          </ul>
          <p>
            Try it on a file in under a minute — see the{" "}
            <Link to="/docs" className="text-foreground underline">documentation</Link> or read the{" "}
            <Link to="/manifesto" className="text-foreground underline">manifesto</Link> for the
            principles behind the project.
          </p>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
