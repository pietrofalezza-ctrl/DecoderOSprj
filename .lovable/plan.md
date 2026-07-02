Add the official Instagram profile (https://www.instagram.com/decoderead.dev) as a visible, consistent social link across the public site surfaces.

Scope

- Reusable icon: create `src/components/SocialLink.tsx` (or inline Instagram SVG icon) so every link uses the same mark and opens in a new tab with `rel="noreferrer"`.
- i18n: add `common.instagramUrl` to EN/IT/ZH/HI/TA locale files, and a `footer.instagram` label where a text label is needed.
- SEO: add the Instagram URL to the `sameAs` array in the root `WebSite` JSON-LD (`src/routes/__root.tsx`).
- Footers to update:
  - `src/routes/index.tsx` (main footer nav + mobile sheet)
  - `src/routes/open-source.tsx`
  - `src/routes/manifesto.tsx`
  - `src/routes/terms.tsx`
  - `src/routes/contact.tsx`
  - `src/routes/privacy.tsx`
  - `src/routes/cookies.tsx`
  - `src/routes/data-flow.tsx`
  - `src/routes/contributors.tsx` (beside GitHub repo link)
  - `src/routes/install.tsx` (add a minimal footer if missing)
  - `src/routes/auth.tsx` (add a small social/home link strip at the bottom of the auth card)
- Docs route minimal footers: add a centered "Follow us on Instagram" link to the existing simple footers of the generated SEO doc routes so the link is truly present throughout the site.
- Landing: optionally add a short "Follow updates" line in the Learn More section pointing to Instagram.
- Verify: build passes and a visual check confirms the Instagram icon/link renders on homepage and footer.
