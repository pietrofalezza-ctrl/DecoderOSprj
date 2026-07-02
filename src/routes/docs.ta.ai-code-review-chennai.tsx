import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, BookOpen, Coins, ShieldCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "சென்னையில் AI கோட் ரிவியூ — ஓப்பன்-சோர்ஸ், BYOK, குறைந்த செலவு";
const DESC =
  "சென்னை மற்றும் தமிழ்நாட்டில் உள்ள மென்பொருள் குழுக்களுக்கான AI கோட் பகுப்பாய்வு. ஓப்பன்-சோர்ஸ், BYOK, DPDP இணக்கம். இலவச நிலையான மற்றும் மால்வேர் ஸ்கேன், API கீ இல்லாமல்.";
const URL = "https://decoderead.dev/docs/ta/ai-code-review-chennai";

const FAQ = [
  {
    q: "சென்னையில் Decoder எங்கு பொருந்துகிறது?",
    a: "OMR, டைடல் பார்க், சோலிங்கநல்லூர் மற்றும் தரமணி மென்பொருள் மையங்களில் உள்ள சேவை வழங்குநர்கள், தயாரிப்பு ஸ்டார்ட்அப்கள் மற்றும் நிறுவன SaaS குழுக்களுக்கு.",
  },
  {
    q: "BYOK ஏன் முக்கியம்?",
    a: "SaaS AI கோட் ரிவியூ கருவிகள் ஒரு டெவலப்பருக்கு மாதத்திற்கு $15–$50 வசூலிக்கின்றன. Decoder + BYOK உடன், நீங்கள் உங்கள் சொந்த மாதிரி பயன்பாட்டை மட்டுமே செலுத்துகிறீர்கள் — பொதுவாக ஒரு சிறிய பகுதியில்.",
  },
];

export const Route = createFileRoute("/docs/ta/ai-code-review-chennai")({
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
      {
        rel: "alternate",
        hrefLang: "en",
        href: "https://decoderead.dev/docs/ai-code-review-hyderabad-chennai",
      },
      {
        rel: "alternate",
        hrefLang: "hi",
        href: "https://decoderead.dev/docs/hi/ai-code-review-bharat",
      },
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: "https://decoderead.dev/docs/ai-code-review-india",
      },
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Decoder",
          url: "https://decoderead.dev",
          areaServed: [
            { "@type": "City", name: "Chennai" },
            { "@type": "AdministrativeArea", name: "Tamil Nadu" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Page,
});

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary">
          {icon}
        </span>
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
        <Link to="/" aria-label="Decoder">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LangSwitcher />
          <PublicHeaderAuthSlot ctaLabelKey="landing.ctaSignIn" showArrow={false} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16" lang="ta">
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> ஆவணத்திற்குத் திரும்பு
        </Link>

        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight md:text-5xl">
          சென்னையில் AI கோட் ரிவியூ
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          சென்னை இந்தியாவின் இரண்டாவது மிகப்பெரிய மென்பொருள் ஏற்றுமதியாளர் மற்றும் BFSI,
          ஆட்டோமோட்டிவ்-டெக் மற்றும் சுகாதார பொறியியலின் மையம். Decoder ஒரு{" "}
          <strong>ஓப்பன்-சோர்ஸ் (MIT)</strong>,<strong> BYOK</strong> AI கோட் பகுப்பாய்வு கருவி —
          ஒரு இருக்கை SaaS பில் இல்லாமல்.
        </p>

        <Section
          icon={<MapPin className="h-5 w-5" />}
          title="Decoder சென்னை ஸ்டேக்கில் எங்கு பொருந்துகிறது"
        >
          <ul>
            <li>
              <strong>சேவை வழங்குநர்கள்</strong> — வழங்குவதற்கு முன் AI-கோட் விநியோகங்களை தணிக்கை
              செய்யுங்கள்.
            </li>
            <li>
              <strong>தயாரிப்பு ஸ்டார்ட்அப்கள்</strong> — இலவச நிலையான + மால்வேர் ஸ்கேன், AI
              விளக்கத்திற்கு BYOK.
            </li>
            <li>
              <strong>பின்டெக் & வங்கி பங்குதாரர்கள்</strong> — Ollama உடன் லோக்கல் இன்பரென்ஸ்,
              பூஜ்ஜிய-எக்ரெஸ்.
            </li>
            <li>
              <strong>பல்கலைக்கழகங்கள்</strong> — AI-முதல் பாடத்திட்டத்தில் கோட் கல்வியறிவைக்
              கற்பியுங்கள்.
            </li>
          </ul>
        </Section>

        <Section icon={<Coins className="h-5 w-5" />} title="செலவு கணக்கீடு">
          <p>
            15 நபர் குழுவிற்கு SaaS AI ரிவியூ ஆண்டுக்கு ~₹4.5 லட்சம் ஆகும். Decoder + BYOK உடன், அதே
            அளவு பொதுவாக ஆண்டுக்கு ₹1 லட்சத்திற்கும் குறைவாக இருக்கும். லோக்கல் Ollama உடன், அது
            பூஜ்ஜியம்.
          </p>
        </Section>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="தனியுரிமை & இணக்கம்">
          <p>
            BYOK நற்சான்றிதழ்கள் AES-256-GCM உடன் என்க்ரிப்ட் செய்யப்படுகின்றன. Ollama மற்றும் LM
            Studio மூலம் லோக்கல் மாதிரி ஆதரவு. உங்கள் கோட்டில் பயிற்சி இல்லை. DPDP சட்டம்
            இணக்கமானது.
          </p>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="அடிக்கடி கேட்கப்படும் கேள்விகள்">
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section icon={<BookOpen className="h-5 w-5" />} title="தொடர்புடையது">
          <ul>
            <li>
              <Link to="/docs/ta/dpdp-act-code-analysis" className="text-foreground underline">
                DPDP சட்டம் & கோட் பகுப்பாய்வு
              </Link>
            </li>
            <li>
              <Link to="/docs/ta/open-source-ai-code-review" className="text-foreground underline">
                ஓப்பன்-சோர்ஸ் AI கோட் ரிவியூ
              </Link>
            </li>
            <li>
              <Link
                to="/docs/ai-code-review-hyderabad-chennai"
                className="text-foreground underline"
              >
                English version
              </Link>
            </li>
          </ul>
        </Section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — AI சகாப்தத்திற்கான ஓப்பன்-சோர்ஸ் கோட் புரிதல்.
        <div className="mt-2">
          <InstagramLink />
        </div>
      </footer>
    </div>
  );
}
