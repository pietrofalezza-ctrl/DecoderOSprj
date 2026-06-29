import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, FileText, Globe, BookOpen, ShieldCheck } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "GDPR 合规的 AI 代码审查 — 数据驻留与源代码作为个人数据";
const DESC = "源代码何时构成 GDPR 下的个人数据,为什么欧盟数据驻留对 AI 代码审查重要,以及 BYOK 加静态加密凭证如何降低控制者风险。";
const URL = "https://decoderead.dev/docs/zh/gdpr-ai-code-review";
const EN_URL = "https://decoderead.dev/docs/gdpr-ai-code-review";

const FAQ = [
  { q: "源代码会被视为个人数据吗?", a: "通常会。提交元数据中的作者姓名、邮箱、IP;注释中的姓名;包含真实标识符的测试数据;能识别个人操作者的密钥,都属于个人数据。" },
  { q: "Decoder 在哪里处理我的代码?", a: "ZIP 上传在 Cloudflare Workers 边缘运行时短暂处理后即删除。使用 BYOK 时模型调用直接发送到您账户下的提供方。使用本地推理 (Ollama / LM Studio) 时数据从不离开您的机器。" },
  { q: "我需要与 Decoder 签订 DPA 吗?", a: "如果您代表第三方处理个人数据,需要。我们是受托处理方,请联系 contact@decoderead.dev。使用本地推理时通常无需,因为数据留在您一侧。" },
  { q: "BYOK 密钥如何存储?", a: "采用 AES-256-GCM 静态加密。密文不暴露给浏览器,仅在服务端发起对外调用时解密。" },
];

export const Route = createFileRoute("/docs/zh/gdpr-ai-code-review")({
  head: () => ({
    meta: [
      { title: TITLE }, { name: "description", content: DESC },
      { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
      { property: "og:type", content: "article" }, { property: "og:url", content: URL }, { property: "og:locale", content: "zh_CN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "zh", href: URL },
      { rel: "alternate", hrefLang: "en", href: EN_URL },
      { rel: "alternate", hrefLang: "it", href: "https://decoderead.dev/docs/it/gdpr-revisione-codice-ai" },
      { rel: "alternate", hrefLang: "x-default", href: EN_URL },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: URL, mainEntityOfPage: URL, inLanguage: "zh", datePublished: "2026-06-29", dateModified: "2026-06-29", author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" }, publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" } }) },
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
        <Link to="/docs" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> 返回文档</Link>
        <div className="mt-6 flex gap-2 text-xs">
          <Link to="/docs/gdpr-ai-code-review" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">EN</Link>
          <Link to="/docs/it/gdpr-revisione-codice-ai" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">IT</Link>
          <Link to="/docs/zh/gdpr-ai-code-review" className="rounded border border-border bg-card px-2 py-1 text-foreground">中文</Link>
        </div>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">GDPR 与 AI 代码审查</h1>
        <p className="mt-4 text-lg text-muted-foreground">GDPR 未提及"代码",但当仓库包含作者标识、样本数据或操作者注释时,部分代码即成为<strong>个人数据</strong>。一旦 AI 工具读取这些内容,您就有了需要治理的处理链。以下是欧洲工程团队的实务版本。</p>

        <Section icon={<FileText className="h-5 w-5" />} title="源代码何时构成个人数据">
          <ul>
            <li><strong>提交元数据</strong> — 作者姓名、邮箱、IP。始终为个人数据。</li>
            <li><strong>注释</strong> — 姓名、内部 Slack 账号、工单负责人。</li>
            <li><strong>测试数据</strong> — 样本客户、真实邮箱、演示账号。</li>
            <li><strong>日志与转储</strong> — 误提交的 IP、用户 ID,有时含凭证。</li>
            <li><strong>密钥</strong> — 当密钥能识别个人操作者时同样适用。</li>
          </ul>
        </Section>
        <Section icon={<Globe className="h-5 w-5" />} title="数据驻留:字节实际落在哪里">
          <ul>
            <li>ZIP 上传与分析在 <strong>Cloudflare Workers</strong> 边缘运行时短暂处理后删除。</li>
            <li><strong>BYOK</strong>:模型调用直接发往您账户下的提供方,适用您与该提供方的 DPA。</li>
            <li><strong>本地推理</strong> (Ollama / LM Studio):所有内容留在本机。</li>
          </ul>
        </Section>
        <Section icon={<Lock className="h-5 w-5" />} title="凭证与存储">
          <p>BYOK 密钥使用 <strong>AES-256-GCM</strong> 静态加密。密文从不返回浏览器,只暴露非敏感提示(末 4 位与提供方名称)用于 UI。解密在服务端、对外调用时进行。详见 <Link to="/data-flow" className="text-foreground underline">数据流</Link> 页面。</p>
        </Section>
        <Section icon={<ShieldCheck className="h-5 w-5" />} title="DPA、子处理方与文档">
          <p>若您代表客户通过 Decoder 处理个人数据,Decoder 即为您的受托处理方,请通过 <a href="mailto:contact@decoderead.dev" className="text-foreground underline">contact@decoderead.dev</a> 申请 DPA。子处理方清单刻意保持简短:Cloudflare 提供计算,事务邮件提供方负责通知。本地推理通常无子处理方。</p>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="常见问题">
          <dl className="space-y-4">{FAQ.map(f => (<div key={f.q}><dt className="font-medium text-foreground">{f.q}</dt><dd className="mt-1">{f.a}</dd></div>))}</dl>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="相关指南">
          <ul>
            <li><Link to="/docs/zh/eu-ai-act-code-analysis" className="text-foreground underline">欧盟 AI 法案与代码分析</Link></li>
            <li><Link to="/docs/zh/privacy-first-ai-europe" className="text-foreground underline">欧洲隐私优先 AI</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">开源 AI 代码审查</Link></li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">Decoder — open-source code understanding for the AI era.</footer>
    </div>
  );
}
