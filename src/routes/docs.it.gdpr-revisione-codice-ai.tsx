import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, FileText, Globe, BookOpen, ShieldCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "GDPR e AI code review — residenza dei dati e codice come dato personale";
const DESC =
  "Quando il codice sorgente diventa dato personale ai sensi del GDPR, perché la residenza dei dati conta per l'AI code review, e come BYOK con credenziali cifrate riduce l'esposizione del titolare.";
const URL = "https://decoderead.dev/docs/it/gdpr-revisione-codice-ai";
const EN_URL = "https://decoderead.dev/docs/gdpr-ai-code-review";

const FAQ = [
  { q: "Il codice sorgente può essere dato personale?", a: "Sì, spesso. Nomi autore nei commit, email nei commenti, IP nei log, fixture con dati di esempio reali e segreti che identificano un operatore sono dati personali quando presenti nel codice o nella sua history." },
  { q: "Dove processa il codice Decoder?", a: "Gli upload ZIP sono processati in modo effimero nel runtime edge Cloudflare Workers e poi cancellati. Con BYOK le chiamate al modello vanno direttamente al provider sul tuo account. Con l'inferenza locale (Ollama / LM Studio) nulla esce dalla macchina." },
  { q: "Serve un DPA con Decoder?", a: "Se processi dati personali per conto di terzi, sì — siamo responsabili del trattamento. Scrivi a contact@decoderead.dev. Con l'inferenza locale, Decoder spesso non è nemmeno responsabile perché i dati restano da te." },
  { q: "Come sono salvate le chiavi BYOK?", a: "Cifrate a riposo con AES-256-GCM e decifrate lato server solo al momento della chiamata al provider. Il ciphertext non viene mai esposto al browser." },
];

export const Route = createFileRoute("/docs/it/gdpr-revisione-codice-ai")({
  head: () => ({
    meta: [
      { title: TITLE }, { name: "description", content: DESC },
      { name: "keywords", content: "gdpr ai code review italia, gdpr codice sorgente, dato personale codice, residenza dati ai, ai dpa italia" },
      { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
      { property: "og:type", content: "article" }, { property: "og:url", content: URL }, { property: "og:locale", content: "it_IT" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "it", href: URL },
      { rel: "alternate", hrefLang: "en", href: EN_URL },
      { rel: "alternate", hrefLang: "zh", href: "https://decoderead.dev/docs/zh/gdpr-ai-code-review" },
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
          <Link to="/docs/gdpr-ai-code-review" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">EN</Link>
          <Link to="/docs/it/gdpr-revisione-codice-ai" className="rounded border border-border bg-card px-2 py-1 text-foreground">IT</Link>
          <Link to="/docs/zh/gdpr-ai-code-review" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">中文</Link>
        </div>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">GDPR e AI code review</h1>
        <p className="mt-4 text-lg text-muted-foreground">Il GDPR non menziona "codice", ma quando un repository contiene identificatori d'autore, dati di esempio o commenti d'operatore, parti del codice diventano <strong>dati personali</strong>. Appena uno strumento AI li legge, hai una catena di trattamento da governare.</p>

        <Section icon={<FileText className="h-5 w-5" />} title="Quando il codice è dato personale">
          <ul>
            <li><strong>Metadati commit</strong> — nome, email, IP autore. Sempre dato personale.</li>
            <li><strong>Commenti</strong> — nomi, handle Slack, assegnatari ticket.</li>
            <li><strong>Test fixture</strong> — clienti di esempio, email reali, account demo.</li>
            <li><strong>Log e dump</strong> committati per errore — IP, user ID, talvolta credenziali.</li>
            <li><strong>Segreti</strong> — quando una chiave identifica un operatore, conta anche quella.</li>
          </ul>
        </Section>
        <Section icon={<Globe className="h-5 w-5" />} title="Residenza dei dati: dove finiscono i byte">
          <ul>
            <li>Gli upload ZIP girano in <strong>Cloudflare Workers</strong>, processati in modo effimero e cancellati.</li>
            <li><strong>BYOK</strong>: la chiamata al modello va direttamente al provider sul <em>tuo</em> account, sotto il <em>tuo</em> DPA con quel provider.</li>
            <li><strong>Inferenza locale</strong> (Ollama / LM Studio): tutto resta sulla macchina.</li>
          </ul>
        </Section>
        <Section icon={<Lock className="h-5 w-5" />} title="Credenziali e storage">
          <p>Le chiavi BYOK sono cifrate a riposo con <strong>AES-256-GCM</strong>. Il ciphertext non viene mai restituito al browser; viene esposto solo un hint non sensibile (ultime 4 cifre + provider) per la UI. La decifrazione avviene server-side al momento della chiamata. Vedi la pagina <Link to="/data-flow" className="text-foreground underline">Data flow</Link>.</p>
        </Section>
        <Section icon={<ShieldCheck className="h-5 w-5" />} title="DPA, sub-processor e adempimenti">
          <p>Se tratti dati personali tramite Decoder per conto di clienti, Decoder è il tuo responsabile. Richiedi il DPA a <a href="mailto:contact@decoderead.dev" className="text-foreground underline">contact@decoderead.dev</a>. La lista sub-processor è breve di proposito: Cloudflare per il compute e un provider transazionale per le email. Con l'inferenza locale, di solito, zero sub-processor.</p>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="Domande frequenti">
          <dl className="space-y-4">{FAQ.map(f => (<div key={f.q}><dt className="font-medium text-foreground">{f.q}</dt><dd className="mt-1">{f.a}</dd></div>))}</dl>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="Guide correlate">
          <ul>
            <li><Link to="/docs/it/eu-ai-act-analisi-codice" className="text-foreground underline">EU AI Act e analisi del codice</Link></li>
            <li><Link to="/docs/privacy-first-ai-europe" className="text-foreground underline">AI privacy-first in Europa</Link></li>
            <li><Link to="/docs/ai-code-review-milano-nord-italia" className="text-foreground underline">AI code review a Milano e Nord Italia</Link></li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">Decoder — open-source code understanding for the AI era.</footer>
    </div>
  );
}
