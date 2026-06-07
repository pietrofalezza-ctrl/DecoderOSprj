## Problem

Saving a BYOK API key (OpenRouter, OpenAI, etc.) fails with `permission denied for table user_ai_credentials`. The settings page also can't list saved providers/endpoints.

## Root cause

The tables `user_ai_credentials`, `user_ai_credentials_safe` (view), and `user_local_endpoints` have **no GRANTs** to `authenticated` or `service_role`. Supabase's Data API requires explicit GRANTs on every public-schema table — RLS alone is not enough. Without them, every query returns "permission denied".

Verified via catalog: only `sandbox_exec` has SELECT/INSERT; `authenticated` and `service_role` have nothing.

## Fix

Single migration adding the missing grants. RLS policies already scope by `auth.uid()` (owner_id), so `anon` is intentionally excluded.

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_ai_credentials TO authenticated;
GRANT ALL ON public.user_ai_credentials TO service_role;

GRANT SELECT ON public.user_ai_credentials_safe TO authenticated;
GRANT ALL ON public.user_ai_credentials_safe TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_local_endpoints TO authenticated;
GRANT ALL ON public.user_local_endpoints TO service_role;
```

No code changes required. After the migration, saving/listing BYOK keys and local endpoints will work.
