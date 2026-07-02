import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Flag, Users, BookOpen, GitCompare } from "lucide-react";

import { LangSwitcher } from "@/components/LangSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { InstagramLink } from "@/components/InstagramLink";
import { PublicHeaderAuthSlot } from "@/components/PublicHeaderAuthSlot";

const TITLE = "欧洲隐私优先 AI — 2026 工程团队选型指南";
const DESC =
  "为什么欧洲团队选择 BYOK、开源与本地推理。欧盟 AI 生态地图 (Mistral、Aleph Alpha、Silo AI)、采购标准与对比清单。";
const URL = "https://decoderead.dev/docs/zh/privacy-first-ai-europe";
const EN_URL = "https://decoderead.dev/docs/privacy-first-ai-europe";

const FAQ = [
  {
    q: "什么是真正的『隐私优先 AI』?",
    a: "三点:数据不在无显式决策的情况下离开边界、您掌握密钥、工具可审计。BYOK + 开源 +(可选)本地推理覆盖全部。",
  },
  {
    q: "欧盟有 OpenAI 与 Anthropic 的严肃替代吗?",
    a: "有。Mistral(法国)提供开源权重与托管模型;Aleph Alpha(德国)主打主权部署;Silo AI(芬兰,AMD)构建欧洲 LLM;OpenEuroLLM 是欧盟资助的多语种开源 LLM 倡议。",
  },
  {
    q: "在欧盟托管 LLM 就符合 GDPR 吗?",
    a: "必要但不充分。还需合法依据、与提供方的 DPA、对数据主体的透明告知,以及尊重删除请求。欧盟托管解决跨境传输问题。",
  },
  {
    q: "Decoder 会绑定特定提供方吗?",
    a: "不会。支持 OpenAI、Anthropic、Google、OpenRouter 的 BYOK,也支持 Ollama / LM Studio 本地。今天可经由 OpenRouter 走 Mistral,随时切换。",
  },
];

export const Route = createFileRoute("/docs/zh/privacy-first-ai-europe")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:locale", content: "zh_CN" },
    ],
    links: [
      { rel: "canonical", href: URL },
      { rel: "alternate", hrefLang: "zh", href: URL },
      { rel: "alternate", hrefLang: "en", href: EN_URL },
      {
        rel: "alternate",
        hrefLang: "it",
        href: "https://decoderead.dev/docs/it/ai-privacy-first-europa",
      },
      { rel: "alternate", hrefLang: "x-default", href: EN_URL },
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
          inLanguage: "zh",
          datePublished: "2026-06-29",
          dateModified: "2026-06-29",
          author: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
          publisher: { "@type": "Organization", name: "Decoder", url: "https://decoderead.dev" },
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
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 返回文档
        </Link>
        <div className="mt-6 flex gap-2 text-xs">
          <Link
            to="/docs/privacy-first-ai-europe"
            className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            EN
          </Link>
          <Link
            to="/docs/it/ai-privacy-first-europa"
            className="rounded border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            IT
          </Link>
          <Link
            to="/docs/zh/privacy-first-ai-europe"
            className="rounded border border-border bg-card px-2 py-1 text-foreground"
          >
            中文
          </Link>
        </div>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">
          欧洲隐私优先 AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          欧洲工程团队正在形成共识:<strong>BYOK</strong>、<strong>开源</strong>,在数据敏感时使用
          <strong>本地推理</strong>。本指南解释原因,列出 2026
          年值得关注的欧洲玩家,并给出可直接放入供应商问卷的采购清单。
        </p>

        <Section icon={<ShieldCheck className="h-5 w-5" />} title="实务中的隐私优先">
          <ul>
            <li>
              模型提供方关系在<strong>您的</strong>合同下 (BYOK)。
            </li>
            <li>
              工具的提示词与规则<strong>可审计</strong>(开源)。
            </li>
            <li>
              必要时可端到端<strong>离线</strong>运行 (Ollama / LM Studio)。
            </li>
            <li>
              最小化存储,凭证<strong>静态加密</strong> (AES-256-GCM)。
            </li>
            <li>供应商不基于您的数据训练 — 写入合同,而非仅在博客。</li>
          </ul>
        </Section>
        <Section icon={<Flag className="h-5 w-5" />} title="值得关注的欧盟 AI 生态">
          <ul>
            <li>
              <strong>Mistral</strong>(巴黎)— 开源权重与托管模型,欧盟端点,可经 OpenRouter 访问。
            </li>
            <li>
              <strong>Aleph Alpha</strong>(海德堡)— 面向政府与受监管行业的主权部署。
            </li>
            <li>
              <strong>Silo AI / AMD</strong>(赫尔辛基)— Poro 与 Viking 模型系列,聚焦欧洲语言。
            </li>
            <li>
              <strong>OpenEuroLLM</strong> — 欧盟资助的多语种开源 LLM 联盟。
            </li>
            <li>
              <strong>LightOn</strong>(法国)— 企业 RAG 与本地部署。
            </li>
            <li>
              <strong>Hugging Face</strong> — 模型与数据集中心,欧盟托管 Inference Endpoints。
            </li>
          </ul>
        </Section>
        <Section icon={<GitCompare className="h-5 w-5" />} title="SaaS AI 对比隐私优先栈">
          <div className="not-prose overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">&nbsp;</th>
                  <th className="px-3 py-2 text-left font-medium">典型 SaaS AI</th>
                  <th className="px-3 py-2 text-left font-medium">Decoder (BYOK)</th>
                  <th className="px-3 py-2 text-left font-medium">Decoder(本地)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground [&_td]:px-3 [&_td]:py-2 [&_tr]:border-t [&_tr]:border-border">
                <tr>
                  <td className="text-foreground">谁持有模型密钥</td>
                  <td>供应商</td>
                  <td>您</td>
                  <td>不适用</td>
                </tr>
                <tr>
                  <td className="text-foreground">推理在何处运行</td>
                  <td>供应商云</td>
                  <td>您选择的提供方</td>
                  <td>您的机器</td>
                </tr>
                <tr>
                  <td className="text-foreground">需审计的子处理方</td>
                  <td>多</td>
                  <td>一个 (Decoder)</td>
                  <td>零</td>
                </tr>
                <tr>
                  <td className="text-foreground">基于您的数据训练</td>
                  <td>视套餐而定</td>
                  <td>否</td>
                  <td>否</td>
                </tr>
                <tr>
                  <td className="text-foreground">源码可用</td>
                  <td>少</td>
                  <td>MIT</td>
                  <td>MIT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
        <Section icon={<Users className="h-5 w-5" />} title="采购清单">
          <ul>
            <li>支持 BYOK 且无额外费用?</li>
            <li>采用宽松许可证(MIT / Apache 2.0)开源?</li>
            <li>凭证静态加密,算法有文档?</li>
            <li>书面承诺不基于客户数据训练?</li>
            <li>提供欧盟托管推理或本地推理路径?</li>
            <li>提供 DPA,子处理方清单公开?</li>
            <li>提示词与规则可审计?</li>
          </ul>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="常见问题">
          <dl className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-foreground">{f.q}</dt>
                <dd className="mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="相关指南">
          <ul>
            <li>
              <Link to="/docs/zh/eu-ai-act-code-analysis" className="text-foreground underline">
                欧盟 AI 法案与代码分析
              </Link>
            </li>
            <li>
              <Link to="/docs/zh/gdpr-ai-code-review" className="text-foreground underline">
                GDPR 与 AI 代码审查
              </Link>
            </li>
            <li>
              <Link to="/docs/open-source-ai-code-review" className="text-foreground underline">
                开源 AI 代码审查
              </Link>
            </li>
          </ul>
        </Section>
      </main>
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Decoder — open-source code understanding for the AI era.
        <div className="mt-2">
          <InstagramLink />
        </div>
      </footer>
    </div>
  );
}
