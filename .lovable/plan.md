## Public-Release Readiness — Fix Plan

Audit summary (full report already produced): the consent flows, encryption, RLS, and disclaimers are in good shape. The main gaps are absolute "never leaves your machine" claims that contradict the fact that uploaded files live in server storage, a missing `/privacy` route, missing per-item deletion, no in-app disclaimer footer, and `.env` not git-ignored. Plan below applies practical safeguards across EN/IT/ZH without claiming legal certification.

### P0 — Repository hygiene

1. **`.gitignore`**: add `/.env` and `.env.*` patterns (keep `.env.example` allowed via negation). Note in `SECURITY.md` that the previously committed Supabase **publishable** key is non-secret by design but should be rotated if the repo was ever public.
2. **`.env.example`**: create with placeholder values mirroring the structure of current `.env` so contributors know the required vars without committing secrets.

### P1 — Wording corrections (absolute → qualified)

Replace every absolute privacy claim in **EN / IT / ZH** with the already-correct qualified form used in `manifesto.principles.localFirst.body` and `byokAck.body.p6`.

Targets (i18n keys):
- `landing.feature3Body`
- `settings.localIntro`
- `docs.localBody`
- `landing.heroSubtitle` (`"100% local"` → `"local-inference mode"` / equivalent IT/ZH)

Same fix in `README.md` (EN/IT/ZH blocks) and `og:description` meta in `src/routes/index.tsx` and `src/routes/auth.tsx` (`"fully local"` → `"local-inference"`).

Approved replacement (English; equivalents in IT/ZH):
> *"In local mode, AI inference runs in your own environment via Ollama / LM Studio; file bodies are not sent to AI providers. Uploaded files still live in your private server storage."*

### P1 — `/privacy` route

New `src/routes/privacy.tsx` that re-renders the GDPR / privacy sections of `terms.tsx` (factored into a small shared component `<PrivacyContent />` or imported from terms) so the canonical URL exists. Update:
- BYOK dialog "Privacy Policy" link → `/privacy`
- Onboarding step 8 "Terms / Privacy" → make hyperlinked (`<Link to="/terms">` and `<Link to="/privacy">`)
- Auth page disclaimer checkbox → add Privacy link
- Footer (landing, manifesto, terms, open-source pages) → add Privacy link next to Terms

### P1 — In-app footer disclaimer

Add a minimal footer inside `src/components/AppShell.tsx`:
- Renders `footer.disclaimer` (already translated in all 3 locales).
- Links: Terms · Privacy · Data flow · Manifesto.
- Visible on every authenticated route (dashboard, analysis, settings).

### P1 — Per-item deletion (GDPR Art. 17 granularity)

New server fns in `src/lib/projects.functions.ts` / `repos.functions.ts` / `explain.functions.ts`:
- `deleteProject({ projectId })` — cascades repos / files / explanations owned by the user, plus storage objects.
- `deleteRepository({ repoId })` — cascades files / explanations / storage.
- `deleteExplanation({ explanationId })`.

All scoped by `auth.uid() = owner_id` via existing RLS; admin client only for storage object removal.

UI:
- Add a delete (trash) button next to each project / repo / explanation in their existing list views.
- Confirmation dialog with `settings.deleteConfirm`-style copy.

### P1 — Onboarding step 8 links

Make the "Terms and Conditions" / "Privacy Policy" mentions in `OnboardingDialog.tsx` step 8 clickable (open in new tab), matching the BYOK dialog pattern.

### P2 — Terms / Privacy content gaps

Edit `src/i18n/locales/{en,it,zh}/common.json` and (if structural changes needed) `src/routes/terms.tsx`:
1. **Minors clause** — add to `terms.gdpr.*`: *"This demo is not directed at persons under 16; do not create an account if you are below that age."*
2. **IP / UA logging disclosure** — extend `terms.dataCollected.*` to mention that acknowledgement records and server logs may include IP address and user agent.
3. **Retention reconciliation** — unify the `dataCollected.content` (~60 days) note with `gdpr.retention` ("until deletion") into a single coherent statement.
4. **Intended / Not intended use** — add new `terms.intendedUseTitle` / `terms.intendedUseBody` and `terms.notIntendedUseTitle` / `terms.notIntendedUseBody` blocks rendered on Terms page, using the exact lists from the brief (educational / code comprehension / etc. vs employment / credit / health / law enforcement / etc.).
5. **Trademark reservation** — soften `terms.ownershipBody`: reserve informal rights over the "Decoder" name and logo even without registration.

### P2 — README hardening

Add `## ⚠️ Important / Importante / 重要提示` block near the top of `README.md`, in all three languages, containing:
- The exact global disclaimer text from the brief (`"Decoder è un case study open source e didattico …"` / EN / ZH).
- The "Public demo safety notice" (`"Use the demo only with public, demo or non-sensitive code…"` / IT / ZH).
- Bullet list of intended / not-intended use (same as Terms additions).
- Pointer to `SECURITY.md` and `/terms`, `/privacy`.

Also remove residual absolute claims from README local-mode bullets.

### P2 — `/data-flow` page

New `src/routes/data-flow.tsx` rendering three labelled flow diagrams (reuse `FlowNode` styling from `ByokAcknowledgementDialog`):
- **Local mode**: User code → Local model → Decoder UI.
- **Cloud BYOK**: Selected code/prompt → Decoder backend → Selected AI provider → Decoder UI.
- **GitHub**: User authorizes GitHub → Decoder imports selected repo content per granted scopes → User can delete imported project data.

Plus 4 warnings: don't upload secrets · remove `.env` · review provider terms · use demo repos first. Linked from footer (AppShell + landing) and from onboarding step 4.

### P3 — Misc copy

- Replace marketing use of `"audit" / "auditing"` in `auth.signInSubline` and `index.tsx` og:description with `"review" / "reviewing"` to avoid implying formal audit.
- `landing.osStrip.kicker` (`"100% Open Source"`) can stay — factually accurate.

### Final deliverable

After implementation, produce a structured report in the chat with:
- Issues found (mirroring audit table).
- Changes made (file list grouped by area).
- Remaining residual risks (e.g. controller is a private individual, no DPO).
- Suitability statement using the required phrase: **"Prepared for public demo with practical safeguards, not legally certified."**
- Per-scenario suitability: (a) private testing, (b) public portfolio demo, (c) real users with private repositories.

### Files affected (overview)

- **New**: `src/routes/privacy.tsx`, `src/routes/data-flow.tsx`, `.env.example`.
- **Edited (code)**: `.gitignore`, `README.md`, `SECURITY.md`, `src/components/AppShell.tsx`, `src/components/ByokAcknowledgementDialog.tsx`, `src/components/onboarding/OnboardingDialog.tsx`, `src/routes/index.tsx`, `src/routes/auth.tsx`, `src/routes/terms.tsx`, `src/lib/projects.functions.ts`, `src/lib/repos.functions.ts`, `src/lib/explain.functions.ts`, project/repo/explanation list components, settings page (links).
- **Edited (i18n)**: `src/i18n/locales/{en,it,zh}/common.json` (landing/settings/docs/terms/footer/data-flow/intended-use blocks).

### Out of scope

- No database migrations (existing `user_acknowledgements` table already covers the consent storage).
- No real legal review or DPO appointment — explicit in the residual-risk section.
- No content rewrite of `/manifesto` beyond what's required for consistency.
