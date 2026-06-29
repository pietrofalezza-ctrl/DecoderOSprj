# Plan: SEO rescan & OpenRouter rate-limit handling

## 1. SEO rescan
- Trigger a fresh `seo_chat` scan so findings reflect the latest changes (admin route, Settings credentials panel, audit-log UI, cleanup endpoint hardening, new copy on landing).
- After the scan completes (~1 min), review and fix any new failing findings, then mark them fixed.
- Confirm `/admin`, `/settings`, and other auth-gated routes remain excluded from `sitemap.xml`.

## 2. OpenRouter 429 — diagnose & improve UX
**Why it happens (most common, in order):**
1. **Free-tier daily/minute cap** on OpenRouter free models (`:free` suffix → ~20 RPM, ~50–200 RPD per key).
2. **402 / insufficient credits** on paid models with $0 balance (OpenRouter sometimes returns this as a rate error).
3. **Per-model RPM caps** (Anthropic/OpenAI via OpenRouter are stricter than the account default).
4. **Burst from parallel calls** — Chat + Static-explain + AI-Origin firing on the same key simultaneously across tabs.

**Code changes:**
- **Parse OpenRouter error envelope** in `src/lib/byok/*` (or wherever the BYOK fetch lives): extract `error.code`, `error.message`, and `X-RateLimit-*` / `Retry-After` headers; classify as `rate_limit_free_tier`, `rate_limit_model`, `insufficient_credits`, or `generic_429`.
- **Surface a clear toast/inline message** per class:
  - Free-tier → "Daily free-tier limit reached on OpenRouter. Wait until reset or add credits / switch model."
  - Credits → "OpenRouter key has no credits. Top up at openrouter.ai/credits."
  - Model RPM → "Model X is rate-limited (retry in Ns)." with countdown from `Retry-After`.
- **Add exponential backoff with jitter** (max 2 retries) on 429 in `FolderChatPanel`, AI-Origin, and Static-explain calls; disable the send button during cooldown.
- **Serialize concurrent BYOK calls** per key with a small in-memory queue so Chat + Explain don't fire in parallel against the same provider.
- **Log classified errors** to `analysis_activities` (already present) with `error_kind` for future debugging.

## 3. Verification
- Manual: trigger 25 quick chat sends with a free OpenRouter model in dev; confirm toast appears, button disables, retry resumes after `Retry-After`.
- Re-run SEO scan after toast copy changes (only landing/help text affected).

## Technical notes
- BYOK provider call lives in `src/lib/byok-openrouter.functions.ts` (server fn) — classify there; pass `errorKind` to the client via thrown `Error` with a structured `cause`.
- `Retry-After` may be seconds or HTTP-date; handle both.
- Don't change the request body shape per provider rules in `ai-models-using`.

No DB migration required.
