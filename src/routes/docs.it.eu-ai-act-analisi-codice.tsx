import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Scale, ShieldCheck, ClipboardCheck, BookOpen, AlertTriangle } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "EU AI Act e analisi del codice con AI — guida per team di sviluppo";
const DESC =
  "Come si applica l'EU AI Act agli strumenti di code review e analisi del codice basati su AI. Livelli di rischio, GPAI, obblighi di trasparenza e checklist pratica per i team europei.";
const URL = "https://decoderead.dev/docs/it/eu-ai-act-analisi-codice";
const EN_URL = "https://decoderead.dev/docs/eu-ai-act-code-analysis";

const FAQ = [
  { q: "L'EU AI Act si applica agli strumenti di AI code review?", a: "Sì, quando vengono usati nell'UE. La maggior parte ricade nelle disposizioni GPAI perché incapsula un foundation model. Gli obblighi riguardano trasparenza, documentazione tecnica, policy sul copyright e informazione agli utenti." },
  { q: "L'analisi del codice è ad alto rischio?", a: "No per default: la revisione di codice non è in Allegato III. Diventa alto rischio solo quando l'output decide outcome in settori regolamentati (infrastrutture critiche, lavoro, servizi essenziali)." },
  { q: "Cosa cambia per i provider GPAI nel 2025–2026?", a: "Devono pubblicare model card, sintesi dei dati di training e policy UE sul copyright. I deployer downstream (il tuo team) ereditano obblighi di trasparenza e human-in-the-loop." },
  { q: "BYOK aiuta con la compliance?", a: "Sì. Il rapporto con il provider del modello resta sotto il tuo DPA. Lo strumento diventa thin client e puoi cambiare provider senza rifare i contratti." },
];

export const Route = createFileRoute("/docs/it/eu-ai-act-analisi-codice")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "eu ai act italia, ai act analisi codice, gpai italia, compliance ai sviluppatori, ai act milano" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "it_IT" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "it", href: URL },
      { rel: "alternate", hrefLang: "en", href: EN_URL },
      { rel: "alternate", hrefLang: "zh", href: "https://decoderead.dev/docs/zh/eu-ai-act-code-analysis" },
      { rel: "alternate", hrefLang: "x-default", href: EN_URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: URL,
          mainEntityOfPage: URL, inLanguage: "it", datePublished: "2026-06-29", dateModified: "2026-06-29",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
        }),
      },
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
          <Link to="/docs/eu-ai-act-code-analysis" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">EN</Link>
          <Link to="/docs/it/eu-ai-act-analisi-codice" className="rounded border border-border bg-card px-2 py-1 text-foreground">IT</Link>
          <Link to="/docs/zh/eu-ai-act-code-analysis" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">中文</Link>
        </div>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">EU AI Act e analisi del codice</h1>
        <p className="mt-4 text-lg text-muted-foreground">L'EU AI Act è entrato in vigore nell'agosto 2024 e si applica per fasi fino al 2026–2027. Se sviluppi software in Europa e usi AI per leggere, revisionare o generare codice, ecco la versione pratica di cosa cambia per il tuo team e perché un tool <strong>privacy-first, BYOK</strong> come Decoder si adatta al nuovo regime.</p>

        <Section icon={<Scale className="h-5 w-5" />} title="Dove si colloca l'AI code review nella piramide dei rischi">
          <p>L'Act prevede quattro livelli: <strong>inaccettabile</strong>, <strong>alto rischio</strong>, <strong>rischio limitato</strong>, <strong>minimo</strong>. L'AI code review non è in Allegato III, quindi è a rischio limitato per default. L'obbligo principale è <em>trasparenza</em>: segnalare l'output AI, documentare il modello, mantenere un revisore umano sulle decisioni che vanno in produzione.</p>
          <p>Diventa alto rischio solo quando l'output decide outcome in settori regolamentati (infrastrutture, lavoro, credit scoring, servizi essenziali).</p>
        </Section>
        <Section icon={<AlertTriangle className="h-5 w-5" />} title="GPAI: cosa cambia per chi usa foundation model">
          <p>Il capitolo sui modelli di uso generale (GPAI), applicabile da agosto 2025, mette il grosso degli obblighi sul <strong>provider</strong>: model card, sintesi dei dati di training, policy UE sul copyright, red-teaming per modelli con rischio sistemico.</p>
          <p>Come <strong>deployer downstream</strong> hai obblighi più leggeri ma reali:</p>
          <ul>
            <li>Informare revisori e sviluppatori quando c'è AI in the loop.</li>
            <li>Documentare prompt, retention e chi può leggere gli output.</li>
            <li>Mantenere human-in-the-loop sulle decisioni che impattano persone.</li>
            <li>Rispettare le riserve di copyright se fai fine-tuning su codice interno.</li>
          </ul>
        </Section>
        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Perché BYOK e inferenza locale semplificano la compliance">
          <p>BYOK fa restare il rapporto col provider sotto il <strong>tuo</strong> DPA. Lo strumento diventa thin client; gli auditor devono valutare un solo nuovo sub-processor. L'inferenza locale (Ollama, LM Studio) elimina del tutto il provider esterno — spesso l'unica via che passa il procurement per finance, sanità e difesa.</p>
        </Section>
        <Section icon={<ClipboardCheck className="h-5 w-5" />} title="Checklist di compliance">
          <ul>
            <li>Quali modelli AI sono ammessi per il codice e quali no.</li>
            <li>Registrare l'uso di AI nei metadati di review (commit trailer, label PR).</li>
            <li>Revisore umano nominato e responsabile su ogni merge.</li>
            <li>BYOK o local inference per tutto ciò che è coperto da NDA o clausole IP.</li>
            <li>Aggiornare la policy AI ogni anno e a ogni cambio provider.</li>
            <li>Formazione su prompt injection e su cosa è dato personale nel codice.</li>
          </ul>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="Domande frequenti">
          <dl className="space-y-4">{FAQ.map(f => (<div key={f.q}><dt className="font-medium text-foreground">{f.q}</dt><dd className="mt-1">{f.a}</dd></div>))}</dl>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="Guide correlate">
          <ul>
            <li><Link to="/docs/gdpr-ai-code-review" className="text-foreground underline">GDPR e AI code review</Link></li>
            <li><Link to="/docs/privacy-first-ai-europe" className="text-foreground underline">AI privacy-first in Europa</Link></li>
            <li><Link to="/docs/ai-code-review-milano-nord-italia" className="text-foreground underline">AI code review a Milano e Nord Italia</Link></li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">Decoder — open-source code understanding for the AI era.
        <div className="mt-2"><InstagramLink /></div></footer>
    </div>
  );
}
