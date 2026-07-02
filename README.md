# De-coder

> Transform source code into human-readable knowledge.

> ⚠️ **Important / Importante / 重要提示**
>
> **EN** — Decoder is an open-source educational code-understanding case study. It is not a certified security audit tool, legal/compliance tool, or production decision system. AI-generated outputs may be inaccurate and must be reviewed by a qualified person. Use the demo only with public, demo or non-sensitive code. Do not upload employer-owned, confidential or third-party code unless you have full authorization.
>
> **IT** — Decoder è un case study open source e didattico per la comprensione del codice. Non è uno strumento di audit di sicurezza certificato, consulenza legale/compliance o decisione produttiva. Gli output generati dall'AI possono essere inaccurati e devono essere verificati da una persona qualificata. Usa la demo solo con codice pubblico, demo o non sensibile. Non caricare codice aziendale, riservato o di terzi senza piena autorizzazione.
>
> **ZH** — Decoder 是一个开源教育性代码理解案例研究。它不是经认证的安全审计工具、法律/合规工具或生产决策系统。AI 生成的输出可能不准确，必须由具备资质的人员进行审查。请仅使用公开、演示或非敏感代码测试演示版本。除非你拥有完整授权，否则不要上传雇主所有、机密或第三方代码。

## Intended use

- Educational exploration of source code.
- Code comprehension and onboarding support.
- Documentation drafting assistance.
- Maintainability and refactoring observations.
- AI-assisted learning.

## Not intended use

- Certified security audit.
- Legal or compliance advice.
- Production decision automation.
- High-risk AI decision-making.
- Automated employment, credit, insurance, health, law-enforcement or public-authority decisions.
- Replacing qualified human review.

---

De-coder is an open-source, multilingual application that helps developers, project managers, students, technical writers and organizations understand software codebases — whether written by humans or AI.

- 🌍 **Multilingual**: English, Italiano, 简体中文 — switch at any time.
- 🔑 **BYOK (cloud)**: OpenAI, Anthropic, Google Gemini, OpenRouter. Keys are encrypted at rest (AES-256-GCM) and never returned to the browser.
- 💻 **Local mode**: Ollama / LM Studio called directly from the browser for AI inference — file bodies are not sent to AI providers. Uploaded files still live in your private server storage.
- 🛡️ **You own everything**: your code, your generated documentation, your suggested comments. We never train on user repositories.

---

### Italiano

De-coder è un'app open source e multilingua che trasforma il codice sorgente in conoscenza leggibile. Porta la tua chiave AI (cloud) oppure usa Ollama / LM Studio in locale — in modalità locale il browser chiama direttamente la tua AI per l'inferenza; i contenuti dei file non vengono inviati ai provider AI, ma i file caricati restano nello storage privato del server.

### 简体中文

De-coder 是一款开源的多语言应用,把源代码转化为人人可读的知识。你可以自带云端 AI 密钥(OpenAI / Anthropic / Gemini / OpenRouter),也可以使用本地 Ollama / LM Studio —— 本地模式下浏览器直接调用本机的 AI 进行推理；文件内容不会被发送给 AI 服务提供商，但已上传的文件仍存放在你的私有服务器存储中。

---

## Quick start

1. Sign in (email/password or Google).
2. Create a project.
3. Upload a ZIP of any codebase (start with a demo / public repository).
4. Pick a file in the tree, choose a proficiency level and Human or Technical summary.
5. Click **Explain**.

## Tech stack

- TanStack Start (React 19 + Vite) on Cloudflare Workers
- Supabase (Postgres + Auth + Storage), RLS on every table
- Tailwind v4 + shadcn/ui
- i18next for runtime localization
- AES-256-GCM in a server function for BYOK key encryption

## Roadmap

- ✅ **Phase 1–3** — Foundation, BYOK vault (AES-256-GCM), local AI (Ollama / LM Studio), GitHub public-repo import, Static / Malware / AI-origin analyses, admin surface, per-file and repo-wide Markdown export, EN/IT/ZH UI.
- ✅ **Phase 4** — Folder-scoped repo chat, cross-session persistence of analyses, history timeline, transparent single-file upload (auto-wrapped as ZIP), static coverage extended to 20+ languages, "Explain with AI" over static/malware reports.
- ✅ **Phase 5** — Knowledge Hub (32 entries) + Knowledge Engine (opportunities, admin editor, GitHub webhook, translation tools), dynamic server-side sitemap, SEO clusters for EU / Northern Italy / India / Sri Lanka with hreflang across EN/IT/ZH/HI/TA.
- ✅ **Phase 6** — Security & compliance hardening: BYOK encryption, RLS on every table, cleanup endpoint gated by `CLEANUP_CRON_SECRET`, maintenance audit log, password reset with email 2FA, installable PWA, admin dashboards for consents and credentials status.
- ⏳ **Phase 7 (in progress)** — GitHub OAuth login, private-repo import with user PAT, suggested inline comments with diff export, deeper analyses (architecture, dependencies, performance, maintainability), VS Code companion.
- 🧭 **Phase 8 (design)** — Agent / plugin integration via **MCP (Model Context Protocol)** to expose Decoder tools to external agents, shared community rule library for AI-generated code smells, block-level provenance (Copilot / Cursor / ChatGPT).


Subsequent admins are managed from `/admin`.

## Run De-coder on your own machine

De-coder is a web app, but you can keep it entirely on your system. Three options, from easiest to most isolated:

### 1. Desktop app (Electron)

Packages the UI as a native window. Still talks to your backend (cloud or self-hosted) and to local LLMs.

```bash
bun install
bun run desktop:build           # produces electron-release/De-coder-<platform>-<arch>/
# Cross-compile:
bun run desktop:build -- --platform=darwin --arch=arm64
bun run desktop:build -- --platform=win32  --arch=x64
```

Dev loop: `bun run dev` in one shell, `bun run desktop:dev` in another.

### 2. Self-host with Docker

Build the TanStack Start server and run it on your own host. You need a reachable Supabase instance (cloud or `supabase start` locally).

```bash
docker build -t decoder .
docker run --rm -p 8080:8080 \
  -e SUPABASE_URL=... \
  -e SUPABASE_PUBLISHABLE_KEY=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e DECODER_ENCRYPTION_KEY=$(openssl rand -base64 32) \
  decoder
```

### 3. Local AI inference

In **Settings → Local providers**, configure Ollama (`http://localhost:11434`) or LM Studio (`http://localhost:1234`). Pick the local provider in the workspace and AI inference happens on your machine — file bodies are not sent to AI providers. Uploaded files still live in your private server storage (or in your self-hosted instance if you ran option 2 above).

## Configuration

Copy `.env.example` to `.env` (never commit `.env`) and fill in the values. Only the `SUPABASE_*` and `VITE_SUPABASE_*` publishable variables are needed for local dev; service-role and encryption keys are server-only and must never be exposed to the client bundle.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Security

See [`SECURITY.md`](./SECURITY.md). TL;DR: BYOK keys encrypted at rest, no plaintext storage, RLS scoped to `auth.uid()` on every table, and in Local AI mode file bodies are not sent to AI providers.

## License

[MIT](./LICENSE).
