import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Github, BookOpen, ShieldCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "ஓப்பன்-சோர்ஸ் AI கோட் ரிவியூ — MIT, BYOK மற்றும் லோக்கல்";
const DESC =
  "Decoder ஒரு ஓப்பன்-சோர்ஸ் (MIT) AI கோட் ரிவியூ கருவி. BYOK அல்லது லோக்கல் மாதிரிகள் (Ollama, LM Studio) உடன் இயக்கவும். இருக்கை ஒன்றுக்கு கட்டணம் இல்லை.";
const URL = "https://decoderead.dev/docs/ta/open-source-ai-code-review";

export const Route = createFileRoute("/docs/ta/open-source-ai-code-review")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "ta_IN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "ta", href: URL },
      { rel: "alternate", hrefLang: "en", href: "https://decoderead.dev/docs/open-source-ai-code-review" },
      { rel: "alternate", hrefLang: "hi", href: "https://decoderead.dev/docs/hi/open-source-ai-code-review" },
      { rel: "alternate", hrefLang: "x-default", href: "https://decoderead.dev/docs/open-source-ai-code-review" },
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
          inLanguage: "ta",
          datePublished: "2026-07-02",
          dateModified: "2026-07-02",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16" lang="ta">
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> ஆவணத்திற்குத் திரும்பு
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          ஓப்பன்-சோர்ஸ் AI கோட் ரிவியூ
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Decoder MIT உரிமத்தின் கீழ் வெளியிடப்பட்டுள்ளது. GitHub-இல் கோட் படியுங்கள், சுய-ஹோஸ்ட் செய்யுங்கள்,
          அல்லது முழுவதுமாக ஆஃப்லைனில் இயக்கவும். BYOK அல்லது லோக்கல் மாதிரிகளுடன், நீங்கள் எப்போதும் கட்டுப்பாட்டில் இருக்கிறீர்கள்.
        </p>

        <Section icon={<Github className="h-5 w-5" />} title="ஓப்பன்-சோர்ஸ் என்றால் என்ன">
          <ul>
            <li>முழு சோர்ஸ் கோட் GitHub-இல் கிடைக்கிறது.</li>
            <li>MIT உரிமம் — வணிக பயன்பாட்டிற்கு இலவசம்.</li>
            <li>மறைந்த டெலிமெட்ரி இல்லை.</li>
            <li>சமூக பங்களிப்புகள் வரவேற்கப்படுகின்றன.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="BYOK மற்றும் லோக்கல் முதலில்">
          <p>
            நீங்கள் உங்கள் சொந்த OpenAI, Anthropic, Gemini அல்லது OpenRouter கீயைப் பயன்படுத்துகிறீர்கள் — இருக்கை
            SaaS மாதிரியை விட மிகவும் மலிவானது. அல்லது Ollama / LM Studio உடன் முழுவதுமாக ஆஃப்லைனில் இயக்கவும்.
          </p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="தொடர்புடையது">
          <ul>
            <li><Link to="/docs/ta/ai-code-review-chennai" className="text-foreground underline">சென்னையில் AI கோட் ரிவியூ</Link></li>
            <li><Link to="/docs/ta/dpdp-act-code-analysis" className="text-foreground underline">DPDP சட்டம்</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">English version</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — AI சகாப்தத்திற்கான ஓப்பன்-சோர்ஸ் கோட் புரிதல்.
      
        <div className="mt-2"><InstagramLink /></div></footer>
    </div>
  );
}
