import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, BookOpen, Scale } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "DPDP अधिनियम 2023 और AI कोड विश्लेषण — भारतीय टीमों के लिए गाइड";
const DESC =
  "भारत का डिजिटल पर्सनल डेटा प्रोटेक्शन अधिनियम 2023 AI कोड रिव्यू को कैसे प्रभावित करता है। BYOK, अस्थायी अपलोड और लोकल इनफ़रेंस डेटा-मूवमेंट को कम करते हैं और DPDP अनुपालन को सरल बनाते हैं।";
const URL = "https://decoderead.dev/docs/hi/dpdp-act-code-analysis";

const FAQ = [
  {
    q: "क्या DPDP अधिनियम सोर्स कोड पर लागू होता है?",
    a: "DPDP अधिनियम व्यक्तिगत डेटा पर लागू होता है। सोर्स कोड स्वयं व्यक्तिगत डेटा नहीं है, लेकिन कोड में अक्सर लॉग्स, टेस्ट फ़िक्सचर्स या टिप्पणियाँ होती हैं जो व्यक्तिगत डेटा का संदर्भ देती हैं — इसलिए ऐसी सामग्री को संभालने वाले रिव्यू टूल दायरे में आते हैं।",
  },
  {
    q: "क्या US-आधारित AI मॉडल को कोड भेजना क्रॉस-बॉर्डर ट्रांसफ़र है?",
    a: "हाँ, यदि कोड में कोई व्यक्तिगत डेटा है। BYOK इसे नहीं बदलता। Decoder लोकल इनफ़रेंस (Ollama, LM Studio) को आसान बनाता है ताकि कोई व्यक्तिगत डेटा सीमा पार न करे।",
  },
];

export const Route = createFileRoute("/docs/hi/dpdp-act-code-analysis")({
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
      { rel: "alternate", hrefLang: "en", href: "https://decoderead.dev/docs/dpdp-act-ai-code-analysis" },
      { rel: "alternate", hrefLang: "ta", href: "https://decoderead.dev/docs/ta/dpdp-act-code-analysis" },
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
          inLanguage: "hi",
          datePublished: "2026-07-02",
          dateModified: "2026-07-02",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16" lang="hi">
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> दस्तावेज़ पर वापस
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          DPDP अधिनियम और AI कोड विश्लेषण
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          भारत का डिजिटल पर्सनल डेटा प्रोटेक्शन अधिनियम 2023 यह पुनर्परिभाषित करता है कि सॉफ्टवेयर टीमें व्यक्तिगत
          डेटा को कैसे संभालती हैं — जिसमें वह डेटा भी शामिल है जो सोर्स कोड, लॉग्स और टेस्ट फ़िक्सचर्स के अंदर आ जाता है।
        </p>

        <Section icon={<Scale className="h-5 w-5" />} title="कोड रिव्यू के लिए तीन DPDP सिद्धांत">
          <ul>
            <li><strong>डेटा मिनिमाइज़ेशन</strong> — केवल आवश्यक प्रोसेस करें।</li>
            <li><strong>उद्देश्य सीमा</strong> — Decoder आपके कोड पर मॉडल्स को ट्रेन नहीं करता।</li>
            <li><strong>भंडारण सीमा</strong> — अपलोड अस्थायी हैं। इतिहास आप चुनते हैं।</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="Decoder डिज़ाइन से कैसे अनुरूप है">
          <ul>
            <li>BYOK क्रेडेंशियल AES-256-GCM से एन्क्रिप्टेड।</li>
            <li>Ollama और LM Studio के माध्यम से लोकल मॉडल समर्थन।</li>
            <li>आपके कोड पर कोई ट्रेनिंग नहीं।</li>
            <li>ओपन सोर्स (MIT) — हर लाइन ऑडिट योग्य।</li>
          </ul>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="अक्सर पूछे जाने वाले प्रश्न">
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs">यह कानूनी सलाह नहीं है। औपचारिक DPIA के लिए अपने DPO से परामर्श करें।</p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="संबंधित">
          <ul>
            <li><Link to="/docs/hi/ai-code-review-bharat" className="text-foreground underline">भारत में AI कोड रिव्यू</Link></li>
            <li><Link to="/docs/dpdp-act-ai-code-analysis" className="text-foreground underline">DPDP Act (English)</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — AI युग के लिए ओपन-सोर्स कोड समझ।
      </footer>
    </div>
  );
}
