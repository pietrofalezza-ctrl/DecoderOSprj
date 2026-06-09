# Password Reset — Owner-Only

Supabase's `resetPasswordForEmail` already sends the recovery link only to the email registered on the account, so the owner of that inbox is the only one who can complete the flow. Adding a second email-delivered code on top of an email-delivered link does not add security (same channel, same attacker model) — so I will **not** add email 2FA to the reset flow. Instead I'll harden the flow so the link itself is owner-only and tamper-resistant.

If you want true 2FA, it has to be a *different* channel (TOTP authenticator app or SMS) — say the word and I'll plan that separately.

## What I'll build

### 1. "Forgot password" on `/auth`
- New "Forgot password?" link under the Sign In form.
- Small form: email input → calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${window.location.origin}/reset-password\` })`.
- Always shows the same neutral success message ("If an account exists for that email, we've sent a reset link") — never reveals whether the email is registered (prevents account enumeration).

### 2. New public route `/reset-password`
- Public route (not behind `_authenticated`) so the recovery link works.
- On mount: parse URL hash, confirm `type=recovery`. Supabase auto-creates a short-lived recovery session from the link.
- If no recovery session present → show "Invalid or expired link" + link back to Forgot Password.
- If valid: show "Set new password" form (new password + confirm). On submit → `supabase.auth.updateUser({ password })`, then `signOut()` and redirect to `/auth` with a "Password updated, please sign in" toast. Signing out invalidates any other sessions opened with the old password.

### 3. Owner-only hardening
- **Single channel guarantee:** reset link goes only to the address on `auth.users` — handled by Supabase.
- **Short link lifetime:** confirm Supabase recovery token TTL is set to a tight value (default 1 hour; I'll set it to 15 minutes via auth config).
- **Leaked-password check on the new password:** enable HIBP check (`password_hibp_enabled: true`) so the new password can't be a known-breached one.
- **No enumeration:** neutral success message regardless of whether the email exists.
- **Force re-auth after change:** `signOut()` after `updateUser` so the attacker (if any session was open) is kicked.

### 4. Branded recovery email (optional but recommended)
The default Supabase recovery email works. If you want it branded to DecoderRead, I'll scaffold auth email templates so the recovery email matches the app — this requires an email domain to be set up. Tell me if you want this; otherwise I'll skip it and use the default template.

## Files

- `src/routes/auth.tsx` — add "Forgot password?" link + inline forgot form (or a small tab).
- `src/routes/reset-password.tsx` — new public route, recovery-session detection, set-new-password form.
- Auth config update (HIBP on, recovery token TTL 15 min).

## Out of scope

- Email-channel "2FA" on top of an email reset link (redundant, not added).
- TOTP / SMS 2FA (separate feature — ask if you want it).
- Branded recovery email template (ask if you want it).

Confirm and I'll build it.
