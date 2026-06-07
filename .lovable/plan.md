# Cookie & Tracking Compliance Audit

## Audit results

Scanned the entire project for third-party analytics, marketing, profiling, heatmap and session-recording tools. **None are present.**

| Category | Found? |
|---|---|
| Google Analytics / GTM / gtag | No |
| Meta Pixel / Facebook SDK | No |
| LinkedIn Insight Tag | No |
| Hotjar | No |
| FullStory | No |
| PostHog | No |
| Plausible | No |
| Vercel Analytics | No |
| Mixpanel / Amplitude / Segment | No |
| Any third-party `<script>` in `index.html` | No (file is empty of external scripts) |
| `sessionStorage` usage | No |

The only `localStorage` and cookie usage is strictly necessary or functional:

| Key / cookie | Purpose | Category |
|---|---|---|
| Supabase auth cookies/tokens (`sb-*`) — `src/integrations/supabase/client.ts` | Authentication & session | Strictly necessary |
| `decoder.disclaimer.acceptedAt` — `src/routes/auth.tsx` | Auth-page disclaimer acknowledgement | Functional |
| `i18nextLng` (LANG_STORAGE_KEY) — `src/components/I18nBootstrap.tsx` | Language preference | Functional |
| `theme` — `src/components/ThemeToggle.tsx` | Dark/light theme preference | Functional |
| `user_acknowledgements` table (server-side, not a cookie) | BYOK + onboarding T&C record | Strictly necessary |

The only third-party network calls are to:
- Lovable Cloud / Supabase (backend the user signs into)
- The AI provider the user explicitly configures via BYOK (or their local model)

No profiling, no marketing, no analytics pixels, no heatmaps, no session recording.

## Conclusion

Under EU ePrivacy / GDPR guidance (and similar regimes), strictly necessary and purely functional storage tied to a user-requested feature **does not require prior consent or a cookie banner**. A short, transparent Cookie Policy page is sufficient.

**Recommendation: do not add a cookie banner.** Add a Cookie Policy page instead and link it from the footer and Privacy page.

## Changes to implement

1. **New route `src/routes/cookies.tsx`** — Cookie Policy page (EN/IT/ZH via i18n) covering:
   - Statement that Decoder uses only strictly necessary and functional storage, no profiling/marketing/analytics cookies, no third-party trackers.
   - Table of each item used (auth session, language, theme, auth-disclaimer ack, BYOK/onboarding ack), purpose, storage location (cookie / localStorage / server DB), retention, how to clear (browser settings / sign out / Settings page).
   - Note that AI provider calls go directly to the provider the user configures and are governed by that provider's policies (link to `/data-flow`).
   - Contact / how to exercise data rights (link to `/privacy`).
   - "Last updated" date and version.

2. **Add i18n strings** under a `cookies.*` namespace in `src/i18n/locales/{en,it,zh}/common.json`.

3. **Link the page** from:
   - `AppShell.tsx` footer (next to Privacy / Terms / Data Flow)
   - `src/routes/privacy.tsx` (cross-reference paragraph)
   - `src/routes/auth.tsx` disclaimer block

4. **Update `src/routes/privacy.tsx`** with one short paragraph: "Decoder does not use analytics, marketing, profiling or third-party tracking cookies. See the Cookie Policy for details." (link).

5. **Register route** — TanStack auto-generates `routeTree.gen.ts`; no manual edit.

No banner component, no consent store, no script-blocking logic — none are needed given the audit result.

## Files touched

- new: `src/routes/cookies.tsx`
- edited: `src/components/AppShell.tsx`, `src/routes/privacy.tsx`, `src/routes/auth.tsx`, `src/i18n/locales/{en,it,zh}/common.json`

## Final note

*Prepared for public demo with practical safeguards, not legally certified.*
