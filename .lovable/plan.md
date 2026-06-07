
# Pre-publish scan — Decoder

## Overall rating: **B (7.5 / 10)** — ready to publish after small cleanups

| Area | Score | Notes |
|---|---|---|
| SEO basics (title/desc/canonical/og) | 7/10 | Per-route head() everywhere; small dup/length issues |
| Sitemap / robots / llms.txt | 6/10 | Sitemap missing 5 public routes |
| Structured data (JSON-LD) | 6/10 | Only home + root carry it |
| Accessibility / semantic HTML | 8/10 | shadcn defaults, single `<main>` ok |
| Brand consistency (Lovable removal) | 6/10 | User-facing copy clean; infra refs remain (correct) but a few text/i18n leftovers |
| Domain consistency | 6/10 | Mix of `decoder.lovable.app` vs `decoderdev.lovable.app` |
| Security (backend scan) | 7/10 | 1 warn related to removed `LOVABLE_API_KEY` path — dead code to delete; 2 input-validation warns (zip size, zip-slip) |

---

## SEO findings (from scan)

1. **Root meta description = 163 chars** (>160). Shorten in `src/routes/__root.tsx`.
2. **Home `<title>` and `og:title` duplicate the root default.** Make `/` unique (e.g. add subtitle, drop the dash variant) so each route is distinct in SERPs.
3. **Sitemap missing routes**: `/auth`, `/contact`, `/cookies`, `/data-flow`, `/open-source`. Add to `public/sitemap.xml` (or migrate to dynamic `src/routes/sitemap[.]xml.ts` — **needs your confirmation**, since it changes the mechanism).
   - Note: `/auth` is already `Disallow`-ed in robots — exclude it from sitemap too.
4. **JSON-LD missing on content pages.** Add `Article` JSON-LD to `/manifesto` and `WebPage` JSON-LD to `/docs` and `/docs/how-to-review-ai-code`.
5. **No `og:image` anywhere.** Optional — skip unless you want me to generate a branded social card (1200×630).

## Brand / consistency inconsistencies

6. **Domain mismatch in JSON-LD**: `src/routes/__root.tsx:120` and `src/routes/index.tsx:62` use `https://decoder.lovable.app` while every canonical/og:url uses `https://decoderdev.lovable.app`. Pick one (recommend `decoderdev.lovable.app`, matches sitemap/robots) and align both JSON-LD blocks.
7. **Stale i18n keys** still present in `en/it/zh common.json` with empty strings:
   - `providers.lovable`, `lovableSection`, `lovableIntro`, `lovableBadge`, `managedAiTitle`, `managedAiBody`. Remove keys (nothing reads them) to avoid confusion in future edits.
8. **Terms/Privacy copy still references managed/server-managed AI** in `en/common.json` lines 172, 191, 849 ("default managed provider that uses a server-side key held by Decoder", "managed gateway"). Contradicts the new "BYOK / Local only" stance. Rewrite those three sentences in en + it + zh.
9. **`public/llms.txt`** lists "Lovable" as an example AI coder alongside Copilot/Cursor. Replace with "Claude Code" or remove — matches updated index head + docs page wording.
10. **`src/routes/__root.tsx` title is the root default** ("Decoder — Understand AI-generated code, in any language") and the home route repeats the same string verbatim → fixes finding #2 once you change one of them.

## Things that look like Lovable refs but should **stay**

- `src/integrations/lovable/index.ts` — platform auth SDK (Google sign-in goes through it).
- `src/lib/lovable-error-reporting.ts` — hooks into the Lovable runtime error capture; harmless if outside Lovable.
- `*.lovable.app` URLs — that's the actual hosting domain until a custom domain is connected.

## Security warnings to clear (backend scan)

11. **`quota_bypass_analysis`** — references `LOVABLE_API_KEY` + `assertLovableQuota`. These branches must already be dead after the BYOK-only refactor. Verify `analysis.functions.ts` and `analyzeRepoAiOrigin` no longer have any `provider === 'lovable'` branch and delete the leftover helper imports if any.
12. **`zip_base64_no_max`** — add `.max(35_000_000)` to the Zod field in `createRepositoryFromZip` (`src/lib/repos.functions.ts`).
13. **`zip_path_traversal`** — filter `..` segments and absolute paths in `extractZip` before writing/exporting.

---

## Proposed action set (single follow-up turn)

A. **SEO fixes** — root description shortened to ≤160; home title/og:title made unique; add JSON-LD to `/manifesto`, `/docs`, `/docs/how-to-review-ai-code`; align JSON-LD `url` to `decoderdev.lovable.app`.
B. **Sitemap** — add the 5 missing routes to `public/sitemap.xml` (keep static file; do **not** migrate unless you say so).
C. **i18n cleanup** — remove dead `lovable*`/`managedAi*` keys in en/it/zh; rewrite the 3 terms/privacy sentences that still mention managed AI.
D. **llms.txt** — replace "Lovable" with "Claude Code" in both lines.
E. **Security** — Zod `.max` on zip payload; path-traversal filter in `extractZip`; remove dead `lovable`-provider branches + `assertLovableQuota` imports if still present.
F. **Optional (ask first)** — generate a 1200×630 `og:image`; migrate sitemap to dynamic server route.

Please confirm (or pick a subset) and I'll implement in build mode. Tell me explicitly if you want F.A (og image) or F.B (dynamic sitemap).
