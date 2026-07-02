import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Github, BookOpen, ShieldCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "ओपन-सोर्स AI कोड रिव्यू — MIT, BYOK और लोकल";
const DESC =
  "Decoder एक ओपन-सोर्स (MIT) AI कोड रिव्यू टूल है। BYOK या लोकल मॉडल (Ollama, LM Studio) के साथ चलाएँ। कोई प्रति-सीट फीस नहीं, कोई वेंडर लॉक-इन नहीं।";
const URL = "https://decoderead.dev/docs/hi/open-source-ai-code-review";

export const Route = createFileRoute("/docs/hi/open-source-ai-code-review")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "hi_IN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "hi", href: URL },
      { rel: "alternate", hrefLang: "en", href: "https://decoderead.dev/docs/open-source-ai-code-review" },
      { rel: "alternate", hrefLang: "ta", href: "https://decoderead.dev/docs/ta/open-source-ai-code-review" },
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
          inLanguage: "hi",
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16" lang="hi">
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> दस्तावेज़ पर वापस
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          ओपन-सोर्स AI कोड रिव्यू
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Decoder MIT लाइसेंस के तहत जारी किया गया है। कोड को GitHub पर पढ़ें, स्वयं-होस्ट करें, या पूरी तरह से
          ऑफ़लाइन चलाएँ। BYOK या लोकल मॉडल के साथ, आप हमेशा नियंत्रण में रहते हैं।
        </p>

        <Section icon={<Github className="h-5 w-5" />} title="ओपन-सोर्स का मतलब क्या है">
          <ul>
            <li>पूर्ण सोर्स कोड GitHub पर उपलब्ध।</li>
            <li>MIT लाइसेंस — व्यावसायिक उपयोग के लिए मुफ्त।</li>
            <li>कोई हिडन टेलीमेट्री नहीं।</li>
            <li>कम्युनिटी योगदान का स्वागत।</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="BYOK और लोकल पहले">
          <p>
            आप अपनी OpenAI, Anthropic, Gemini या OpenRouter की का उपयोग करते हैं — जो प्रति-सीट SaaS मॉडल की तुलना
            में काफी सस्ता है। या Ollama / LM Studio के साथ पूरी तरह से ऑफ़लाइन चलाएँ।
          </p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="संबंधित">
          <ul>
            <li><Link to="/docs/hi/ai-code-review-bharat" className="text-foreground underline">भारत में AI कोड रिव्यू</Link></li>
            <li><Link to="/docs/hi/dpdp-act-code-analysis" className="text-foreground underline">DPDP अधिनियम</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">English version</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — AI युग के लिए ओपन-सोर्स कोड समझ।
      </footer>
    </div>
  );
}
