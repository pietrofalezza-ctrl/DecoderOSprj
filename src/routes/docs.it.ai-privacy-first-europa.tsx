import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Flag, Users, BookOpen, GitCompare } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI privacy-first in Europa — guida 2026 per team di sviluppo";
const DESC =
  "Perché i team europei scelgono BYOK, open source e inferenza locale per il tooling AI. Mappa dell'ecosistema EU (Mistral, Aleph Alpha, Silo AI), criteri di procurement e confronto.";
const URL = "https://decoderead.dev/docs/it/ai-privacy-first-europa";
const EN_URL = "https://decoderead.dev/docs/privacy-first-ai-europe";

const FAQ = [
  { q: "Cosa significa davvero 'AI privacy-first'?", a: "Tre cose: i dati non escono dal perimetro senza decisione esplicita, tu controlli le chiavi, lo strumento è auditabile. BYOK + open source + (opzionale) inferenza locale coprono tutto." },
  { q: "Esistono alternative europee serie a OpenAI e Anthropic?", a: "Sì. Mistral (Francia) per modelli open-weight e hosted. Aleph Alpha (Germania) per deployment sovrani. Silo AI (Finlandia, AMD) per LLM europei. OpenEuroLLM è l'iniziativa multilingue UE." },
  { q: "Hostare un LLM nell'UE basta per essere GDPR-compliant?", a: "Necessario ma non sufficiente. Servono anche base giuridica, DPA col provider, trasparenza verso gli interessati e meccanismo di cancellazione." },
  { q: "Decoder mi lega a un provider?", a: "No. BYOK su OpenAI, Anthropic, Google e OpenRouter, e supporto a Ollama / LM Studio locale. Puoi instradare su Mistral via OpenRouter oggi e cambiare quando vuoi." },
];

export const Route = createFileRoute("/docs/it/ai-privacy-first-europa")({
  head: () => ({
    meta: [
      { title: TITLE }, { name: "description", content: DESC },
      { name: "keywords", content: "ai privacy first europa, ai sovrana, mistral aleph alpha, byok ai europa, gdpr ai tool, ai italia" },
      { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
      { property: "og:type", content: "article" }, { property: "og:url", content: URL }, { property: "og:locale", content: "it_IT" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "it", href: URL },
      { rel: "alternate", hrefLang: "en", href: EN_URL },
      { rel: "alternate", hrefLang: "zh", href: "https://decoderead.dev/docs/zh/privacy-first-ai-europe" },
      { rel: "alternate", hrefLang: "x-default", href: EN_URL },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: URL, mainEntityOfPage: URL, inLanguage: "it", datePublished: "2026-06-29", dateModified: "2026-06-29", author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" }, publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" } }) },
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) },
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
      <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:marker:text-muted-foreground">{children}</div>
    </section>
  );
}

function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur">
        <Link to="/" aria-label="Decoder"><Logo /></Link>
        <div className="flex items-center gap-1"><ThemeToggle /><LangSwitcher /><PublicHeaderAuthSlot ctaLabelKey="landing.ctaSignIn" showArrow={false} /></div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Torna alla documentazione</Link>
        <div className="mt-6 flex gap-2 text-xs">
          <Link to="/docs/privacy-first-ai-europe" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">EN</Link>
          <Link to="/docs/it/ai-privacy-first-europa" className="rounded border border-border bg-card px-2 py-1 text-foreground">IT</Link>
          <Link to="/docs/zh/privacy-first-ai-europe" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">中文</Link>
        </div>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">AI privacy-first in Europa</h1>
        <p className="mt-4 text-lg text-muted-foreground">I team europei convergono su un playbook condiviso: <strong>BYOK</strong>, <strong>open source</strong> e, per dati sensibili, <strong>inferenza locale</strong>. Questa guida spiega perché, nomina i player europei da conoscere nel 2026 e propone una checklist di procurement.</p>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Cosa significa 'privacy-first' nella pratica">
          <ul>
            <li>Il rapporto col provider del modello sotto il <strong>tuo</strong> contratto (BYOK).</li>
            <li>Prompt e regole del tool <strong>auditabili</strong> (open source).</li>
            <li>Possibilità di girare <strong>offline</strong> end-to-end (Ollama / LM Studio).</li>
            <li>Storage minimizzato e <strong>cifrato a riposo</strong> (AES-256-GCM per le credenziali).</li>
            <li>Il vendor non fa training sui tuoi dati — scritto nel contratto, non solo nel blog.</li>
          </ul>
        </Section>
        <Section icon={<Flag className="h-5 w-5" />} title="L'ecosistema AI europeo da conoscere">
          <ul>
            <li><strong>Mistral</strong> (Parigi) — modelli open-weight e hosted, endpoint UE, raggiungibile via OpenRouter.</li>
            <li><strong>Aleph Alpha</strong> (Heidelberg) — deployment sovrani per PA e industria regolata.</li>
            <li><strong>Silo AI / AMD</strong> (Helsinki) — famiglie Poro e Viking, focus lingue europee.</li>
            <li><strong>OpenEuroLLM</strong> — consorzio UE per LLM multilingue open.</li>
            <li><strong>LightOn</strong> (Francia) — RAG enterprise e on-premise.</li>
            <li><strong>Hugging Face</strong> — hub modelli/dataset, Inference Endpoints hostati in UE.</li>
          </ul>
          <p>Decoder lavora con tutti via BYOK attraverso OpenRouter o l'endpoint diretto.</p>
        </Section>
        <Section icon={<GitCompare className="h-5 w-5" />} title="SaaS AI vs stack privacy-first">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground"><tr><th className="px-3 py-2 text-left font-medium">&nbsp;</th><th className="px-3 py-2 text-left font-medium">SaaS AI tipica</th><th className="px-3 py-2 text-left font-medium">Decoder (BYOK)</th><th className="px-3 py-2 text-left font-medium">Decoder (locale)</th></tr></thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr><td className="text-foreground">Chi detiene la chiave</td><td>Vendor</td><td>Tu</td><td>N/A</td></tr>
                <tr><td className="text-foreground">Dove gira l'inferenza</td><td>Cloud vendor</td><td>Provider scelto da te</td><td>La tua macchina</td></tr>
                <tr><td className="text-foreground">Sub-processor</td><td>Molti</td><td>Uno (Decoder)</td><td>Zero</td></tr>
                <tr><td className="text-foreground">Training sui tuoi dati</td><td>Dipende dal piano</td><td>No</td><td>No</td></tr>
                <tr><td className="text-foreground">Codice disponibile</td><td>Raramente</td><td>MIT</td><td>MIT</td></tr>
              </tbody>
            </table>
          </div>
        </Section>
        <Section icon={<Users className="h-5 w-5" />} title="Checklist di procurement">
          <ul>
            <li>BYOK supportato senza costi aggiuntivi?</li>
            <li>Open source con licenza permissiva (MIT / Apache 2.0)?</li>
            <li>Credenziali cifrate a riposo, algoritmo documentato?</li>
            <li>Niente training sui dati cliente, per iscritto?</li>
            <li>Inferenza UE-hosted o percorso local-inference?</li>
            <li>DPA disponibile, lista sub-processor pubblica?</li>
            <li>Prompt e regole auditabili?</li>
          </ul>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="Domande frequenti">
          <dl className="space-y-4">{FAQ.map(f => (<div key={f.q}><dt className="font-medium text-foreground">{f.q}</dt><dd className="mt-1">{f.a}</dd></div>))}</dl>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="Guide correlate">
          <ul>
            <li><Link to="/docs/it/eu-ai-act-analisi-codice" className="text-foreground underline">EU AI Act e analisi del codice</Link></li>
            <li><Link to="/docs/it/gdpr-revisione-codice-ai" className="text-foreground underline">GDPR e AI code review</Link></li>
            <li><Link to="/docs/ai-code-review-milano-nord-italia" className="text-foreground underline">AI code review a Milano e Nord Italia</Link></li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">Decoder — open-source code understanding for the AI era.</footer>
    </div>
  );
}
