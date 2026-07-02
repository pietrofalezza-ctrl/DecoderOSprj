import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, ShieldCheck, Cpu, GitCompare, BookOpen, AlertTriangle } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "How to detect AI-generated code — patterns & tools";
const DESC =
  "Practical signals that betray AI-generated code: structural patterns, comment style, test coverage gaps. Plus free tooling to flag it automatically.";
const URL = "https://decoderead.dev/docs/detect-ai-generated-code";

const FAQ = [
  {
    q: "How do you detect AI-generated code reliably?",
    a: "No single signal is definitive. A combination of structural patterns (over-uniform variable naming, excessive comments, suspiciously complete stubs), static analysis results, and LLM-assisted review gives the strongest signal. Tools like Decoder surface these in one pass.",
  },
  {
    q: "Does AI-generated code have a different bug profile?",
    a: "Yes. LLM-produced code tends to over-trust inputs (missing boundary checks), hallucinate API signatures, and copy security anti-patterns from training data. Static analysis and a targeted security review catch most of these.",
  },
  {
    q: "Can I use a free tool to detect AI-generated code?",
    a: "Decoder's static analysis pass runs without an API key and flags common AI-generated patterns. It is free and open-source (MIT licence).",
  },
  {
    q: "Is detecting AI code different from detecting copy-paste code?",
    a: "Partially. AI-generated code often looks superficially original but shares deep structural patterns with common LLM outputs. A semantic diff against known model outputs is more useful than a literal hash check.",
  },
  {
    q: "Should teams block AI-generated code?",
    a: "That is a policy question. Most teams choose to review it more carefully rather than block it outright. Automated flagging combined with a human review step balances velocity and quality.",
  },
];

export const Route = createFileRoute("/docs/detect-ai-generated-code")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "detect ai generated code, ai code detection, ai generated code patterns, llm code review, ai code review tool" },
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
            { "@type": "ListItem", position: 3, name: "How to detect AI-generated code", item: URL },
          ],
        }),
      },
    ],
  }),
  component: DetectAICodePage,
});

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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

function DetectAICodePage() {
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

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          How to detect AI-generated code
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AI-generated code is now a majority of new commits in many codebases. Knowing{" "}
          <strong>how to detect AI-generated code</strong> — its structural tells, its typical failure
          modes, and the tooling that flags it automatically — helps reviewers triage faster and
          catch the bugs LLMs reliably miss.
        </p>

        <Section icon={<Search className="h-5 w-5" />} title="Structural signals of AI-generated code">
          <p>
            No single trait is conclusive, but a cluster of the following raises confidence:
          </p>
          <ul>
            <li>
              <strong>Verbosely named variables throughout</strong> — LLMs favour fully descriptive
              names (<code>userAuthenticationToken</code>) where a human would write <code>token</code>.
            </li>
            <li>
              <strong>Comment density disproportionate to complexity</strong> — AI explains obvious
              lines while leaving genuinely complex logic uncommented.
            </li>
            <li>
              <strong>Suspiciously complete stubs</strong> — every edge case handled, every error
              caught, even ones the surrounding code never exercises.
            </li>
            <li>
              <strong>Uniform indentation and formatting</strong> — even in otherwise inconsistently
              styled files, AI output conforms to the majority style perfectly.
            </li>
            <li>
              <strong>Plausible but hallucinated API calls</strong> — method names that look right
              but don't exist in the pinned library version.
            </li>
          </ul>
        </Section>

        <Section icon={<AlertTriangle className="h-5 w-5" />} title="Security patterns common in AI-generated code">
          <p>
            AI models are trained on the whole of the public internet, including millions of
            examples of unsafe code. Specific patterns to watch for:
          </p>
          <ul>
            <li>SQL queries assembled with string interpolation, even when an ORM is available nearby.</li>
            <li>Hardcoded credentials that were present in the training-data snippet the model imitated.</li>
            <li>Missing CSRF, auth, or rate-limit checks on new endpoints — LLMs write the happy path first.</li>
            <li>Dependency imports from packages that do not exist (hallucinated package names).</li>
            <li>Copies of deprecated cryptographic patterns (MD5 for passwords, ECB block mode).</li>
          </ul>
          <p>
            Decoder's static analysis pass checks all of the above deterministically — no API key
            required, no round-trip to a model.
          </p>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Automated detection with Decoder">
          <p>
            Decoder combines two detection layers that run before any AI call:
          </p>
          <ol>
            <li>
              <strong>Static pattern scan</strong> — 20+ language grammars, covering injection
              patterns, hardcoded secrets, dangerous imports, and known insecure API usage.
            </li>
            <li>
              <strong>Malware / IOC signature pass</strong> — matches against a curated rule set of
              obfuscated payloads, C2 patterns, and anti-analysis tricks that appear in AI-assisted
              supply-chain attacks.
            </li>
          </ol>
          <p>
            These run offline with zero API cost. When you add a BYOK or local-model key, the AI
            explanation layer also highlights <em>why</em> a pattern is suspicious and suggests a
            safe replacement.
          </p>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="Manual review checklist">
          <p>For a quick manual pass on a file you suspect was AI-generated:</p>
          <ul>
            <li>Run the file through a linter with strict security rules enabled.</li>
            <li>Check every imported package against the project's pinned dependency versions.</li>
            <li>Look for test coverage: AI code often has 100% happy-path coverage and 0% error-path coverage.</li>
            <li>Search for the function signatures in the model's known training corpus (GitHub, Stack Overflow).</li>
            <li>Ask the author to explain the three least-obvious lines without looking at the file.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Policy recommendations">
          <p>
            Blocking all AI-generated code is impractical — too much of the modern supply chain is
            AI-assisted. A workable policy:
          </p>
          <ul>
            <li>Require AI-authored PRs to pass the same automated static + malware scan as any other change.</li>
            <li>Flag detected AI patterns for a human security review step, not automatic rejection.</li>
            <li>Log which model generated which commit (Decoder surfaces this in the review metadata).</li>
            <li>Treat AI output the same way you treat third-party dependencies: verify, don't blindly trust.</li>
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
            <li>
              <Link to="/docs/how-to-review-ai-code" className="text-foreground underline">
                How to review AI-generated code — full workflow
              </Link>
            </li>
            <li>
              <Link to="/docs/free-malware-scanner-source-code" className="text-foreground underline">
                Free malware scanner for source code
              </Link>
            </li>
            <li>
              <Link to="/docs/ai-code-review-vs-human" className="text-foreground underline">
                AI code review vs human code review
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
