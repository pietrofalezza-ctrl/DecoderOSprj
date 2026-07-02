import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound, Cpu, Wallet, ShieldCheck, GitCompare, BookOpen } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI code review tools with BYOK — Decoder vs CodeRabbit & Greptile";
const DESC =
  "BYOK (bring-your-own-key) AI code review tools let you pick the model and pay metered API prices. Compare Decoder's BYOK + local inference model against CodeRabbit and Greptile.";
const URL = "https://decoderead.dev/docs/ai-code-review-tools-byok";

const FAQ = [
  {
    q: "What does BYOK mean for AI code review tools?",
    a: "BYOK (Bring Your Own Key) means you paste your own OpenAI, Anthropic, Google or OpenRouter API key into the tool. Requests go straight to the provider on your account — you pay metered API prices, not a marked-up seat subscription, and your code reaches one less vendor.",
  },
  {
    q: "Does CodeRabbit support BYOK?",
    a: "No. CodeRabbit resells inference under a per-seat subscription; you don't pick the underlying model and you can't route requests through your own provider account.",
  },
  {
    q: "Does Greptile support BYOK?",
    a: "Greptile is closed-source SaaS; standard plans don't expose a BYOK option for end users — the model and routing are vendor-selected.",
  },
  {
    q: "Which AI providers does Decoder support via BYOK?",
    a: "OpenAI, Anthropic, Google Gemini and OpenRouter for cloud models, plus Ollama and LM Studio for fully local inference. Keys are encrypted at rest with AES-256-GCM and only used to call the provider you chose.",
  },
  {
    q: "Is BYOK cheaper than per-seat AI code review?",
    a: "For most teams, yes. A 10-developer team running ~200 PRs/month typically spends $5–$25 on a metered OpenRouter key versus $150–$300/month on per-seat CodeRabbit or Greptile plans.",
  },
  {
    q: "Can I use BYOK and a local model in the same project?",
    a: "Yes. Decoder lets you mix: a local Ollama model for noisy day-to-day reviews and a cloud key (Claude, GPT-4o, Gemini) for the harder ones.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-tools-byok")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "ai code review tools byok, bring your own key code review, byok ai code review, openrouter code review, coderabbit byok, greptile alternative byok",
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
          about: ["BYOK", "AI code review", "OpenRouter", "Ollama", "CodeRabbit", "Greptile"],
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
            { "@type": "ListItem", position: 3, name: "AI code review tools BYOK", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Decoder",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web, macOS, Linux, Windows",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: "https://decoderead.dev",
          description:
            "Open-source AI code review with bring-your-own-key (OpenAI, Anthropic, Google, OpenRouter) and local inference (Ollama, LM Studio).",
        }),
      },
    ],
  }),
  component: ByokPage,
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

function ByokPage() {
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
          AI code review tools with BYOK
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Most AI code review tools — <strong>CodeRabbit</strong>, <strong>Greptile</strong>,
          Graphite Reviewer — resell inference behind a per-seat subscription. Decoder takes the
          opposite stance: <strong>bring your own key</strong> (OpenAI, Anthropic, Google,
          OpenRouter) or run fully local against Ollama / LM Studio. Here is what BYOK changes in
          practice.
        </p>

        <Section icon={<KeyRound className="h-5 w-5" />} title="What BYOK means">
          <p>
            BYOK stands for <em>bring-your-own-key</em>. Instead of paying the review tool a flat
            per-seat fee and letting it pick the model, you paste your own provider API key. Every
            review call goes directly from Decoder to that provider on your account — metered, at
            list price, with no middle billing layer.
          </p>
          <ul>
            <li>You own the billing relationship with OpenAI / Anthropic / Google / OpenRouter.</li>
            <li>You pick the model per task: cheap for triage, frontier for hard reviews.</li>
            <li>Your code touches one fewer vendor.</li>
          </ul>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="BYOK across the main tools">
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
                <tr>
                  <td className="text-foreground">BYOK (cloud)</td>
                  <td>Yes — OpenAI, Anthropic, Google, OpenRouter</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td className="text-foreground">Local inference</td>
                  <td>Yes — Ollama, LM Studio</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td className="text-foreground">Pricing model</td>
                  <td>Free app + metered API spend</td>
                  <td>Per-seat subscription</td>
                  <td>Per-seat subscription</td>
                </tr>
                <tr>
                  <td className="text-foreground">Pick model per review</td>
                  <td>Yes</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td className="text-foreground">Key storage</td>
                  <td>AES-256-GCM at rest, RLS scoped</td>
                  <td>n/a</td>
                  <td>n/a</td>
                </tr>
                <tr>
                  <td className="text-foreground">Static + malware (no key)</td>
                  <td>Built-in</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<Wallet className="h-5 w-5" />} title="What BYOK actually costs">
          <p>For a 10-developer team running ~200 PRs/month:</p>
          <ul>
            <li>
              <strong>Per-seat SaaS (CodeRabbit / Greptile):</strong> ~$150–$300/month regardless of
              usage.
            </li>
            <li>
              <strong>Decoder + OpenRouter key:</strong> typically $5–$25/month, metered.
            </li>
            <li>
              <strong>Decoder + local Qwen Coder / Llama 3.1:</strong> $0 in API spend.
            </li>
          </ul>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Setting up BYOK in Decoder">
          <ol>
            <li>
              Open{" "}
              <Link to="/settings" className="text-foreground underline">
                Settings → Credentials
              </Link>
              .
            </li>
            <li>
              Pick a provider (OpenAI, Anthropic, Google, OpenRouter) or a local endpoint (Ollama,
              LM Studio).
            </li>
            <li>Paste the key — it's encrypted with AES-256-GCM and never leaves your row.</li>
            <li>Run a review. The "Explain with AI" and Chat tabs now use your key directly.</li>
          </ol>
          <p>
            Static and malware analysis already work without a key, so you can try Decoder
            end-to-end before deciding which provider to wire up.
          </p>
        </Section>

        <Section
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Why BYOK is safer for sensitive code"
        >
          <p>
            With BYOK, your code touches Decoder and one provider you already audited. No third
            party in the middle, no shared inference pool, no opaque retention policy stacked on top
            of the model provider's own. For fully air-gapped reviews, switch the same project to a
            local Ollama model and zero bytes leave your machine.
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
              <Link to="/docs/comparison-coderabbit" className="text-foreground underline">
                Decoder vs CodeRabbit vs Greptile — full comparison
              </Link>
            </li>
            <li>
              <Link to="/docs/open-source-ai-code-review" className="text-foreground underline">
                Open-source AI code review with local inference
              </Link>
            </li>
            <li>
              <Link to="/docs/how-to-review-ai-code" className="text-foreground underline">
                How to review AI-generated code
              </Link>
            </li>
            <li>
              <Link to="/manifesto" className="text-foreground underline">
                The Decoder manifesto
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
