import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Search, BookOpen, Cpu, Terminal, GitCompare } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Static code analysis without an API key — Decoder";
const DESC =
  "Run static code analysis and malware scanning without an API key. Decoder's offline-first scan covers 20+ languages and needs no cloud credentials.";
const URL = "https://decoderead.dev/docs/static-code-analysis-no-api-key";

const FAQ = [
  {
    q: "Can you run static code analysis without an API key?",
    a: "Yes. Decoder's static scan and malware pass run entirely offline — no API key, no network connection needed. The AI explanation layer is optional and additive.",
  },
  {
    q: "Which languages does the keyless static scan support?",
    a: "JavaScript, TypeScript, Python, Go, Rust, Java, Kotlin, C, C++, C#, Ruby, PHP, Swift, Scala, Bash, PowerShell, SQL, YAML, Dockerfile, and more.",
  },
  {
    q: "What does the static scan check without an API key?",
    a: "Injection patterns (SQL, command, path traversal), hardcoded credentials, dangerous imports, insecure cryptography, prototype pollution, deserialization sinks, and more.",
  },
  {
    q: "Is keyless static analysis useful on its own without AI?",
    a: "For most security-critical checks, yes. Deterministic rules catch known-bad patterns with zero false-negative rate on exact matches. AI adds explanation and context but doesn't replace the deterministic pass.",
  },
  {
    q: "How is this different from SonarQube or Semgrep?",
    a: "Decoder's static pass is lighter-weight and browser-based — no server install, no CI plugin required for a one-off scan. It also chains directly into AI explanation for the findings it surfaces.",
  },
];

export const Route = createFileRoute("/docs/static-code-analysis-no-api-key")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "static code analysis no api key, offline static analysis, free static code scanner, no account code analysis, keyless code review" },
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
            { "@type": "ListItem", position: 3, name: "Static code analysis without API key", item: URL },
          ],
        }),
      },
    ],
  }),
  component: StaticAnalysisPage,
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

function StaticAnalysisPage() {
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
          Static code analysis without an API key
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Most AI-powered code tools are gated behind an account and an API key before they show
          you anything useful. Decoder flips that: <strong>static code analysis without an API key</strong>{" "}
          is the default. Upload a file, get a full security and quality scan immediately — add a
          key later if you want the AI explanation layer on top.
        </p>

        <Section icon={<Search className="h-5 w-5" />} title="What runs with zero credentials">
          <p>
            The keyless pass covers two independent engines:
          </p>
          <ul>
            <li>
              <strong>Static pattern scan</strong> — deterministic rules across 20+ languages
              checking injection sinks, hardcoded secrets, dangerous function calls, insecure
              crypto, and known anti-patterns.
            </li>
            <li>
              <strong>Malware / IOC pass</strong> — signature matching against obfuscated payloads,
              C2 patterns, and known ransomware artefacts (including LockBit 3.0 IOCs).
            </li>
          </ul>
          <p>
            Both engines run in the browser / server-side without phoning home. No data leaves
            your machine during this step.
          </p>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Static code analysis without API key — coverage">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Check category</th>
                  <th className="px-3 py-2 text-left font-medium">No key (free)</th>
                  <th className="px-3 py-2 text-left font-medium">With AI key</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr><td className="text-foreground">SQL / command injection</td><td>✓ deterministic</td><td>+ explanation</td></tr>
                <tr><td className="text-foreground">Hardcoded secrets</td><td>✓ deterministic</td><td>+ remediation advice</td></tr>
                <tr><td className="text-foreground">Insecure crypto</td><td>✓ deterministic</td><td>+ safe alternative</td></tr>
                <tr><td className="text-foreground">Malware / IOC match</td><td>✓ deterministic</td><td>+ payload analysis</td></tr>
                <tr><td className="text-foreground">Logic / design review</td><td>—</td><td>✓ AI-only</td></tr>
                <tr><td className="text-foreground">Chatting about findings</td><td>—</td><td>✓ AI-only</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<Terminal className="h-5 w-5" />} title="Running the scan">
          <ol>
            <li>Upload a single file or a ZIP archive from the dashboard. No sign-in required for a trial.</li>
            <li>The <strong>Static</strong> and <strong>Malware</strong> tabs populate immediately.</li>
            <li>Each finding links to the exact line, shows the rule that fired, and gives a severity level.</li>
            <li>Optionally: add a BYOK or local-model key to unlock the <strong>Explain with AI</strong> panel for each finding.</li>
          </ol>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Why deterministic first?">
          <p>
            LLMs are powerful but non-deterministic — they can miss a known injection pattern 10%
            of the time and explain an imaginary vulnerability the other 10%. Deterministic rules
            don't hallucinate. For a known-bad pattern like <code>eval(req.body)</code> or
            <code>md5(password)</code>, a rule fires every time or never.
          </p>
          <p>
            Decoder's architecture runs the deterministic pass first, uses the findings as
            <em>grounding context</em> for the AI call, and prevents the model from contradicting
            a deterministic result. This is why BYOK adds explanation value without compromising
            the correctness of the base scan.
          </p>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="Comparing to SonarQube / Semgrep">
          <p>
            SonarQube and Semgrep are excellent enterprise tools but require server installs, CI
            plugins, or a SaaS account before you scan a single file. Decoder's keyless scan is
            aimed at a different workflow: <em>quick, browser-based, zero-setup</em> analysis of
            any file or zip without provisioning infrastructure.
          </p>
          <p>
            For teams that already run Semgrep in CI, Decoder serves a complementary role: the
            malware/IOC layer, the AI explanation, and the chat interface are not things Semgrep
            provides out of the box.
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
              <Link to="/docs/free-malware-scanner-source-code" className="text-foreground underline">
                Free malware scanner for source code
              </Link>
            </li>
            <li>
              <Link to="/docs/ai-code-review-tools-byok" className="text-foreground underline">
                AI code review tools with BYOK
              </Link>
            </li>
            <li>
              <Link to="/docs/open-source-ai-code-review" className="text-foreground underline">
                Open-source AI code review with local inference
              </Link>
            </li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
