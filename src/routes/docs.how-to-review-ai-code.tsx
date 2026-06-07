import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert, Bug, Eye, GitPullRequest, KeyRound, BookOpen } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "How to review AI-generated code — a practical guide";
const DESC =
  "A practical guide to reviewing code written by Copilot, Cursor and other AI tools: hallucinations, security flaws, hidden dependencies, and how to audit them.";
const URL = "https://decoderdev.lovable.app/docs/how-to-review-ai-code";

export const Route = createFileRoute("/docs/how-to-review-ai-code")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
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
        }),
      },
    ],
  }),
  component: GuidePage,
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

function GuidePage() {
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
          How to review AI-generated code
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AI coding assistants — Copilot, Cursor, Claude Code — can ship working code in
          minutes. They can also ship hallucinated APIs, silent security holes and dependencies you
          never approved. This guide is a practical checklist for reading, reviewing and auditing
          that code before it reaches production.
        </p>

        <Section icon={<ShieldAlert className="h-5 w-5" />} title="1. Assume nothing is grounded">
          <p>
            Large language models predict plausible tokens. They invent function names, package
            versions, env vars and entire SDKs that look right but don&apos;t exist. Before trusting
            any AI-written snippet:
          </p>
          <ul>
            <li>Open every imported module and confirm it is installed and at the expected version.</li>
            <li>Look up unfamiliar API calls in the official docs — not in the model&apos;s suggestion.</li>
            <li>Run the code in isolation with realistic inputs, not just the happy path the model showed you.</li>
          </ul>
        </Section>

        <Section icon={<Bug className="h-5 w-5" />} title="2. Hunt for the classic AI bugs">
          <p>Most defects in AI-generated code cluster around the same patterns:</p>
          <ul>
            <li><strong>Hallucinated APIs.</strong> Methods, options or properties that don&apos;t exist.</li>
            <li><strong>Wrong error handling.</strong> Swallowed exceptions, missing retries, async errors not awaited.</li>
            <li><strong>Silent type coercion.</strong> Numbers parsed as strings, dates without timezones, nullable values unguarded.</li>
            <li><strong>Off-by-one and pagination.</strong> Loops that miss the last item, queries without limits.</li>
            <li><strong>Race conditions.</strong> Parallel writes without locks, optimistic UI without rollback.</li>
          </ul>
        </Section>

        <Section icon={<KeyRound className="h-5 w-5" />} title="3. Treat security as the first review pass">
          <p>
            Models are trained on public code, which contains a lot of insecure patterns. Read
            generated code with an attacker in mind:
          </p>
          <ul>
            <li>SQL strings concatenated with user input → parameterise.</li>
            <li>Secrets read from the client bundle or committed to the repo → move to server env.</li>
            <li>Authorisation checks missing on server routes and database policies.</li>
            <li>File uploads with no MIME / size validation.</li>
            <li>CORS set to <code>*</code> on endpoints that mutate state.</li>
          </ul>
        </Section>

        <Section icon={<Eye className="h-5 w-5" />} title="4. Read the diff, not the summary">
          <p>
            AI tools often present a friendly summary of what they changed. Read the actual diff
            line by line. Pay extra attention to:
          </p>
          <ul>
            <li>Files you didn&apos;t expect to be touched.</li>
            <li>New dependencies in <code>package.json</code> / lockfile.</li>
            <li>Config files: build config, env, CI, infra.</li>
            <li>Deletions — what the model removed is as important as what it added.</li>
          </ul>
        </Section>

        <Section icon={<GitPullRequest className="h-5 w-5" />} title="5. Make the review repeatable">
          <ul>
            <li>Run linters, type checks and tests on every AI commit — same gate as a human PR.</li>
            <li>Add regression tests around the behaviour the model changed, not just new features.</li>
            <li>Keep a small set of golden prompts and outputs so you can compare model behaviour over time.</li>
            <li>For multi-file changes, ask the model to explain each file in plain language and verify the explanation matches the code.</li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="6. Where Decoder fits">
          <p>
            Decoder is an open-source reader for AI-generated code. You connect your own cloud
            provider key (OpenAI, Anthropic, Google, OpenRouter) or run fully local with Ollama /
            LM Studio, then point it at a repo or a single file. It produces a structured
            explanation, flags suspicious patterns, and lets you ask follow-up questions in
            multiple languages — without sending your code to a third-party SaaS.
          </p>
          <p>
            It is MIT-licensed, BYOK, and stores nothing on our side. See the{" "}
            <Link to="/docs" className="text-foreground underline">documentation</Link> to get started,
            or read the{" "}
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
