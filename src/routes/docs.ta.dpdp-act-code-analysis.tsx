import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, BookOpen, Scale } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "DPDP சட்டம் 2023 & AI கோட் பகுப்பாய்வு — இந்திய குழுக்களுக்கான வழிகாட்டி";
const DESC =
  "இந்தியாவின் டிஜிட்டல் தனிப்பட்ட தரவு பாதுகாப்பு சட்டம் 2023 AI கோட் ரிவியூவை எப்படி பாதிக்கிறது. BYOK, தற்காலிக பதிவேற்றங்கள் மற்றும் லோக்கல் இன்பரென்ஸ் தரவு நகர்வைக் குறைக்கின்றன.";
const URL = "https://decoderead.dev/docs/ta/dpdp-act-code-analysis";

export const Route = createFileRoute("/docs/ta/dpdp-act-code-analysis")({
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
      { rel: "alternate", hrefLang: "en", href: "https://decoderead.dev/docs/dpdp-act-ai-code-analysis" },
      { rel: "alternate", hrefLang: "hi", href: "https://decoderead.dev/docs/hi/dpdp-act-code-analysis" },
      { rel: "alternate", hrefLang: "x-default", href: "https://decoderead.dev/docs/dpdp-act-ai-code-analysis" },
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
          DPDP சட்டம் & AI கோட் பகுப்பாய்வு
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          இந்தியாவின் DPDP சட்டம் 2023 மென்பொருள் குழுக்கள் தனிப்பட்ட தரவை எவ்வாறு கையாள வேண்டும் என்பதை
          மறுவரையறை செய்கிறது — சோர்ஸ் கோட், லாக்குகள் மற்றும் சோதனை ஃபிக்ஸ்சர்களுக்குள் நுழையும் தரவு உட்பட.
        </p>

        <Section icon={<Scale className="h-5 w-5" />} title="கோட் ரிவியூவிற்கான மூன்று DPDP கொள்கைகள்">
          <ul>
            <li><strong>தரவு குறைப்பு</strong> — தேவையானதை மட்டும் செயலாக்குங்கள்.</li>
            <li><strong>நோக்க வரம்பு</strong> — Decoder உங்கள் கோட்டில் மாதிரிகளை பயிற்றுவிக்காது.</li>
            <li><strong>சேமிப்பு வரம்பு</strong> — பதிவேற்றங்கள் தற்காலிகமானவை.</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Decoder வடிவமைப்பால் எப்படி இணக்கமானது">
          <ul>
            <li>BYOK நற்சான்றிதழ்கள் AES-256-GCM மூலம் என்க்ரிப்ட் செய்யப்பட்டவை.</li>
            <li>Ollama மற்றும் LM Studio மூலம் லோக்கல் மாதிரி ஆதரவு.</li>
            <li>உங்கள் கோட்டில் பயிற்சி இல்லை.</li>
            <li>ஓப்பன் சோர்ஸ் (MIT).</li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="தொடர்புடையது">
          <ul>
            <li><Link to="/docs/ta/ai-code-review-chennai" className="text-foreground underline">சென்னையில் AI கோட் ரிவியூ</Link></li>
            <li><Link to="/docs/dpdp-act-ai-code-analysis" className="text-foreground underline">English version</Link></li>
          </ul>
          <p className="mt-4 text-xs">இது சட்ட ஆலோசனை அல்ல. முறையான DPIA-க்கு உங்கள் DPO உடன் கலந்தாலோசிக்கவும்.</p>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — AI சகாப்தத்திற்கான ஓப்பன்-சோர்ஸ் கோட் புரிதல்.
      </footer>
    </div>
  );
}
