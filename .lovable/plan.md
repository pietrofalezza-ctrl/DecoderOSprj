## What you asked

1. Some pages still look off-center / overflow on mobile without pinching out.
2. Where is the new chat feature?
3. Are the new features reflected in SEO?
4. How much will Google ranking improve?
5. Saving an API key throws `new row violates row-level security policy for table "user_ai_credentials"`.

## 1. RLS error on API key save (the blocker)

Root cause: in the last security pass the SELECT policy on `user_ai_credentials` was dropped (to hide `encrypted_key` from clients and route reads through the `_safe` view). But `saveProviderKey` does an `upsert(...)` which issues an INSERT … RETURNING. PostgREST then re-checks the row against the SELECT policy — none exists → Postgres reports it as an RLS violation on insert. The row never lands.

Fix (safer of the two options):
- In `src/lib/credentials.functions.ts`, change the upsert to not return the row: `.upsert(..., { onConflict: "owner_id,provider", ignoreDuplicates: false }).select("provider", { head: true, count: "exact" })` — actually simplest: append `, { count: "exact" }` is wrong; the clean fix is to chain `.select()` off the safe view OR mark the upsert as returning minimal by NOT calling `.select()` and explicitly setting the PostgREST `Prefer: return=minimal` via `.select("provider").throwOnError()` from the safe view. The cleanest path is a small migration: add back a SELECT policy on `user_ai_credentials` scoped to `auth.uid() = owner_id` (data is already encrypted and per-owner; the safe view stays the canonical read path for any UI). This restores upsert+RETURNING and keeps the row owner-scoped — no cross-user exposure.

I'll go with the migration: re-add `CREATE POLICY "own creds select" ON public.user_ai_credentials FOR SELECT TO authenticated USING (auth.uid() = owner_id);` and update the security memory note so the next scan doesn't re-flag it (the encrypted column is still owner-only, and the app continues to read through `user_ai_credentials_safe`).

## 2. Mobile overflow on the project page

The dashboard cards render fine, but the "Demo1" header row, the analysis-mode pill and the two recharts (`Static scan distribution`, `Analysis activity mix`) overflow the 375px viewport — chart `BarChart` defaults to a fixed min width and the header uses `flex` without `min-w-0`/`truncate`.

Fix in `src/routes/_authenticated/projects.$projectId.index.tsx`:
- Header: wrap title row in `grid grid-cols-[minmax(0,1fr)_auto] sm:flex`, add `min-w-0 truncate` to the title, `shrink-0` to action buttons (per the responsive-layout pattern).
- Charts: wrap each `ChartContainer` in `<div className="w-full overflow-x-auto">` and set the chart `width="100%"` with a smaller `barCategoryGap` on mobile; reduce `YAxis width` to 80 on `<sm`.
- AppShell topbar: tighten the right-side cluster (theme + lang + avatar) with `gap-1 sm:gap-2` so it doesn't push the title off-screen on a 375px iPhone.

## 3. Where the chat lives + discoverability

The folder chat already exists — it's the "Chat" tab inside `FolderAnalysisPanel` (visible after you open a repo → select a folder). On mobile that tab is currently buried behind the stacked Files/Code/Insights tabs.

I'll:
- Promote "Chat" to a top-level tab in the mobile repo workspace alongside Files/Code/Insights.
- Add a "Chat with this repo" CTA button on the repo page header so users discover it without drilling into a folder.
- Add a short "Chat with your code" bullet to the homepage feature list and to `/docs`.

## 4. SEO — reflect the new functionality

The homepage subtitle already mentions static/malware/20+ languages/folder chat/history (previous turn). What's still missing:
- `/contributors` and the new chat/history capabilities aren't in `public/llms.txt` feature list or in JSON-LD `featureList`.
- No FAQ schema covering the new "AI code chat" / "persistent analysis history" queries.
- Internal links: homepage doesn't link to `/contributors` or `/history` (auth-only, but the public landing should advertise both as features).

I'll:
- Extend the homepage JSON-LD `SoftwareApplication.featureList` with: "AI code chat", "Persistent analysis history", "Static + malware analysis without API key", "Community contributors".
- Add a small FAQ block (with FAQPage JSON-LD) covering: "Can I chat with my code?", "Do I need an API key?", "Are my analyses saved?".
- Refresh `public/llms.txt` and `public/sitemap.xml` lastmod.
- Re-run `seo_chat--trigger_scan` after the edits.

## 5. Realistic ranking expectations

Honest answer (no code change): for the brand term **decoderead** you'll rank #1 within ~1–2 weeks once Search Console picks up the verified sitemap. For competitive heads like *"AI code analysis"* / *"AI code detector"* (KD 60–80, dominated by GitHub, Snyk, DeepCode, Sonar) the ceiling without backlinks is page 3–5 in 2–3 months. The new FAQ + chat content opens long-tail wins like *"chat with your codebase AI"*, *"static malware scan without API key"*, *"AI explainer for unknown code"* — those are reachable in 4–8 weeks. Real lift comes from backlinks (Product Hunt, dev.to writeups, the LinkedIn launch posts already drafted) — not from more on-page tweaks.

## Files I'll touch

- `supabase` migration: re-add owner-scoped SELECT policy on `user_ai_credentials`.
- `src/routes/_authenticated/projects.$projectId.index.tsx`: mobile header + chart overflow.
- `src/components/AppShell.tsx`: tighten topbar gaps on small screens.
- `src/routes/_authenticated/projects.$projectId.repos.$repoId.tsx`: surface Chat tab + repo-level "Chat with repo" CTA.
- `src/routes/index.tsx`: extend JSON-LD featureList, add FAQ section + FAQPage JSON-LD, link to `/contributors`.
- `src/i18n/locales/{en,it,zh}/common.json`: strings for the FAQ + CTA.
- `public/llms.txt`, `public/sitemap.xml`: update.
- Security memory: note that owner-scoped SELECT on `user_ai_credentials` is intentional (encrypted column, per-owner).
- Then: SEO rescan.

No business-logic changes beyond the RLS migration; everything else is presentation + metadata.