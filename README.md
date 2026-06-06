# De-coder

> Transform source code into human-readable knowledge.

De-coder is an open-source, multilingual application that helps developers, project managers, students, technical writers and organizations understand software codebases — whether written by humans or AI.

- 🌍 **Multilingual**: English, Italiano, 简体中文 — switch at any time.
- 🔑 **BYOK (cloud)**: OpenAI, Anthropic, Google Gemini, OpenRouter. Keys are encrypted at rest (AES-256-GCM) and never returned to the browser.
- 💻 **Local mode**: Ollama / LM Studio called directly from the browser — your source code never reaches our servers.
- 🛡️ **You own everything**: your code, your generated documentation, your suggested comments. We never train on user repositories.

---

### Italiano

De-coder è un'app open source e multilingua che trasforma il codice sorgente in conoscenza leggibile. Porta la tua chiave AI (cloud) oppure usa Ollama / LM Studio in locale — in modalità locale il codice non lascia mai la tua macchina.

### 简体中文

De-coder 是一款开源的多语言应用,把源代码转化为人人可读的知识。你可以自带云端 AI 密钥(OpenAI / Anthropic / Gemini / OpenRouter),也可以使用本地 Ollama / LM Studio —— 本地模式下源代码不会离开你的电脑。

---

## Quick start

1. Sign in (email/password or Google).
2. Create a project.
3. Upload a ZIP of any codebase.
4. Pick a file in the tree, choose a proficiency level and Human or Technical summary.
5. Click **Explain**.

## Tech stack

- TanStack Start (React 19 + Vite) on Cloudflare Workers
- Supabase (Postgres + Auth + Storage), RLS on every table
- Tailwind v4 + shadcn/ui
- i18next for runtime localization
- AES-256-GCM in a server function for BYOK key encryption

## Roadmap

- ✅ **Phase 1** — Foundation, auth, BYOK key vault, ZIP upload, three-pane workspace, EN/IT/ZH UI, AI explanations.
- ✅ **Phase 2** — Local AI (Ollama / LM Studio), Markdown export per file, light/dark theme, public docs route, OSS files.
- ✅ **Phase 3** — GitHub public-repo import, Quality (code-smell / dead-code / bug-hint) and Security analyses, repo-wide Markdown export, admin surface.
- ⏳ **Phase 4** — GitHub OAuth login, private-repo import with user PAT, suggested inline comments with diff export, deeper analyses (architecture, dependencies, performance, maintainability).

## Bootstrapping the first admin

The admin UI lives at `/admin` and is only visible to users with the `admin` role.
To promote the first administrator, run the following from the Lovable Cloud SQL editor (uses `service_role`):

```sql
SELECT public.promote_to_admin('you@example.com');
```

Subsequent admins can be promoted from the in-app `/admin` page.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Security

See [`SECURITY.md`](./SECURITY.md). TL;DR: BYOK keys encrypted at rest, no plaintext storage, RLS scoped to `auth.uid()` on every table, source code stays local in Local mode.

## License

[MIT](./LICENSE).
