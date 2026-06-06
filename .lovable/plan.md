
# De-coder — Phase 1 Plan

A multilingual (IT / EN / 简体中文), dark-mode, open-source code-understanding app. Phase 1 lands the foundation end-to-end for one workflow: **upload a ZIP → browse files → get AI explanation at your chosen proficiency level**, using either a cloud BYOK provider or a local Ollama/LM Studio endpoint.

Future phases (not in this plan): GitHub sync, AI code-smell detection, suggestion review workflow, export to ZIP/Markdown/PR, additional proficiency outputs (architecture, dependencies, security, perf, maintainability — phase 1 ships only Human + Technical summaries).

---

## What ships in phase 1

### 1. Multilingual shell (IT / EN / ZH)
- `react-i18next` with locale JSON files for `en`, `it`, `zh`.
- Language switcher in the top bar; choice persisted to `localStorage` and to the user profile when logged in.
- Every visible string, toast, and error goes through `t()` — no hardcoded copy.

### 2. Dark-mode three-pane UI
Layout used on the workspace route:
```text
+----------------------------------------------------------+
| Top bar: logo · project picker · lang · user menu        |
+-----------+-----------------------------+----------------+
| Sidebar   |  Center: Code Viewer        |  Right Panel  |
| Projects  |  (Monaco, syntax highlight, |  AI tabs:     |
| Repos     |   read-only)                |  Human /      |
| File tree |                             |  Technical    |
+-----------+-----------------------------+----------------+
```
Sidebar = projects → repositories → file tree. Resizable panels. Dark by default, light theme available later.

### 3. Auth (Lovable Cloud)
- Email + password
- Google (managed)
- GitHub OAuth (needs Supabase dashboard config — I'll wire the code and tell you the redirect URL + steps to enable it in the Supabase provider settings; phase 1 only uses GitHub OAuth for login, not repo sync)
- `/auth` page with sign-in / sign-up tabs. Protected routes under `_authenticated/`.
- `profiles` table auto-created on signup (display name, preferred language, preferred proficiency level).

### 4. BYOK key vault (server-side encrypted)
- Table `user_ai_credentials` storing encrypted API keys per provider per user.
- Encryption with `pgsodium`/`vault` (AES-GCM via a server-held key); keys are decrypted only inside server functions, never sent back to the browser.
- Settings page lets a user add/remove keys for: OpenAI, Anthropic, Google Gemini, OpenRouter.
- Local mode: user saves an Ollama or LM Studio base URL (e.g. `http://localhost:11434`). For local mode, the AI call runs **in the browser** directly against localhost (so source code never reaches our server) — clearly labeled in the UI.

### 5. Projects + ZIP upload
- `projects` table (name, description, owner).
- `repositories` table (project_id, name, source = `zip`, created_at).
- `files` table (repository_id, path, size, language, sha256, storage_path).
- ZIP upload via Supabase Storage (private bucket `repositories`).
- Server function extracts the ZIP, walks entries, skips binaries / `node_modules` / `.git` / files > 1 MB, stores each text file as its own object and inserts a `files` row. Language inferred from extension.

### 6. File explorer + code viewer
- Tree built from `files.path`. Click a file → loads its content via a signed URL.
- Monaco editor, read-only, with syntax highlight by detected language. Original files never modified.

### 7. AI explanation
- Right panel has two tabs for phase 1: **Human summary** and **Technical summary**.
- Proficiency dropdown: Non-technical · Junior · Intermediate · Senior · Architect · CTO. Choice changes the system prompt.
- "Explain this file" button calls a server function:
  - Cloud mode: server function decrypts the user's key for the chosen provider and calls it (OpenAI / Anthropic / Gemini / OpenRouter). Source code is sent to the third-party provider the user chose — not stored, not logged, not used for training.
  - Local mode: browser calls the user's Ollama/LM Studio endpoint directly; server is bypassed.
- Response streamed token-by-token into the right panel and cached per (file sha, proficiency, type) in an `explanations` table so re-opening is instant.

### 8. Security baseline
- RLS on every table scoped to `auth.uid()`.
- API keys encrypted at rest, decrypted only in server functions.
- Storage bucket private; access via signed URLs.
- A small footer line in Settings: "De-coder never trains on your code. Your repositories and generated documentation belong to you."

---

## Technical section

**Stack confirmation:** TanStack Start (existing template) + React + TS + Tailwind + shadcn/ui + Lovable Cloud (Supabase). Monaco for the viewer. `react-i18next` for locales. `fflate` for in-browser/server ZIP extraction.

**Routes**
- `/` — marketing/landing (one screen, i18n, CTA to /auth)
- `/auth` — sign in / sign up
- `/_authenticated/dashboard` — projects list
- `/_authenticated/projects/$projectId` — repositories list, ZIP upload
- `/_authenticated/projects/$projectId/repos/$repoId` — three-pane workspace
- `/_authenticated/settings` — profile, language, BYOK keys, local endpoints

**Server functions (`*.functions.ts`)**
- `createProject`, `listProjects`
- `createRepositoryFromZip` (validates upload, extracts, inserts files)
- `listRepositoryFiles`, `getFileContentUrl`
- `saveAiCredential` (encrypts before insert), `listAiProviders` (returns which are configured, never the key)
- `explainFile` — streamed; takes `{ fileId, proficiency, type, provider }`, decrypts key, calls provider, persists into `explanations`, returns stream.

**Tables (all with RLS on `auth.uid() = owner_id`)**
`profiles`, `projects`, `repositories`, `files`, `explanations`, `user_ai_credentials`, `user_local_endpoints`. Plus `user_roles` + `has_role()` for future admin features (created now to avoid a refactor later).

**i18n file layout**
```text
src/i18n/
  index.ts
  locales/
    en/common.json
    it/common.json
    zh/common.json
```

**Explicitly deferred to later phases**
- GitHub repo sync, branch picking, pull-request export
- AI code smell / AI-generated detection, dead-code, bug hints
- Architecture / dependencies / security / perf / maintainability explanation tabs
- Suggested inline comments + accept/reject/edit review workflow
- Export to ZIP and Markdown docs
- Light theme polish, custom domain branding

---

## What I need from you before building
1. **GitHub OAuth**: I'll set up the code; you'll need to paste a Client ID/Secret into the Supabase auth provider config after I give you the callback URL. OK to proceed on that basis?
2. **Encryption approach**: I'll use Supabase Vault (`pgsodium`) to encrypt API keys. If you'd rather encrypt with a `LOVABLE`-stored master key in a server function instead, say so.

If both are fine, approving this plan will kick off phase 1 implementation.
