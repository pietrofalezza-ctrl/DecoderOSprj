## 1. Fix the mobile/PWA header overlap

The screenshot shows the iOS status bar (15:29, signal, battery) overlapping the "Decoder" logo. The sticky landing header doesn't reserve space for the iOS safe area when the app is launched as an installed PWA (or on notched devices in some browsers).

- Add `viewport-fit=cover` to the viewport meta in `src/routes/__root.tsx`.
- Pad the sticky header in `src/routes/index.tsx` and `src/components/AppShell.tsx` with `pt-[env(safe-area-inset-top)]` and matching left/right safe-area padding.
- Same treatment for the mobile Sheet menu, so it doesn't tuck under the notch.

## 2. Refresh homepage copy for the new capabilities

The landing page still implies BYOK/local-only and doesn't reflect what shipped recently. Update copy + the providers/features strip to mention:

- **Static code analysis & malware triage run with no API key** (offline heuristics; LockBit 3.0 case study referenced in marketing).
- **Expanded language support** (20+ languages: TS/JS, Python, Java, Rust, Go, SQL, C/C++, PHP, Ruby, Kotlin, Swift, …) and broader file-type coverage (source, ZIP folders, PE binaries).
- **Folder-scoped chat & persistent history** across sessions.
- **AI-powered explanation** of static/malware reports when a BYOK or local key is attached.

Touch points: hero subtitle, "What you get" / feature strip, providers section ("Works offline for static & malware · BYOK for AI explanations"), and the equivalent strings in `src/i18n/locales/{en,it,zh}/common.json`. The `LandingMockup` tab labels stay; only the surrounding copy and any "requires a key" wording change.

## 3. New `/contributors` page, auto-updating from GitHub

A public page listing every merged contribution, refreshed automatically — no manual list to maintain.

- New route `src/routes/contributors.tsx` (public, indexable).
- Data fetched via a `createServerFn` (`src/lib/contributors.functions.ts`) that calls the GitHub REST API for the Decoder repo:
  - `GET /repos/{owner}/{repo}/contributors` → avatar, handle, commit count, profile link.
  - `GET /repos/{owner}/{repo}/pulls?state=closed` filtered to `merged_at != null` → merged PR title, author, merge date, PR link.
  - Cached for ~10 min via TanStack Query `staleTime` + a server-side in-memory TTL to stay well under the 60 req/h unauthenticated GitHub limit. Optional `GITHUB_TOKEN` secret raises the limit if needed.
- UI: hero ("Built in the open"), contributors grid (avatar cards), then a reverse-chronological "Merged pull requests" timeline. Highlights Gabriele Tita's static/malware PR per the existing marketing tone.
- Footer + main nav link to `/contributors` (landing nav and `AppShell` footer).
- Each PR/contributor links out to GitHub, so nothing has to be hand-edited when a new PR merges.

## 4. SEO pass for the refreshed surface

- Update `<title>` / meta description / `og:*` on `/` and add full head on the new `/contributors` route, weaving in the new keywords: *AI code analysis*, *static code analysis*, *malware analysis*, *open-source code review*, *BYOK AI*, *local code analysis*.
- Add `/contributors` to `public/sitemap.xml` and to `public/llms.txt`.
- Run `seo_chat--trigger_scan` after the edits and resolve any remaining failing findings via `seo_chat--update_findings`.

## 5. Security check

- Run `security--run_security_scan` and `security--get_scan_results`.
- For the new server function: GitHub calls are read-only and public, but still validate inputs (none accepted from client), set a server-side rate-limit window, and avoid leaking any `GITHUB_TOKEN` to the client.
- Resolve / triage findings via `security--manage_security_finding`, updating `@security-memory` for anything intentionally ignored.

## Out of scope

- No changes to analysis logic, auth, or the workspace UI.
- No new database tables (contributors come live from GitHub).
- No publish — I'll surface a Publish action at the end so you can ship when ready.
