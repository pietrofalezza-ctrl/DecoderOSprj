## 1. Make "install as web app" visible on the home page

Today the install hint only exists deep in the FAQ copy (`installTitle` / `installBody` in `en/common.json`). Surface it on the landing so visitors immediately understand Decoder is an installable PWA — no app store, no download.

- Add a new compact **"Install Decoder as an app"** band on `src/routes/index.tsx`, placed between the hero and the existing flow diagram so it shows in the first scroll on mobile.
- Content (EN / IT / ZH, added to all three locale files):
  - Title: "Install Decoder on your device"
  - Body: "It's a web app — no store, no download. Desktop: click the install icon in the address bar (Chrome/Edge/Brave). iOS Safari: Share → Add to Home Screen. Android Chrome: ⋮ → Install app."
  - Three small device chips (Desktop · iOS · Android) with their respective one-line instruction.
- Add a smart **"Install app"** button next to the existing "Get started" CTA that:
  - Listens for `beforeinstallprompt` and, when available, triggers `prompt()` directly (Chrome/Edge/Android).
  - Falls back to scrolling to the new install band (iOS Safari + browsers without the event), since iOS cannot be programmatically triggered.
  - Hides itself when `window.matchMedia('(display-mode: standalone)').matches` (already installed).
- Keep manifest-only PWA scope — no service worker added (per project PWA guidance).

## 2. Mobile-focused SEO refresh

Re-verify the routes that matter for the mobile-indexing pass and patch what's drifted since the last scan:

- Run `seo_chat--trigger_scan` and address every failing finding it returns (title length, meta description, OG/Twitter, canonical, JSON-LD, viewport, tap-target spacing).
- Verify per-route `head()` on `/`, `/auth`, `/terms`, `/history` etc. still self-references `https://decoderead.dev` in `canonical` + `og:url` (private routes stay `noindex`).
- Add the missing `twitter:card` / `twitter:title` / `twitter:description` tags on `/` (currently only OG tags are set) — required for proper mobile share previews on X and iMessage.
- Add `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, and `apple-mobile-web-app-status-bar-style` meta in `__root.tsx` so iOS treats the installed PWA correctly.
- Confirm `manifest.webmanifest` advertises proper 192/512 PNG icons (currently only the SVG favicon is declared, which Lighthouse PWA audit flags). Generate two PNG icons (192 + 512, maskable) and reference them.
- Re-check `public/sitemap.xml` against current routes; drop any auth-only paths and keep `/`, `/terms`, `/auth`.
- After fixes, call `seo_chat--update_findings` to close the items we patched.

## 3. Google "Decoder" search visibility — current state & improvements

What I can confirm right now:

- The Search Console connector returns **no verified property** for `decoderead.dev`, so I cannot pull live impressions/positions, and the URL inspector returns `PERMISSION_DENIED`. That means we don't currently have a way to see *exactly* how Google ranks the site for "Decoder".
- Public reality check: the unqualified query **"Decoder"** is extremely high-volume and dominated by huge incumbents (the rapper Logic's "Decoder", QR/barcode decoders, JSON decoder, video-codec decoders, Wikipedia). A new domain at AS ~0 will not rank for the bare word in the foreseeable future — that's expected, not a bug.
- Branded queries like **"Decoder dev"**, **"decoderead"**, **"decoderead.dev"**, **"Decoder AI code analysis"** are realistic short-term targets and the ones we should measure.

Improvements I'll implement / recommend:

1. **Verify the site in Google Search Console** through the connector flow (generate META token → embed in `__root.tsx` → call `/siteVerification/v1/webResource` → `PUT` the site). Until this is done we are flying blind.
2. **Submit `sitemap.xml`** once verified, and request indexing on `/`, `/terms`, `/auth`.
3. **Disambiguate the brand**: tighten the homepage `<h1>` and JSON-LD `name`/`alternateName` to "Decoder — AI code analysis" and add `alternateName: ["Decoder dev", "decoderead"]` in the `SoftwareApplication` schema so Google associates the bare brand with the site.
4. **Long-tail title rotation**: keep "AI code analysis & AI-generated code review" but add an Organization JSON-LD with `sameAs` pointing to the GitHub repo + LinkedIn / IG marketing accounts — strong sameAs signals are the cheapest way to win a brand SERP and earn a sitelink/knowledge panel.
5. **Internal anchor text**: ensure footer and nav consistently use the phrase "Decoder" (not just the logo) so on-page anchors reinforce the brand entity.
6. **External signals**: a single GitHub README mention and one LinkedIn post that links `decoderead.dev` with anchor text "Decoder" usually flips a brand SERP within 1–2 crawl cycles.

After (1) is done I'll be able to pull the real Search Console snapshot (impressions, positions, top queries, mobile vs desktop split) and act on actual data.

## 4. Deliverables

- Updated `src/routes/index.tsx` with install band + smart install button.
- New `src/hooks/use-pwa-install.ts` for `beforeinstallprompt` handling.
- Updated `src/routes/__root.tsx` with Twitter card + Apple PWA meta + (after verification) the `google-site-verification` token.
- Updated `public/manifest.webmanifest` with PNG icons; generated `public/icon-192.png` and `public/icon-512.png`.
- Updated EN / IT / ZH locale strings.
- Closed SEO findings after the rescan.
- Short report back to you with: Search Console verification outcome, the current top queries (if any data is already collected), and the prioritized improvement list.
