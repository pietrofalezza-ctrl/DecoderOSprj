import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Building2, ShieldCheck, BookOpen, Factory } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "AI code review a Milano, Verona e nel Nord Italia — strumenti privacy-first";
const DESC =
  "Strumenti di AI code review e analisi del codice per team di sviluppo a Milano, Verona, Padova, Bologna e Torino. BYOK, GDPR, EU AI Act e local inference per fintech e manifatturiero 4.0.";
const URL = "https://decoderead.dev/docs/ai-code-review-milano-nord-italia";

const FAQ = [
  {
    q: "Perché un team a Milano dovrebbe scegliere uno strumento BYOK?",
    a: "Perché il rapporto con il provider del modello resta sotto il contratto del team. Il tool diventa un thin client e l'audit interno deve valutare un solo nuovo sub-processor invece dell'intera supply chain del modello.",
  },
  {
    q: "Decoder è conforme al GDPR per aziende italiane?",
    a: "Sì. Le credenziali BYOK sono cifrate a riposo con AES-256-GCM, gli upload ZIP vengono processati in modo effimero e cancellati, e con l'inferenza locale (Ollama / LM Studio) nessun byte lascia la macchina dello sviluppatore.",
  },
  {
    q: "Posso usarlo per progetti del manifatturiero 4.0 in Veneto o Emilia?",
    a: "Sì. Per codice industriale (PLC, SCADA, edge) la configurazione local-inference è la più adatta: zero egress, nessun DPA da negoziare, nessuna esposizione di IP industriale a terzi.",
  },
  {
    q: "Quanto costa per una piccola software house?",
    a: "Decoder è MIT, open source e gratuito. I costi sono solo quelli del modello che scegli (OpenAI, Anthropic, Google, OpenRouter) sul tuo account, oppure zero con l'inferenza locale.",
  },
];

export const Route = createFileRoute("/docs/ai-code-review-milano-nord-italia")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "ai code review milano, analisi codice ai italia, strumenti ai sviluppatori verona, gdpr ai italia, code review nord italia, ai act italia" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "it_IT" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "it", href: URL },
      { rel: "alternate", hrefLang: "en", href: "https://decoderead.dev/docs/en/ai-code-review-milan-northern-italy" },
      { rel: "alternate", hrefLang: "zh", href: "https://decoderead.dev/docs/zh/ai-code-review-milan-northern-italy" },
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
          inLanguage: "it",
          datePublished: "2026-06-29",
          dateModified: "2026-06-29",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          about: ["AI code review", "Milano", "Nord Italia", "GDPR", "EU AI Act"],
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
            { "@type": "City", name: "Milano" },
            { "@type": "City", name: "Verona" },
            { "@type": "City", name: "Padova" },
            { "@type": "City", name: "Bologna" },
            { "@type": "City", name: "Torino" },
            { "@type": "AdministrativeArea", name: "Lombardia" },
            { "@type": "AdministrativeArea", name: "Veneto" },
            { "@type": "AdministrativeArea", name: "Emilia-Romagna" },
            { "@type": "AdministrativeArea", name: "Piemonte" },
            { "@type": "Country", name: "Italia" },
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
          <ArrowLeft className="h-3 w-3" /> Torna alla documentazione
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          AI code review a Milano e nel Nord Italia
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Da Milano a Verona, da Padova a Bologna e Torino, i team di sviluppo del Nord Italia stanno adottando l'AI nel ciclo di code review più
          rapidamente che in molte altre aree europee. Decoder è uno strumento <strong>open source</strong>, <strong>BYOK</strong> e compatibile con
          <strong> inferenza locale</strong>, pensato per chi deve rispettare GDPR e EU AI Act senza rinunciare alla velocità.
        </p>

        <Section icon={<MapPin className="h-5 w-5" />} title="Hub tecnologici del Nord Italia">
          <ul>
            <li><strong>Milano</strong> — capitale italiana del fintech, software enterprise e SaaS B2B (Talent Garden, MIND, Politecnico).</li>
            <li><strong>Verona &amp; Padova</strong> — manifatturiero 4.0, automazione industriale, supply chain.</li>
            <li><strong>Bologna &amp; Modena</strong> — packaging, automotive, big data (Tecnopolo, Data Valley).</li>
            <li><strong>Torino</strong> — automotive, mobilità intelligente, aerospazio.</li>
            <li><strong>Trento &amp; Trieste</strong> — ricerca, AI accademica, startup deep-tech.</li>
          </ul>
        </Section>

        <Section icon={<Building2 className="h-5 w-5" />} title="Perché il Nord Italia ha bisogno di AI privacy-first">
          <p>
            Le software house lombarde lavorano spesso per banche e assicurazioni, con clausole IP e DPA stringenti. I team veneti ed emiliani toccano
            codice industriale che non può uscire dal perimetro aziendale. In entrambi i casi una SaaS chiusa che invia codice a un provider non
            europeo è un problema contrattuale prima ancora che tecnico. <strong>BYOK e inferenza locale</strong> risolvono il problema all'origine.
          </p>
        </Section>

        <Section icon={<Factory className="h-5 w-5" />} title="Casi d'uso tipici">
          <ul>
            <li><strong>Fintech Milano</strong> — review di microservizi Java/Kotlin con BYOK su Anthropic, log d'analisi conservati internamente.</li>
            <li><strong>Manifatturiero Veneto</strong> — analisi statica di firmware C/C++ in modalità completamente offline con Ollama.</li>
            <li><strong>Automotive Torino</strong> — audit di codice Python ML con Mistral via OpenRouter, sotto contratto europeo.</li>
            <li><strong>Software house Bologna</strong> — onboarding di nuovi sviluppatori con "Spiega questo file" su modelli locali.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Conformità EU AI Act e GDPR">
          <p>
            Decoder è progettato per minimizzare gli obblighi: nessun training sul tuo codice, credenziali cifrate AES-256-GCM, upload ZIP effimeri e
            possibilità di inferenza locale. Per la documentazione completa vedi le guide
            <Link to="/docs/eu-ai-act-code-analysis" className="text-foreground underline"> EU AI Act</Link> e
            <Link to="/docs/gdpr-ai-code-review" className="text-foreground underline"> GDPR</Link>.
          </p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Domande frequenti">
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="Guide correlate">
          <ul>
            <li><Link to="/docs/eu-ai-act-code-analysis" className="text-foreground underline">EU AI Act e analisi del codice</Link></li>
            <li><Link to="/docs/gdpr-ai-code-review" className="text-foreground underline">GDPR e AI code review</Link></li>
            <li><Link to="/docs/privacy-first-ai-europe" className="text-foreground underline">AI privacy-first in Europa</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">Open-source AI code review</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
      
        <div className="mt-2"><InstagramLink /></div></footer>
    </div>
  );
}
