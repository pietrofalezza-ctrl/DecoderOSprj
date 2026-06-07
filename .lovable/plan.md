## Onboarding Wizard — Plan

Build a 9-step first-run onboarding for Decoder, available in IT / EN / ZH, auto-shown after first login, re-openable from Settings, and ending with a mandatory acknowledgement stored in `user_acknowledgements`.

### 1. Data model

Reuse existing `public.user_acknowledgements`. Add a new acknowledgement type alongside the existing `byok_cloud_ai`:

- `acknowledgement_type = "decoder_onboarding_byok_ai_notice"`
- New constant `ONBOARDING_TERMS_VERSION = "2026-06-07"` in `src/lib/onboarding.ts`.

No migration needed — table already has all required columns (`user_id`, `acknowledgement_type`, `accepted_terms_version`, `accepted_at`, `accepted_language`, `user_agent`, `ip_address`).

Onboarding "completed" = a row exists for the current user with this type AND the current version. Bumping the version re-triggers onboarding.

### 2. Server functions (`src/lib/onboarding.functions.ts`)

- `getOnboardingStatus()` — returns `{ completed: boolean, record | null, currentVersion }`. Auth-protected via `requireSupabaseAuth`.
- `recordOnboardingCompletion({ language })` — inserts row with IP + UA from request headers, `ON CONFLICT DO NOTHING`.

Both follow the same pattern as `byok-acknowledgement.functions.ts`.

### 3. Wizard UI (`src/components/onboarding/`)

- `OnboardingDialog.tsx` — full-screen modal `Dialog`, progress bar (Step N of 9), Back / Continue / Skip-for-now (except final), keyboard nav.
- Step components: `Step1Welcome`, `Step2Modes`, `Step3Provider`, `Step4Import`, `Step5Analysis`, `Step6Reader`, `Step7Review`, `Step8Acknowledge`, `Step9Start`.
- `DataFlowDiagram.tsx` — small SVG/CSS diagram showing Local vs Cloud BYOK flow (reuse style from BYOK dialog).
- All copy via `t("onboarding.step1.title")` etc. — no hard-coded strings.

Step-specific behavior:

- **Step 3** (Add provider) — optional. Renders provider cards (Ollama, LM Studio, OpenAI, Anthropic, Gemini, OpenRouter). Selecting one expands inline form (endpoint+model for local, API key for cloud) and calls existing `saveProviderKey` / `saveLocalEndpoint` server fns. "Skip for now" link advances without configuring. Cloud key save is already gated by existing BYOK ack — wizard pre-resolves the BYOK ack inline if needed (reuses existing `useByokAck`).
- **Step 4** (Import) — informational only in the wizard; the actual import lives in `/dashboard`. Buttons here are navigation shortcuts that close the wizard.
- **Steps 5 & 6** — informational cards listing options; no DB writes (user picks at actual analysis time).
- **Step 8** (Acknowledgement) — 5 mandatory checkboxes (none pre-checked). "Finish" button disabled until all 5 are true. On click → `recordOnboardingCompletion` → advances to Step 9.
- **Step 9** — three CTAs: "Start with demo project" → `/dashboard?demo=1`, "Add AI provider" → `/settings#providers`, "Go to dashboard" → `/dashboard`. Closes wizard.

### 4. Auto-trigger

New `OnboardingProvider.tsx` mounted inside `src/routes/_authenticated/route.tsx` (alongside `ByokAckProvider`). On mount, calls `getOnboardingStatus`; if `!completed`, opens `OnboardingDialog` non-dismissably (no Skip on final step, but earlier steps may be skipped — completion still requires Step 8). Exposes context `{ open, openOnboarding }`.

Until Step 8 is signed, `getOnboardingStatus.completed` stays false → wizard re-appears on next session. (Soft model — user can navigate the app but the dialog will re-prompt at next login.)

### 5. Settings entry point

In `src/routes/_authenticated/settings.tsx`, add a "Help & Onboarding" card with:
- Status line: "Onboarding completed on {date}, version {x}" or "Not completed".
- Button "Reopen onboarding" → `openOnboarding()` from context.

### 6. i18n

Add new `onboarding` block to `src/i18n/locales/{it,en,zh}/common.json` covering all step titles, copy, mode descriptions, provider names, analysis types, reader levels, the 5 acknowledgement checkboxes, CTAs, and Step 9 actions. Copy uses the exact IT/EN/ZH strings from the brief.

### 7. Files

**New:**
- `src/lib/onboarding.ts` (constant + type)
- `src/lib/onboarding.functions.ts` (server fns)
- `src/components/onboarding/OnboardingProvider.tsx`
- `src/components/onboarding/OnboardingDialog.tsx`
- `src/components/onboarding/DataFlowDiagram.tsx`
- `src/components/onboarding/Step1Welcome.tsx` … `Step9Start.tsx` (9 files)
- `src/hooks/use-onboarding.ts`

**Modified:**
- `src/routes/_authenticated/route.tsx` (mount provider)
- `src/routes/_authenticated/settings.tsx` (Help card)
- `src/i18n/locales/{en,it,zh}/common.json` (onboarding block)

### 8. Out of scope

- No new analysis logic — wizard only explains existing features.
- No changes to existing BYOK ack flow (kept independent; onboarding ack is a separate row type).
- No demo repo implementation (Step 9 CTA navigates to dashboard; actual demo seeding is a separate feature).
- No email notifications.

### 9. Bonus fix

The current runtime error (`Identifier 'requireAck' has already been declared`) appears to be a stale HMR artifact — no duplicate exists in source. Will verify after build; no source change planned unless reproduced.
