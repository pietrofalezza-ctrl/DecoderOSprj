import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  KeyRound,
  Cpu,
  ShieldCheck,
  GitCompare,
  Wallet,
  BookOpen,
  Lock,
} from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Greptile alternative — Decoder vs Greptile (open source, BYOK, local AI)";
const DESC =
  "Looking for a Greptile alternative? Decoder is an open-source, BYOK AI code review tool that can run fully offline with Ollama or LM Studio. Side-by-side comparison of pricing, privacy, model choice and deployment.";
const URL = "https://decoderead.dev/docs/comparison-greptile";

export const Route = createFileRoute("/docs/comparison-greptile")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "greptile, greptile alternative, ai code review, open source code review, byok code review, local llm code review, decoder vs greptile",
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
          inLanguage: "en",
          author: { "@type": "Organization", name: "Decoder" },
          publisher: { "@type": "Organization", name: "Decoder" },
          about: ["Greptile", "AI code review", "Decoder", "Open source"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Docs", item: "https://decoderead.dev/docs" },
            { "@type": "ListItem", position: 2, name: "Decoder vs Greptile", item: URL },
          ],
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
          Decoder vs Greptile
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          <strong>Greptile</strong> is a hosted AI code review service that indexes your repository
          in their cloud and posts review comments on every pull request. Decoder takes the opposite
          stance: open source, bring-your-own-key, and able to run fully offline on a local model.
          If you&apos;re evaluating Greptile and want a privacy-first, self-hostable alternative,
          this is an honest side-by-side.
        </p>

        <Section icon={<GitCompare className="h-5 w-5" />} title="At a glance">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">&nbsp;</th>
                  <th className="px-3 py-2 text-left font-medium">Decoder</th>
                  <th className="px-3 py-2 text-left font-medium">Greptile</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr>
                  <td className="text-foreground">License</td>
                  <td>MIT, open source</td>
                  <td>Closed source SaaS</td>
                </tr>
                <tr>
                  <td className="text-foreground">Pricing</td>
                  <td>Free — pay only your model</td>
                  <td>Per-seat subscription</td>
                </tr>
                <tr>
                  <td className="text-foreground">Model choice</td>
                  <td>BYOK or local (Ollama / LM Studio)</td>
                  <td>Vendor-selected</td>
                </tr>
                <tr>
                  <td className="text-foreground">Local-only mode</td>
                  <td>Yes — zero egress</td>
                  <td>No — cloud only</td>
                </tr>
                <tr>
                  <td className="text-foreground">Where your code is indexed</td>
                  <td>Your machine or your provider</td>
                  <td>Greptile&apos;s cloud</td>
                </tr>
                <tr>
                  <td className="text-foreground">Static + malware scan</td>
                  <td>Built-in, no key required</td>
                  <td>AI-only</td>
                </tr>
                <tr>
                  <td className="text-foreground">Single file uploads</td>
                  <td>Yes (zip or single file)</td>
                  <td>PR / repo-based</td>
                </tr>
                <tr>
                  <td className="text-foreground">Self-hostable</td>
                  <td>Yes — fork &amp; deploy</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<Lock className="h-5 w-5" />} title="Where your code actually goes">
          <p>
            Greptile&apos;s value proposition is a codebase-aware reviewer, but to deliver it they
            need to ingest and index your repository on their infrastructure. For many teams that
            crosses a hard line — IP-sensitive monorepos, regulated industries, government code.
            Decoder never indexes on a third party: your code is either processed locally (Ollama /
            LM Studio) or sent directly to a model provider you already trust under your own key.
          </p>
        </Section>

        <Section icon={<KeyRound className="h-5 w-5" />} title="BYOK vs resold inference">
          <p>
            Greptile bundles inference into a per-seat price. Decoder is{" "}
            <strong>bring-your-own-key</strong>: paste an OpenAI, Anthropic, Google or OpenRouter
            key and requests go directly to that provider on your account. You pay the raw API
            price, pick the model per task, and your code lands in a model provider you already
            audited — not a fourth party.
          </p>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Local inference: zero-egress reviews">
          <p>
            Point Decoder at a local Ollama or LM Studio endpoint and the entire flow — chunking,
            prompting, follow-up chat — runs on your laptop. Nothing leaves the network. Greptile
            has no equivalent: the service only works in their cloud.
          </p>
        </Section>

        <Section
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Static + malware checks, without a key"
        >
          <p>
            Before any AI call, Decoder runs deterministic checks: a static-pattern scan across 20+
            languages and a malware/IOC signature pass (the same flow that surfaced LockBit 3.0
            artefacts in a community PR). Both work offline and without an API key. Greptile is
            AI-only — fast, but non-deterministic and never offline.
          </p>
        </Section>

        <Section icon={<Wallet className="h-5 w-5" />} title="Cost in the real world">
          <p>For a 10-person team running ~200 PRs/month:</p>
          <ul>
            <li>
              <strong>Greptile:</strong> per-seat fees regardless of usage — 10 seats, billed
              whether you reviewed 5 PRs or 500.
            </li>
            <li>
              <strong>Decoder + OpenRouter:</strong> typically $5–25/month metered, scaling with
              real usage.
            </li>
            <li>
              <strong>Decoder + local Llama 3.1 / Qwen Coder:</strong> $0 in API spend.
            </li>
          </ul>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="When Greptile is the right call">
          <p>This isn&apos;t a hit piece. Greptile wins when:</p>
          <ul>
            <li>You want a managed bot that posts PR comments with zero install or self-host.</li>
            <li>You&apos;re fine with your repo being indexed in a vendor cloud.</li>
            <li>Per-seat billing through procurement is easier than usage-based API spend.</li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="When Decoder wins">
          <ul>
            <li>
              You need code <strong>never to leave your machine</strong>.
            </li>
            <li>
              You want to <strong>pick the model</strong> per review and pay metered.
            </li>
            <li>
              You want <strong>static + malware</strong> checks alongside the AI explanation.
            </li>
            <li>
              You want to review <strong>a single file</strong>, not just a PR.
            </li>
            <li>
              You want an <strong>open-source</strong> tool you can fork, audit and self-host.
            </li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Related guides">
          <ul>
            <li>
              <Link to="/docs/comparison-coderabbit" className="text-foreground underline">
                Decoder vs CodeRabbit vs Greptile — full three-way comparison
              </Link>
            </li>
            <li>
              <Link to="/docs/ai-code-review-tools-byok" className="text-foreground underline">
                AI code review tools with BYOK — provider, pricing and key storage
              </Link>
            </li>
            <li>
              <Link to="/docs/open-source-ai-code-review" className="text-foreground underline">
                Open-source AI code review with local inference (Ollama, LM Studio)
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
