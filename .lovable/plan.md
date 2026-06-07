# Harden RLS for `user_ai_credentials`

## Audit (current state)

| Table | RLS | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|---|
| `user_ai_credentials` | ✅ | ❌ no policy (denied) | ✅ `owner_id = auth.uid()` |
| `user_local_endpoints` | ✅ | ✅ owner-scoped | ✅ owner-scoped |
| `profiles` | ✅ | self | self |
| `projects`, `repositories`, `files`, `explanations` | ✅ | owner-scoped | owner-scoped |
| `user_roles` | ✅ | self + admin | admin-only |

All requirements 1, 4–7 are already satisfied at the schema level. The real gaps are:

- **A.** Two server functions (`analysis.functions.ts`, `explain.functions.ts`) read `encrypted_key` through the **user-scoped** `context.supabase`. With no SELECT policy on `user_ai_credentials`, those reads return zero rows → BYOK providers are effectively broken.
- **B.** `listProviders` and `exportMyData` read safe metadata (`provider, key_hint, updated_at`) through `context.supabase` and hit the same wall.
- **C.** No explicit "safe view" exists, so future code is tempted to either add a broad SELECT policy on the base table (leaking `encrypted_key`) or use the admin client from client-reachable paths.

## Fix

### 1. Migration — safe view, no broad SELECT policy

Add a SECURITY DEFINER style view (default `security_invoker=off`, owner = `postgres`) that filters by `auth.uid()` and exposes **only** non-sensitive columns. The base table keeps zero SELECT policies, so `encrypted_key` stays unreachable via PostgREST.

```sql
CREATE OR REPLACE VIEW public.user_ai_credentials_safe AS
SELECT id, owner_id, provider, key_hint, created_at, updated_at
FROM public.user_ai_credentials
WHERE owner_id = auth.uid();

REVOKE ALL ON public.user_ai_credentials_safe FROM PUBLIC, anon;
GRANT SELECT ON public.user_ai_credentials_safe TO authenticated;

-- Belt + braces: make sure no one ever grants SELECT on the base table to anon/authenticated.
REVOKE SELECT ON public.user_ai_credentials FROM anon, authenticated;
```

No change to existing INSERT/UPDATE/DELETE policies. No SELECT policy added to the base table.

### 2. Server code — decrypt path moves to admin client

In `src/lib/analysis.functions.ts` and `src/lib/explain.functions.ts`, replace:

```ts
const { data: cred } = await context.supabase
  .from("user_ai_credentials").select("encrypted_key")
  .eq("provider", data.provider).maybeSingle();
```

with an admin-client read **explicitly scoped to the authenticated user**:

```ts
const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
const { data: cred } = await supabaseAdmin
  .from("user_ai_credentials")
  .select("encrypted_key")
  .eq("owner_id", context.userId)
  .eq("provider", data.provider)
  .maybeSingle();
```

`context.userId` comes from `requireSupabaseAuth` (validated JWT), so this is functionally equivalent to RLS but executed server-only. The admin client never reaches the browser (already enforced by `client.server.ts` + `await import(...)` inside the handler).

### 3. Server code — metadata reads go through the safe view

- `src/lib/credentials.functions.ts` → `listProviders`: read from `user_ai_credentials_safe` instead of `user_ai_credentials`.
- `src/lib/account.functions.ts` → `exportMyData`: same swap; redaction guarantee is now enforced by the view, not by the column list.

Both keep using `context.supabase` (user-scoped). With `auth.uid()` inside the view definition the user only ever sees their own metadata.

### 4. Confirm requirements

1. Client cannot SELECT raw keys → no SELECT policy on base table, REVOKE on anon/authenticated.
2. Owner can still INSERT/UPDATE/DELETE own rows → unchanged policies.
3. Safe metadata exposed → `user_ai_credentials_safe` view.
4. Raw `encrypted_key` only readable via `supabaseAdmin` inside `.handler()`.
5. `DECODER_ENCRYPTION_KEY` already server-only (read in `crypto.server.ts`); no change.
6. `supabaseAdmin` imported only via `await import("@/integrations/supabase/client.server")` inside server handlers — never client code.
7. RLS verified on every user-data table (table above).
8. Safe view created and is the only client-facing read surface.

## Files touched

- **new** `supabase/migrations/<ts>_user_ai_credentials_safe_view.sql`
- **edit** `src/lib/credentials.functions.ts` (listProviders → safe view)
- **edit** `src/lib/account.functions.ts` (exportMyData → safe view)
- **edit** `src/lib/analysis.functions.ts` (decrypt read → supabaseAdmin, scoped by `owner_id`)
- **edit** `src/lib/explain.functions.ts` (same)
- **update** security memory: record that base-table SELECT is intentionally denied and the safe view is the only read surface.

## Out of scope

- No changes to `user_local_endpoints`, `profiles`, `projects`, `repositories`, `files`, `explanations`, `user_roles` — all already correctly scoped.
- No new `is_active` column (requirement 3 mentions "active status" but the current schema has no such field; keys are either present or absent). Adding it would be a feature change, not a security fix — skipping unless you want it added.
