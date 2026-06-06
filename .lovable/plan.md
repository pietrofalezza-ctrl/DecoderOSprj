# Phase 2 — Close the gaps from the original brief

Implement everything that is feasible inside Lovable Cloud. GitHub OAuth login is the only item that can't be done natively (Cloud's managed auth only supports Google/Apple); I'll add a clear UI note instead of pretending it works.

## 1. Fix lingering hydration mismatch (blocking)

The landing page still mismatches because `Sign in` (SSR) becomes `Accedi` (client) after `I18nBootstrap` swaps language post-mount. Fix by deferring the language swap to AFTER first paint AND re-rendering only translated nodes:
- Wrap `LangSwitcher` + all translated landing copy in a small `<Translated>` boundary that renders `null`/placeholders until mounted, OR
- Better: keep `I18nBootstrap` swap but mark the root tree with `suppressHydrationWarning` on the `<body>` and force a single post-mount re-render via a `key` bumped after mount. I'll use the second approach (one-line, no per-string wrapping).

## 2. Wire Local AI (Ollama / LM Studio) into the workspace

`user_local_endpoints` already saves base URL + default model. Add:
- Provider selector now includes saved local endpoints alongside cloud providers.
- New `src/lib/local-ai.client.ts` calls `${base_url}/api/chat` (Ollama) or `/v1/chat/completions` (LM Studio) directly from the browser — source code never reaches the De-coder server.
- Cache: hash file content + prompt; store result in `explanations` table via a thin server fn `saveLocalExplanation` (content sent, key never leaves browser).
- Footer in the AI panel: "Local mode — your code stays on your machine."

## 3. Markdown export

- Per-file: "Copy" + "Download .md" buttons in the AI panel for the current explanation.
- Per-repo: "Export all explanations" → server fn streams a zip of `<path>.md` files for every explanation the user owns in that repo. Uses `fflate` (already installed).

## 4. Suggested inline comments (read-only)

- New tab in the AI panel: **Suggested comments**.
- Server fn `suggestComments` prompts the model to return a JSON array `[{ line, comment }]` keyed to the current file.
- UI renders them next to the code (Monaco decorations) and offers "Copy patch" — never mutates stored files. Honors the brief's "original files never modified" rule.

## 5. Open-source hygiene

- `README.md` (EN, with IT + ZH short sections): what De-coder does, BYOK + local mode, quick start, contributing pointer.
- `LICENSE` — MIT (lightweight, fits "open-source" framing).
- `CONTRIBUTING.md` — basic dev setup, i18n key conventions, no PII in issues.
- Public roadmap inside README (Phase 1 ✅, Phase 2 in progress, Phase 3 deferred items).

## 6. Documentation pages (tri-lingual)

New top-level public routes (SSR-on, no auth) under `src/routes/docs.*`:
- `/docs` index
- `/docs/getting-started`
- `/docs/byok` (cloud keys)
- `/docs/local-ai` (Ollama/LM Studio)
- `/docs/security`
Content lives in i18n JSON namespaces `docs.<page>` for EN/IT/ZH. Each route sets its own `head()` title + description (also translated). Footer link added.

## 7. Light theme

- Add `light` token set to `src/styles.css` (currently dark-only).
- Theme toggle in `AppShell` header (sun/moon), persisted in `localStorage` under `decoder.theme`, applied via `document.documentElement.classList`.
- Defer system-preference auto-detect to avoid another SSR mismatch — explicit user toggle only.

## 8. Admin surface for `user_roles`

- New route `/_authenticated/admin` gated by a `beforeLoad` that calls a server fn `requireAdmin` (uses `has_role(auth.uid(),'admin')`).
- Lists users with their roles; allows promoting/demoting via a server fn that uses `supabaseAdmin`. Self-demotion blocked.
- A second migration adds an `INSERT/UPDATE/DELETE` policy on `user_roles` restricted to admins, plus a `make_admin` SQL helper for bootstrapping the first admin (instructions in README).

## 9. GitHub login — honest fallback

Add a disabled "Sign in with GitHub" button on `/auth` with a tooltip: "Coming soon — needs an external Supabase connection." Don't half-implement.

## What stays deferred (Phase 3)

GitHub repo sync (clone from URL), and the deeper analyses tabs from the brief: code-smell, dead-code, bug hints, architecture map, dependencies, security review, performance, maintainability. Each is its own prompt + UI surface and worth a dedicated phase.

## Technical notes

- No new tables. Two small migrations: (a) `user_roles` admin write policy, (b) RLS check.
- No new secrets. No new buckets.
- New files: `src/lib/local-ai.client.ts`, `src/lib/export.functions.ts`, `src/lib/admin.functions.ts`, `src/components/ThemeToggle.tsx`, `src/routes/docs.*.tsx`, `src/routes/_authenticated/admin.tsx`, `README.md`, `LICENSE`, `CONTRIBUTING.md`.
- Edited files: `src/i18n/locales/{en,it,zh}/common.json` (+ new `docs` keys), workspace route (local provider + comments tab + export), `AppShell` (theme toggle + docs link), `styles.css` (light tokens), `__root.tsx` (mount-key for i18n).

## Confirm before I build

1. License: **MIT** (recommended) or Apache-2.0?
2. Suggested-comments tab: ship in this phase, or move to Phase 3 with the other analyses?
