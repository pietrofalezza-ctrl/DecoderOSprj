import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, BookOpen, Coins } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "भारत में AI कोड रिव्यू — ओपन-सोर्स, BYOK और कम लागत";
const DESC =
  "भारतीय डेवलपर्स के लिए AI कोड विश्लेषण। BYOK का मतलब है शून्य प्लेटफ़ॉर्म फीस — केवल अपने मॉडल उपयोग का भुगतान करें। मुफ्त स्टैटिक और मैलवेयर स्कैन, बिना API की के। DPDP अधिनियम 2023 के अनुरूप।";
const URL = "https://decoderead.dev/docs/hi/ai-code-review-bharat";

const FAQ = [
  {
    q: "क्या Decoder भारत में डेवलपर्स के लिए मुफ्त है?",
    a: "हाँ। स्टैटिक विश्लेषण, मैलवेयर स्कैनिंग और AI-उत्पत्ति डिटेक्शन बिना किसी API की के मुफ्त हैं। AI व्याख्या और रेपो चैट के लिए आपकी अपनी OpenAI / Anthropic / Gemini / OpenRouter की (BYOK) या लोकल Ollama / LM Studio एंडपॉइंट का उपयोग होता है।",
  },
  {
    q: "क्या Decoder DPDP अधिनियम 2023 के अनुरूप है?",
    a: "Decoder डेटा-मूवमेंट को कम करने के लिए डिज़ाइन किया गया है: BYOK, अस्थायी अपलोड, और वैकल्पिक लोकल इनफ़रेंस। यह DPDP के डेटा-मिनिमाइज़ेशन सिद्धांत के अनुरूप है। यह कानूनी सलाह नहीं है।",
  },
  {
    q: "क्या यह आउटसोर्सिंग एजेंसियों के लिए उपयोगी है?",
    a: "हाँ। बाहरी विक्रेताओं से आने वाले कोड की गुणवत्ता, सुरक्षा और IP-स्वच्छता जाँच के लिए Decoder का उपयोग करें।",
  },
];

export const Route = createFileRoute("/docs/hi/ai-code-review-bharat")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "ai कोड रिव्यू भारत, byok कोड विश्लेषण, dpdp अधिनियम, ओपन सोर्स ai टूल्स, भारत डेवलपर्स" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "hi_IN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "hi", href: URL },
      { rel: "alternate", hrefLang: "en", href: "https://decoderead.dev/docs/ai-code-review-india" },
      { rel: "alternate", hrefLang: "ta", href: "https://decoderead.dev/docs/ta/ai-code-review-chennai" },
      { rel: "alternate", hrefLang: "x-default", href: "https://decoderead.dev/docs/ai-code-review-india" },
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
          भारत में AI कोड रिव्यू
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          बेंगलुरु से चेन्नई और हैदराबाद तक, भारतीय डेवलपर्स हर दिन विशाल मात्रा में AI-जनरेटेड कोड शिप करते हैं।
          Decoder एक <strong>ओपन-सोर्स (MIT)</strong>, <strong>BYOK</strong> कोड-विश्लेषण टूल है जो प्रति-सीट SaaS
          शुल्क के बिना AI रिव्यू प्रदान करता है।
        </p>

        <Section icon={<Coins className="h-5 w-5" />} title="BYOK भारतीय टीमों के लिए क्यों महत्वपूर्ण है">
          <ul>
            <li><strong>स्टैटिक कोड विश्लेषण</strong> — मुफ्त, बिना की, 20+ भाषाएँ।</li>
            <li><strong>मैलवेयर / गुप्त स्कैनिंग</strong> — मुफ्त।</li>
            <li><strong>AI-उत्पत्ति डिटेक्टर</strong> — मुफ्त। Copilot / Cursor / Claude पैटर्न को फ्लैग करता है।</li>
            <li><strong>AI व्याख्या और रेपो चैट</strong> — BYOK या लोकल मॉडल।</li>
          </ul>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="DPDP अधिनियम 2023 के अनुरूप">
          <p>
            Decoder डिज़ाइन से ही डेटा-मूवमेंट को न्यूनतम रखता है: BYOK क्रेडेंशियल आपके खाते में AES-256-GCM से
            एन्क्रिप्टेड, अस्थायी अपलोड, और लोकल इनफ़रेंस के साथ शून्य-एग्रेस विकल्प। पूर्ण औपचारिक DPIA के लिए
            अपने DPO से सलाह लें।
          </p>
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
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="संबंधित गाइड">
          <ul>
            <li><Link to="/docs/hi/dpdp-act-code-analysis" className="text-foreground underline">DPDP अधिनियम और कोड विश्लेषण</Link></li>
            <li><Link to="/docs/hi/open-source-ai-code-review" className="text-foreground underline">ओपन-सोर्स AI कोड रिव्यू</Link></li>
            <li><Link to="/docs/ai-code-review-india" className="text-foreground underline">AI code review in India (English)</Link></li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — AI युग के लिए ओपन-सोर्स कोड समझ।
      
        <div className="mt-2"><InstagramLink /></div></footer>
    </div>
  );
}
