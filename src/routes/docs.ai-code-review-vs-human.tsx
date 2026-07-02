import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, GitCompare, ShieldCheck, Cpu, BookOpen, Users, Zap } from "lucide-react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI code review vs human code review — honest comparison";
const DESC =
  "AI code review catches consistent patterns fast; humans catch intent bugs and design flaws. Here is when to use each and how to combine them.";
const URL = "https://decoderead.dev/docs/ai-code-review-vs-human";

const FAQ = [
  {
    q: "Is AI code review better than human code review?",
    a: "Neither is strictly better — they catch different failure modes. AI is consistent and tireless on known patterns; humans catch intent bugs, design flaws, and context problems that require business knowledge.",
  },
  {
    q: "Can AI code review replace a human reviewer?",
    a: "For large codebases and routine diffs, AI handles the mechanical checks (style, security patterns, obvious bugs) faster than humans. For architectural decisions or subtle logic, human review remains essential.",
  },
  {
    q: "What does AI code review miss that humans catch?",
    a: "AI misses requirement mismatches (code is correct but solves the wrong problem), team-context decisions, subtle race conditions that require understanding the whole system, and any pattern not in its training data.",
  },
  {
    q: "What does AI code review catch that humans often miss?",
    a: "Known injection patterns, hardcoded secrets, deprecated API usage, license issues, and style inconsistencies — especially in late-night reviews when human attention degrades.",
  },
  {
    q: "How should teams combine AI and human code review?",
    a: "Run AI first as a pre-filter: it flags obvious issues so human reviewers can spend their attention on design and intent. Treat AI findings as a first-pass checklist, not a final verdict.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-vs-human")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "ai code review vs human code review, ai vs human review, automated code review, human code review, code review comparison",
      },
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
            {
              "@type": "ListItem",
              position: 3,
              name: "AI code review vs human code review",
              item: URL,
            },
          ],
        }),
      },
    ],
  }),
  component: AIvsHumanPage,
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

function AIvsHumanPage() {
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
          AI code review vs human code review
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The debate around <strong>AI code review vs human code review</strong> often frames them
          as competitors. In practice, they catch different classes of problem. Understanding the
          split helps teams deploy both where each is strongest — and avoid paying human attention
          for what a machine handles reliably.
        </p>

        <Section icon={<GitCompare className="h-5 w-5" />} title="Head-to-head comparison">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Dimension</th>
                  <th className="px-3 py-2 text-left font-medium">AI review</th>
                  <th className="px-3 py-2 text-left font-medium">Human review</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr>
                  <td className="text-foreground">Speed</td>
                  <td>Seconds per file</td>
                  <td>Minutes to hours</td>
                </tr>
                <tr>
                  <td className="text-foreground">Consistency</td>
                  <td>Never tired, never biased by time-of-day</td>
                  <td>Degrades with fatigue</td>
                </tr>
                <tr>
                  <td className="text-foreground">Known security patterns</td>
                  <td>Strong — catches every instance</td>
                  <td>Misses ~30% in studies</td>
                </tr>
                <tr>
                  <td className="text-foreground">Intent / requirement bugs</td>
                  <td>Weak — needs business context</td>
                  <td>Strong</td>
                </tr>
                <tr>
                  <td className="text-foreground">Architectural judgement</td>
                  <td>Weak</td>
                  <td>Strong</td>
                </tr>
                <tr>
                  <td className="text-foreground">Novel / zero-day patterns</td>
                  <td>Weak</td>
                  <td>Depends on reviewer</td>
                </tr>
                <tr>
                  <td className="text-foreground">Cost per review</td>
                  <td>Cents (BYOK) or free (local)</td>
                  <td>Engineer time</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<Zap className="h-5 w-5" />} title="Where AI review wins">
          <ul>
            <li>
              <strong>Volume.</strong> A 500-file diff reviewed by a human takes days; AI surfaces
              the 20 files that matter in seconds.
            </li>
            <li>
              <strong>Known patterns.</strong> SQL injection, hardcoded secrets, deprecated APIs —
              deterministic rules catch these with 100% recall on exact matches.
            </li>
            <li>
              <strong>Overnight or weekend PRs.</strong> AI never gets tired, never gives a LGTM
              because it's 5 PM on Friday.
            </li>
            <li>
              <strong>Consistency across reviewers.</strong> AI applies the same bar to junior and
              senior contributors alike.
            </li>
            <li>
              <strong>Supply-chain PRs.</strong> Malware IOC scanning of dependency updates is
              impractical for humans at scale.
            </li>
          </ul>
        </Section>

        <Section icon={<Users className="h-5 w-5" />} title="Where human review wins">
          <ul>
            <li>
              <strong>Requirement mismatches.</strong> Code that is technically correct but solves
              the wrong problem requires knowing what the right problem is — business context AI
              doesn't have.
            </li>
            <li>
              <strong>Design decisions.</strong> Should this be a separate service? Is this
              abstraction the right one? Humans with system context answer better.
            </li>
            <li>
              <strong>Subtle race conditions and distributed systems bugs.</strong> Require
              reasoning about global state that AI handles poorly.
            </li>
            <li>
              <strong>Team conventions.</strong> "We never do X in this codebase" is institutional
              knowledge not in any training set.
            </li>
            <li>
              <strong>Novel attack patterns.</strong> A zero-day technique not yet in the rules or
              training data needs a security-aware human.
            </li>
          </ul>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="The recommended split: AI as pre-filter">
          <p>
            The most effective pattern is <em>AI first, human second</em>:
          </p>
          <ol>
            <li>AI runs the static + malware pass and flags known-bad patterns. Takes seconds.</li>
            <li>
              AI explains each finding and suggests fixes. Human author addresses them before
              requesting review.
            </li>
            <li>
              Human reviewer focuses on intent, design, and team-specific concerns — the things AI
              can't check.
            </li>
            <li>Human review time drops because the mechanical checklist is already done.</li>
          </ol>
          <p>
            Decoder is designed around this flow: the static and malware pass require no key, the AI
            explanation layer activates with BYOK or a local model, and the chat tab lets the human
            reviewer ask the model follow-up questions mid-review.
          </p>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Privacy in AI code review">
          <p>
            One concern teams raise is that AI review sends code to a third party. With Decoder's
            BYOK model, code goes to the provider you already audited. With a local Ollama model,
            nothing leaves the machine — giving you AI-speed review without the privacy trade-off.
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
              <Link to="/docs/how-to-review-ai-code" className="text-foreground underline">
                How to review AI-generated code
              </Link>
            </li>
            <li>
              <Link to="/docs/detect-ai-generated-code" className="text-foreground underline">
                How to detect AI-generated code
              </Link>
            </li>
            <li>
              <Link to="/docs/comparison-coderabbit" className="text-foreground underline">
                Decoder vs CodeRabbit vs Greptile
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
