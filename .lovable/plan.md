# Verify decoderead.dev in Google Search Console

Google Search Console is now connected. Three steps to clear the `gsc` finding and unblock search performance data:

## 1. Request a META verification token
Call the Site Verification API through the connector gateway to get a `google-site-verification` token for `https://decoderead.dev/`.

## 2. Embed the token in the site head and publish
Add the verification meta tag to `src/routes/__root.tsx`'s `head().meta` so it renders in the SSR'd HTML at every URL (including `/`):

```tsx
{ name: "google-site-verification", content: "<TOKEN>" }
```

Then publish — Google fetches the live URL, so the tag has to be on the deployed site, not just the preview.

## 3. Verify and register the property
After publishing, call:
- `POST /siteVerification/v1/webResource?verificationMethod=META` to verify ownership
- `PUT /webmasters/v3/sites/<encoded-url>` to add `https://decoderead.dev/` as a property
- `PUT /webmasters/v3/sites/<encoded-url>/sitemaps/<encoded-sitemap-url>` to submit `https://decoderead.dev/sitemap.xml`

Then mark the `gsc:gsc` finding fixed.

## Out of scope (not GSC-related)
The other two remaining findings can't be fixed via GSC and don't need it:
- **Lighthouse performance (LCP)** — requires hero-image/font tuning + republish
- **Lighthouse accessibility (contrast + `<main>`)** — `<main>` was already added in the last SEO pass; contrast needs a rescan after publish

I can tackle those next as a separate pass if you'd like. For now this plan covers what the GSC connection actually unblocks.

## Notes
- Step 1 must run before step 2 (we need the token first).
- Step 3 must run after you publish (Google fetches the live URL).
- I'll pause after step 2 and ask you to publish before running step 3.
