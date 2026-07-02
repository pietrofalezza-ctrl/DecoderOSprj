import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, ShieldCheck, BookOpen, Coins, Building2 } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI code review in India — BYOK, open-source and low-cost";
const DESC =
  "AI code analysis for Indian developers and software teams. BYOK means zero platform fees — pay only your own model usage. Free static and malware scans, no API key required. Aligned with the DPDP Act 2023.";
const URL = "https://decoderead.dev/docs/ai-code-review-india";

const FAQ = [
  {
    q: "Is Decoder free for developers in India?",
    a: "Yes. Static analysis, malware scanning and AI-origin detection are free with no API key. AI explanations and repo chat use your own OpenAI / Anthropic / Gemini / OpenRouter key (BYOK) or a local Ollama / LM Studio endpoint — you pay only for your own model calls, not a per-seat SaaS subscription.",
  },
  {
    q: "Does Decoder support DPDP Act 2023 compliance?",
    a: "Decoder minimises data movement by design: BYOK keeps your credentials in your account, uploads are processed ephemerally, and local inference means your source never leaves the developer's machine. That aligns with the data-minimisation principle in India's Digital Personal Data Protection Act. This is not legal advice.",
  },
  {
    q: "Can outsourcing agencies use Decoder to audit vendor code?",
    a: "Yes — a common use case. Run static + malware + AI-origin analysis on deliverables from external vendors to catch quality, security and IP-hygiene issues before signing off.",
  },
  {
    q: "Which cities are your users in?",
    a: "Bangalore, Hyderabad, Chennai, Pune, Delhi NCR, Mumbai and Kochi are the largest clusters. Decoder is a web app plus optional local install — works from anywhere in India with a browser.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-india")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "ai code review india, ai code analysis india, byok code review, dpdp act, open source code review india, bangalore ai tools" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "en_IN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "en", href: URL },
      { rel: "alternate", hrefLang: "en-IN", href: URL },
      { rel: "alternate", hrefLang: "hi", href: "https://decoderead.dev/docs/hi/ai-code-review-bharat" },
      { rel: "alternate", hrefLang: "ta", href: "https://decoderead.dev/docs/ta/ai-code-review-chennai" },
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
          datePublished: "2026-07-02",
          dateModified: "2026-07-02",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          about: ["AI code review", "India", "DPDP Act", "BYOK", "Open source"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Decoder",
          url: "https://decoderead.dev",
          areaServed: [
            { "@type": "Country", name: "India" },
            { "@type": "City", name: "Bangalore" },
            { "@type": "City", name: "Hyderabad" },
            { "@type": "City", name: "Chennai" },
            { "@type": "City", name: "Pune" },
            { "@type": "City", name: "Mumbai" },
            { "@type": "City", name: "Delhi" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
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
          <ArrowLeft className="h-3 w-3" /> Back to documentation
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          AI code review in India
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Indian developers ship huge volumes of AI-generated code every day — from Bangalore product teams to Chennai
          service providers to Hyderabad enterprise SaaS. Decoder is an <strong>open-source (MIT)</strong>,
          <strong> BYOK</strong> code-analysis tool built for teams that need real AI review without a per-seat SaaS bill
          or a foreign vendor holding their source.
        </p>

        <Section icon={<Coins className="h-5 w-5" />} title="Why BYOK matters for Indian teams">
          <p>
            Global AI-review SaaS products charge $15–$50 per developer per month in USD. For a 20-person team that is
            &#8377;3–10 lakh a year before you have shipped a single review. With Decoder there is no per-seat fee. You
            connect your own OpenAI, Anthropic, Gemini or OpenRouter key and pay only the model usage — which for most
            teams lands at a small fraction of the SaaS price. Or run it fully local with Ollama and pay zero.
          </p>
          <ul>
            <li><strong>Static code analysis</strong> — free, no key, 20+ languages.</li>
            <li><strong>Malware / secret scanning</strong> — free, no key.</li>
            <li><strong>AI-origin detector</strong> — free, no key. Flags Copilot / Cursor / Claude patterns.</li>
            <li><strong>AI explanations &amp; repo chat</strong> — BYOK or local model.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="DPDP Act 2023 alignment">
          <p>
            India's Digital Personal Data Protection Act came into force in 2023 with data-minimisation and purpose-limitation
            duties for anyone processing personal data. Decoder helps by keeping source-code movement to the minimum:
          </p>
          <ul>
            <li><strong>BYOK</strong> — model credentials stay in your account, encrypted at rest (AES-256-GCM).</li>
            <li><strong>Ephemeral uploads</strong> — ZIPs are processed and discarded, not indexed for training.</li>
            <li><strong>Local inference</strong> — with Ollama or LM Studio, no source ever leaves the developer's machine.</li>
          </ul>
          <p>Not legal advice — consult your DPO for a formal DPIA.</p>
        </Section>

        <Section icon={<Building2 className="h-5 w-5" />} title="Common use cases in India">
          <ul>
            <li><strong>Product startups (Bangalore, Pune)</strong> — cheap AI review during rapid iteration, without locking into a vendor.</li>
            <li><strong>Service providers &amp; agencies (Chennai, Hyderabad, Noida)</strong> — audit AI-generated code from junior devs and offshore contributors before delivery.</li>
            <li><strong>Enterprise SaaS (Mumbai, Delhi NCR)</strong> — DPDP-aligned analysis with local models for regulated verticals (fintech, health).</li>
            <li><strong>Educational institutions</strong> — teach students to read and critique AI code, not just accept it.</li>
          </ul>
        </Section>

        <Section icon={<MapPin className="h-5 w-5" />} title="Regional guides">
          <ul>
            <li><Link to="/docs/ai-code-review-bangalore" className="text-foreground underline">Bangalore — Bengaluru IT hub</Link></li>
            <li><Link to="/docs/ai-code-review-hyderabad-chennai" className="text-foreground underline">Hyderabad &amp; Chennai — Southern IT corridors</Link></li>
            <li><Link to="/docs/ai-code-review-sri-lanka-colombo" className="text-foreground underline">Sri Lanka &amp; Colombo</Link></li>
            <li><Link to="/docs/ai-code-review-outsourcing" className="text-foreground underline">Auditing outsourced AI-generated code</Link></li>
            <li><Link to="/docs/dpdp-act-ai-code-analysis" className="text-foreground underline">DPDP Act &amp; AI code analysis</Link></li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="FAQ">
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      </footer>
    </div>
  );
}
