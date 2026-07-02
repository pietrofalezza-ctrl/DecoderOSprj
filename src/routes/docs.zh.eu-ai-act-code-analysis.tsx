import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Scale, ShieldCheck, ClipboardCheck, BookOpen, AlertTriangle } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "欧盟 AI 法案与 AI 代码分析 — 欧洲开发团队合规指南";
const DESC = "欧盟 AI 法案如何适用于 AI 代码审查与分析工具:风险等级、通用 AI 模型 (GPAI) 义务、透明度要求,以及欧洲工程团队的实务合规清单。";
const URL = "https://decoderead.dev/docs/zh/eu-ai-act-code-analysis";
const EN_URL = "https://decoderead.dev/docs/eu-ai-act-code-analysis";

const FAQ = [
  { q: "欧盟 AI 法案适用于 AI 代码审查工具吗?", a: "适用,只要在欧盟境内使用。大多数 AI 代码审查工具属于通用 AI (GPAI) 范畴,义务集中在透明度、技术文档、版权声明与告知下游用户。" },
  { q: "AI 代码分析属于高风险吗?", a: "默认不是。代码审查未列入附件三。只有当输出实质性决定受监管领域(关键基础设施、就业、信用评分、基本公共服务)的结果时,才升级为高风险。" },
  { q: "2025–2026 年 GPAI 提供方有何变化?", a: "必须发布模型卡、训练数据摘要与欧盟版权政策。下游部署方(您的团队)继承较轻但实在的义务:人在回路、透明度告知、技术文档。" },
  { q: "BYOK 如何帮助合规?", a: "BYOK 让模型提供方关系保留在您的 DPA 之下,工具变成瘦客户端,审计只需评估一个新的子处理方,而不是整条供应链。" },
];

export const Route = createFileRoute("/docs/zh/eu-ai-act-code-analysis")({
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
      { rel: "alternate", hrefLang: "it", href: "https://decoderead.dev/docs/it/eu-ai-act-analisi-codice" },
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
          <Link to="/docs/eu-ai-act-code-analysis" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">EN</Link>
          <Link to="/docs/it/eu-ai-act-analisi-codice" className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground">IT</Link>
          <Link to="/docs/zh/eu-ai-act-code-analysis" className="rounded border border-border bg-card px-2 py-1 text-foreground">中文</Link>
        </div>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">欧盟 AI 法案与 AI 代码分析</h1>
        <p className="mt-4 text-lg text-muted-foreground">欧盟 AI 法案于 2024 年 8 月生效,2026–2027 年分阶段适用。如果您在欧洲交付软件并使用 AI 读取、审查或生成代码,这里是面向工程团队的实务版本,以及为何 <strong>隐私优先、BYOK</strong> 的工具(如 Decoder)契合新制度。</p>

        <Section icon={<Scale className="h-5 w-5" />} title="AI 代码审查在风险金字塔中的位置">
          <p>法案定义四级:<strong>不可接受</strong>、<strong>高风险</strong>、<strong>有限风险</strong>、<strong>最低风险</strong>。AI 代码审查未列入附件三,默认处于有限风险层级。义务核心是<em>透明度</em>:告知 AI 介入、记录所用模型、对上线决策保留人工复核。</p>
        </Section>
        <Section icon={<AlertTriangle className="h-5 w-5" />} title="GPAI:基础模型用户的变化">
          <p>2025 年 8 月起适用的 GPAI 章节将大部分义务放在<strong>提供方</strong>:模型卡、训练数据摘要、欧盟版权政策、对系统性风险模型的红队测试。</p>
          <p>作为<strong>下游部署方</strong>您承担较轻但具体的义务:告知审查者与开发者 AI 在回路;记录提示词、留存与可访问性;对影响个人的决策保留人工复核;在基于内部代码微调时尊重版权保留。</p>
        </Section>
        <Section icon={<ShieldCheck className="h-5 w-5" />} title="为什么 BYOK 与本地推理简化合规">
          <p>BYOK 让模型提供方关系保留在您的 DPA 之下。工具成为瘦客户端,审计只需评估一个新的子处理方。本地推理(Ollama、LM Studio)则彻底取消外部提供方,通常是金融、医疗、国防采购唯一能通过的路径。</p>
        </Section>
        <Section icon={<ClipboardCheck className="h-5 w-5" />} title="工程团队合规清单">
          <ul>
            <li>明确允许与禁用的 AI 模型清单。</li>
            <li>在审查元数据中记录 AI 介入(commit trailer、PR 标签)。</li>
            <li>每次合并都有指名负责的人类审查者。</li>
            <li>受 NDA 或 IP 条款覆盖的部分一律使用 BYOK 或本地推理。</li>
            <li>每年与每次模型提供方变更后刷新 AI 使用政策。</li>
            <li>培训提示词注入与"代码中的个人数据"。</li>
          </ul>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="常见问题">
          <dl className="space-y-4">{FAQ.map(f => (<div key={f.q}><dt className="font-medium text-foreground">{f.q}</dt><dd className="mt-1">{f.a}</dd></div>))}</dl>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="相关指南">
          <ul>
            <li><Link to="/docs/zh/gdpr-ai-code-review" className="text-foreground underline">GDPR 与 AI 代码审查</Link></li>
            <li><Link to="/docs/zh/privacy-first-ai-europe" className="text-foreground underline">欧洲隐私优先 AI</Link></li>
            <li><Link to="/docs/open-source-ai-code-review" className="text-foreground underline">开源 AI 代码审查</Link></li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">Decoder — open-source code understanding for the AI era.</footer>
    </div>
  );
}
