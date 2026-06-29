# Launch Phase 3 — Content Index

All files in this directory. Posting order and timing below.

---

## Files

| File | Platform | Language | Notes |
|------|----------|----------|-------|
| `show-hn.md` | Hacker News (Show HN) | EN | Title + body post |
| `reddit-r-programming.md` | Reddit r/programming | EN | Self-post |
| `reddit-r-selfhosted.md` | Reddit r/selfhosted | EN | Self-post, Ollama focus |
| `reddit-r-cybersecurity.md` | Reddit r/cybersecurity | EN | Self-post, LockBit 3.0 case study |
| `product-hunt.md` | Product Hunt | EN | Tagline + description + first comment |
| `devto-crosspost.md` | Dev.to | EN | Full article, 800–1200 words |
| `awesome-lists-prs.md` | GitHub (8 Awesome lists) | EN | One-line entries + PR checklist |

---

## Posting order and timing

### Week 1 — Anchor content first

**Day 1 (Tuesday, 9:00–11:00 CET)**
1. **Dev.to article** (`devto-crosspost.md`)
   - Publish first. It becomes the canonical long-form reference you can link to from everywhere else.
   - Set the canonical URL on the article before publishing.

**Day 1 (same day, 17:00–19:00 CET)**
2. **Show HN** (`show-hn.md`)
   - HN traffic peaks Tuesday–Thursday. Post once; do not repost.
   - Monitor comments for the first 2–3 hours. Answer technical questions promptly.
   - Link to the Dev.to article in a top comment as "more context".

---

### Week 1 — Reddit (spread across 3 days to avoid spam signals)

**Day 2 (Wednesday)**
3. **r/programming** (`reddit-r-programming.md`)
   - Post at 09:00–11:00 EST (Reddit r/programming is US-heavy).
   - Do not cross-post the same body to other subreddits on the same day.

**Day 3 (Thursday)**
4. **r/cybersecurity** (`reddit-r-cybersecurity.md`)
   - The LockBit 3.0 case study is the hook. Lead with the results table.
   - Credit Gabriele Tita in the body.
   - Avoid framing it as promotion; frame it as a technical writeup.

**Day 4 (Friday)**
5. **r/selfhosted** (`reddit-r-selfhosted.md`)
   - r/selfhosted appreciates concrete setup steps. The 3-step Ollama setup in the post is the core of the pitch.

---

### Week 2 — Discovery and longtail

**Day 8–10**
6. **Product Hunt** (`product-hunt.md`)
   - Launch on a Tuesday or Wednesday. PH traffic peaks mid-week.
   - Prepare: profile photo, product logo, 3–5 screenshots, maker comment ready to post within the first 5 minutes of launch.
   - Notify any supporters in advance to upvote on launch day, not before.
   - The first comment text is in `product-hunt.md` — post it immediately after the listing goes live.

**Days 8–14 (rolling)**
7. **Awesome list PRs** (`awesome-lists-prs.md`)
   - Open PRs to all 8 lists during this window. Don't batch them all on the same day.
   - Suggested order: `awesome-static-analysis` → `awesome-malware-analysis` → `awesome-security` → `awesome-selfhosted` → `awesome-devsecops` → `awesome-cybersecurity-blueteam` → `awesome-privacy` → `awesome-ai-tools`.
   - High-value targets: `awesome-static-analysis` and `awesome-selfhosted` have the most traffic.

---

## Cross-linking rules

- Every post should link to `https://decoderead.dev` as the primary URL.
- Dev.to article is the long-form reference. Link to it from the Show HN top comment and the Product Hunt first comment.
- GitHub repo link: include in every post, but place it in comments (not the body) on platforms where external links reduce algorithmic reach (Reddit, HN).
- Gabriele Tita credit: include in r/cybersecurity, Product Hunt first comment, and Dev.to article. Tag on LinkedIn separately (see `marketing/social/linkedin-post-02-static-analysis.md`).

---

## What's not in this phase

- LinkedIn posts → see `marketing/social/`
- Instagram / Stories → see `marketing/social/`
- Email newsletter → not yet written
- Paid distribution → not planned (non-profit)
