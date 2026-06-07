
-- Safe metadata view: exposes only non-sensitive columns, scoped to the caller.
CREATE OR REPLACE VIEW public.user_ai_credentials_safe
WITH (security_invoker = off) AS
SELECT id, owner_id, provider, key_hint, created_at, updated_at
FROM public.user_ai_credentials
WHERE owner_id = auth.uid();

REVOKE ALL ON public.user_ai_credentials_safe FROM PUBLIC;
REVOKE ALL ON public.user_ai_credentials_safe FROM anon;
GRANT SELECT ON public.user_ai_credentials_safe TO authenticated;
GRANT SELECT ON public.user_ai_credentials_safe TO service_role;

-- Defense-in-depth: ensure no Data-API role can ever read the raw table.
-- (No SELECT RLS policy exists, but this revokes the privilege outright.)
REVOKE SELECT ON public.user_ai_credentials FROM anon;
REVOKE SELECT ON public.user_ai_credentials FROM authenticated;
