# Phase 1 — Finish & Harden

The foundation (DB, auth, i18n, three-pane workspace, server fns for credentials/projects/repos/explain) is in place. This plan closes the remaining gaps so an end-to-end flow works: sign in → save API key → create project → upload ZIP → browse files → get explanation in EN/IT/ZH.

## 1. Fix runtime errors (blocking)

- **Hydration mismatch on `LangSwitcher`**: SSR renders `en`, client renders `it`. Cause: i18n language is read from `localStorage`/browser at hydration. Fix by:
  - Render the language label only after mount (guarded `useEffect` + state), or wrap the switcher trigger in `<ClientOnly>`.
  - Keep i18n init deterministic on server (always `en` during SSR), let client switch post-hydration.
- **"SSR rendering failed" / dynamic import failure**: likely caused by a server-only import leaking into a client-reachable module. Audit imports of `*.server.ts` from `.functions.ts` (must be `await import(...)` inside handlers, not top-level). Fix any offenders.

## 2. Settings page: BYOK key vault UI

`src/routes/_authenticated/settings.tsx` currently is a stub. Build:
- List configured providers (OpenAI, Anthropic, Gemini, OpenRouter) with key hint (`sk-…abcd`) and "Replace" / "Remove" actions.
- "Add key" form per provider — calls `saveCredential` server fn (already exists) which encrypts via `crypto.server.ts`.
- Local AI section: list/add `user_local_endpoints` (Ollama / LM Studio) with base URL + default model. Pure browser-side use; nothing leaves the machine.
- Preferred language + proficiency saved on `profiles`.
- All copy via i18n (EN/IT/ZH).

## 3. Projects + ZIP upload flow

- `_authenticated/dashboard.tsx`: list projects (already wired) + "New project" dialog (name, description).
- Project detail (`projects.$projectId.tsx`): list repositories + ZIP upload dropzone.
  - Client reads file → posts to a server fn that streams to Supabase Storage `repositories` bucket → server fn extracts via `fflate` (`zip.server.ts`) → inserts `files` rows with sha256 + storage_path.
  - Show progress + per-file count on completion. Toast on error.
- Open repo navigates to the existing workspace route.

## 4. Workspace polish

- File tree: persist expanded folders per repo (localStorage).
- Code viewer: language detection by extension; read-only confirmed.
- AI panel:
  - Two tabs: **Human summary** / **Technical summary** (proficiency selector drives prompt).
  - Provider selector lists only configured providers (+ local endpoints).
  - "Explain" button calls `explainFile` server fn (cloud) or browser-side fetch to `http://localhost:11434` (Ollama) when local mode is selected. Cache hits served from `explanations` table.
  - Localized output: prompt instructs the model to answer in the user's `preferred_language`.
  - Footer line: "Your code is never used for training." (i18n).

## 5. i18n coverage

- Add missing keys for settings / dashboard / upload / errors across `en`, `it`, `zh`.
- Verify `LangSwitcher` updates `profiles.preferred_language` server-side too.

## 6. Security & RLS sanity check

- Confirm RLS on all 7 tables scopes to `auth.uid()` (already done).
- Confirm `user_ai_credentials` has NO SELECT policy (already correct — keys only decrypted server-side).
- Storage policies on `repositories` bucket: owner-only read/write via path prefix `{user_id}/...`.
- Add a brief `SECURITY.md` note in repo: BYOK, encryption-at-rest, no-training pledge.

## Technical details

- Files to add/edit (no DB schema changes needed):
  - `src/components/LangSwitcher.tsx` — hydration-safe render.
  - `src/routes/_authenticated/settings.tsx` — full UI.
  - `src/routes/_authenticated/dashboard.tsx` — "New project" dialog.
  - `src/routes/_authenticated/projects.$projectId.tsx` — upload UI.
  - `src/lib/repos.functions.ts` — `uploadZip` server fn (multipart or base64-chunked).
  - `src/lib/profile.functions.ts` — `updatePreferences`.
  - `src/components/AIPanel.tsx` (split out of workspace) — provider/proficiency/tabs.
  - `src/lib/local-ai.client.ts` — browser-side Ollama call.
  - `src/i18n/locales/{en,it,zh}/common.json` — new keys.
- No new secrets, no new tables, no new buckets.

## Deferred (still out of scope)

GitHub repo sync, light theme, code-smell / dead-code / bug-hint / architecture / dependency / security / perf / maintainability tabs, suggested-comment review workflow, export to ZIP/MD/PR.

## Open question

GitHub OAuth: not natively supported by Lovable Cloud's managed auth. Options:
1. Skip GitHub login for Phase 1 (Email + Google only) — recommended, fastest.
2. Migrate auth to direct Supabase integration so GitHub provider can be enabled in the Supabase dashboard.

Pick (1) unless you tell me otherwise.
