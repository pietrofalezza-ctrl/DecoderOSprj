
## Goal
1. Implement **real single-file upload** (not just ZIP), wired through the existing pipeline.
2. Make the feature **coherent end-to-end**: project page UI/onboarding, T&C, docs, FAQ, JSON-LD, sitemap copy, plus the landing strip already shipped.
3. Run a **Playwright-based E2E coherence test** against the live preview to verify every claim on the landing page maps to a working flow.

## Part A — Single-file upload (real implementation)

### Approach: client-side zip wrap (zero new backend)
The server already validates and stores a ZIP via `createRepositoryFromZip`. The simplest, lowest-risk path:

1. Add **fflate** as a dependency (tiny, pure-JS, Worker-safe — already common in the stack).
2. In `src/routes/_authenticated/projects.$projectId.index.tsx`:
   - Widen the picker: `accept=".zip,.js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.java,.go,.rs,.c,.cc,.cpp,.h,.hpp,.cs,.rb,.php,.kt,.kts,.swift,.sql,.sh,.bash,.html,.css,.scss,.json,.yml,.yaml,.toml,.xml,.md,.txt,.vue,.svelte,.dart,.scala,.lua,.r"`.
   - On file pick: if extension is `.zip` → existing flow. Otherwise → wrap the file into an in-memory zip (`fflate.zipSync({ [file.name]: bytes })`) and call the same server-fn with `name = file.name.replace(/\.\w+$/, "")`.
   - Enforce the same 25 MB limit client-side with a clear toast before zipping.
3. **Drag & drop**: add a small drop zone on the project page header that accepts the same set. Reuses the same handler.
4. Update the button label/copy: split CTA into **Upload file or ZIP** + the existing **Import from GitHub**.
5. New i18n keys (EN/IT/ZH): `uploadFileOrZip`, `uploadFileOrZipHint`, `dropHere`, `fileTooLarge`, `unsupportedExtension`.

### No backend changes
- No new server-fn, no new table, no migration.
- The zip on the server still extracts to individual files — a single-file upload simply produces a one-entry repository.

## Part B — Coherence pass

Update every surface that today says "ZIP only" or omits single files:

- **Project page** (`projects.$projectId.index.tsx`): copy + tooltip + hint.
- **T&C** (`src/routes/terms.tsx`): in the "User content" / "Acceptable use" section, replace "ZIP archives" with "single source files, ZIP archives, or public Git URLs"; keep 25 MB cap explicit.
- **Docs** (`src/routes/docs.tsx` and `docs.how-to-review-ai-code.tsx`): add a "Supported inputs" subsection listing the three modes; update step-by-step to mention single-file path.
- **Landing JSON-LD** (`src/routes/index.tsx`): add "Single-file upload (20+ languages)" to `featureList`.
- **FAQ** (landing + JSON-LD): add a Q&A "Can I upload just one file?" → yes.
- **sitemap/llms.txt**: no URL changes; only update `llms.txt` description if it lists supported inputs.
- **Onboarding banner** on the empty project state ("Drop a file or a ZIP, or import a public Git repo…").

## Part C — Playwright E2E coherence run

Script under `/tmp/browser/coherence/` driving headless Chromium against `http://localhost:8080`:

1. **Landing → claims extraction**: load `/`, screenshot, assert presence of the Inputs strip (3 cards), FAQ items, "Install app" section, "AI code analysis" H1, single H1 count, JSON-LD parses.
2. **Auth restore** via `LOVABLE_BROWSER_SUPABASE_*` env (per browser-use rules).
3. **Project flow** (authenticated):
   - Create or open a project.
   - **Single-file upload**: pick a small `.py` from `/tmp` — assert navigation to the repo page and that 1 file is listed.
   - **ZIP upload**: build a tiny in-memory zip with 2 files via Python, upload it — assert file count = 2.
   - **GitHub import dialog**: open and assert the form renders (don't submit, to avoid hitting GitHub).
4. **Analysis modes** on the single-file repo:
   - Static scan: trigger and assert the report appears (no key required).
   - Malware: trigger and assert the report appears (no key required).
   - AI-origin: assert UI clearly states "BYOK required" when no key configured (the recent error-surfacing fix).
   - Chat tab: assert the panel renders and shows the "needs BYOK" guidance.
5. **History page**: open `/history`, assert recent activities show up.
6. **T&C / Docs / Contributors**: load each, check that copy mentions single-file support.
7. **Mobile pass**: re-run landing + project page at 375×667, screenshot, assert no horizontal scroll on the project page header.

Output: a markdown report at `/tmp/browser/coherence/report.md` summarizing pass/fail per check + thumbnail screenshots.

## Out of scope
- No new providers, no schema changes, no SEO rescan (copy delta is small; can rescan after).
- No streaming uploads, no chunked upload — 25 MB cap stays.
- No paid features.

## Verification checklist
- `tsgo --noEmit` clean.
- `fflate` installed.
- Manual: drop a `.py` from the project page → lands on a repo page with one file.
- Playwright report shows all green for ZIP, single file, static, malware; expected "BYOK required" surfaces for AI/Chat without a key.
