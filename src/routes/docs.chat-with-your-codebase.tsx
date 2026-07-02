import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageSquare, KeyRound, Cpu, ShieldCheck, BookOpen, GitCompare } from "lucide-react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "Chat with your codebase using AI — BYOK & local models";
const DESC =
  "Chat with your codebase using BYOK (OpenAI, Anthropic, OpenRouter) or a fully local model. No data leaves your machine with Ollama or LM Studio.";
const URL = "https://decoderead.dev/docs/chat-with-your-codebase";

const FAQ = [
  { q: "Can I chat with my codebase without sending code to OpenAI?", a: "Yes. Decoder supports Ollama and LM Studio as local endpoints. Chunking, prompting, and chat all run on your machine — no bytes leave the network." },
  { q: "What BYOK providers does codebase chat support?", a: "OpenAI, Anthropic, Google Gemini, and OpenRouter for cloud models. Keys are encrypted AES-256-GCM at rest and scoped to your account only." },
  { q: "How much context can Decoder send in a codebase chat?", a: "Decoder chunks files and sends relevant chunks per turn. For large codebases, upload a ZIP and the relevant files are retrieved per query." },
  { q: "Is codebase chat useful without an API key?", a: "The static and malware scan always run. Chat requires a model — either a BYOK key or a local Ollama/LM Studio endpoint." },
  { q: "Which local model works best for codebase chat?", a: "Qwen2.5-Coder 14B or 32B gives the best results on consumer hardware. Llama 3.1 8B is a good starting point for machines with less VRAM." },
];

export const Route = createFileRoute("/docs/chat-with-your-codebase")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "chat with your codebase, ai codebase chat, byok codebase chat, local llm codebase, ollama codebase chat" },
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
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://decoderead.dev/" }, { "@type": "ListItem", position: 2, name: "Docs", item: "https://decoderead.dev/docs" }, { "@type": "ListItem", position: 3, name: "Chat with your codebase", item: URL }] }) },
    ],
  }),
  component: ChatCodebasePage,
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

function ChatCodebasePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur">
        <Link to="/" aria-label="Decoder"><Logo /></Link>
        <div className="flex items-center gap-1"><ThemeToggle /><LangSwitcher /><PublicHeaderAuthSlot ctaLabelKey="landing.ctaSignIn" showArrow={false} /></div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Back to docs</Link>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">Chat with your codebase using AI</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          <strong>Chat with your codebase using AI</strong> is one of the highest-leverage things a
          developer can do — asking "why does this function exist?" or "what breaks if I change this
          interface?" in plain language. Decoder makes it possible with your own API key or a fully
          local model, so your code never reaches a vendor you didn't choose.
        </p>

        <Section icon={<MessageSquare className="h-5 w-5" />} title="What codebase chat unlocks">
          <ul>
            <li><strong>Instant orientation</strong> — drop into an unfamiliar repo and ask the model to explain the architecture before reading a single file.</li>
            <li><strong>Targeted security questions</strong> — "does this module validate user input before the DB call?" is faster than tracing the call graph manually.</li>
            <li><strong>Refactor planning</strong> — ask the model what else would break if you changed a shared interface, getting a checklist before you write a line.</li>
            <li><strong>Finding logic duplication</strong> — "does this utility already exist somewhere in the codebase?" saves hours on large repos.</li>
          </ul>
        </Section>

        <Section icon={<KeyRound className="h-5 w-5" />} title="BYOK: your key, your provider">
          <p>
            Decoder uses a bring-your-own-key model for codebase chat. Paste an OpenAI, Anthropic,
            Google Gemini, or OpenRouter key and every chat turn goes directly from your browser to
            that provider on your account — metered, at list price, with no intermediate vendor
            seeing your code. Key storage is AES-256-GCM encrypted at rest, row-level-security
            scoped to your user.
          </p>
          <p>Typical cost for a session of 20 chat turns on a 1,000-line file: under $0.05 on GPT-4o-mini or Claude Haiku.</p>
        </Section>

        <Section icon={<Cpu className="h-5 w-5" />} title="Fully local chat with Ollama or LM Studio">
          <p>
            For regulated code or IP-sensitive work, add an Ollama or LM Studio endpoint in
            Settings → Credentials. From that point every chat turn — chunking, embedding, generation
            — runs on your hardware. Zero bytes leave the machine.
          </p>
          <ul>
            <li><strong>Qwen2.5-Coder 14B / 32B</strong> — best quality-per-VRAM ratio for code-specific chat.</li>
            <li><strong>Llama 3.1 8B Instruct</strong> — fast, fits on M-series Macs (16 GB unified memory).</li>
            <li><strong>DeepSeek-Coder-V2-Lite</strong> — strong reasoning at a smaller footprint.</li>
          </ul>
        </Section>

        <Section icon={<GitCompare className="h-5 w-5" />} title="BYOK chat vs managed codebase tools">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr><th className="px-3 py-2 text-left font-medium">&nbsp;</th><th className="px-3 py-2 text-left font-medium">Decoder</th><th className="px-3 py-2 text-left font-medium">Cursor / GitHub Copilot Chat</th></tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr><td className="text-foreground">Model choice</td><td>Any (BYOK or local)</td><td>Vendor-selected</td></tr>
                <tr><td className="text-foreground">Code leaves machine</td><td>Only if you choose cloud key</td><td>Always</td></tr>
                <tr><td className="text-foreground">Offline / air-gapped</td><td>Yes (local model)</td><td>No</td></tr>
                <tr><td className="text-foreground">Static + malware pre-check</td><td>Built-in</td><td>No</td></tr>
                <tr><td className="text-foreground">Pricing</td><td>Metered BYOK spend</td><td>Per-seat subscription</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Security of codebase chat">
          <p>
            Before any chat turn, Decoder runs the static and malware pass on the uploaded file.
            This means the model is never the first thing to see potentially malicious code — the
            deterministic scanner surfaces IOC matches first, so you can decide whether to involve
            a cloud model at all.
          </p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Frequently asked questions">
          <dl className="space-y-4">{FAQ.map((f) => (<div key={f.q}><dt className="font-medium text-foreground">{f.q}</dt><dd className="mt-1">{f.a}</dd></div>))}</dl>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Related guides">
          <ul>
            <li><Link to="/docs/ai-code-review-tools-byok" className="text-foreground underline">AI code review tools with BYOK</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">Open-source AI code review with local inference</Link></li>
            <li><Link to="/docs/secure-code-review-byok" className="text-foreground underline">Secure code review with BYOK and local models</Link></li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">Decoder — open-source code understanding for the AI era.
        <div className="mt-2"><InstagramLink /></div></footer>
    </div>
  );
}
