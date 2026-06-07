
-- Drop the previous SECURITY DEFINER-style view so we can rebuild with security_invoker=on.
DROP VIEW IF EXISTS public.user_ai_credentials_safe;

-- Add a normal owner-scoped SELECT policy on the base table.
CREATE POLICY "own creds read safe columns"
ON public.user_ai_credentials
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Column-level grants: authenticated can read metadata but NOT the encrypted key.
-- (REVOKE first to clean any prior table-level grant, then GRANT only safe columns.)
REVOKE SELECT ON public.user_ai_credentials FROM authenticated;
GRANT SELECT (id, owner_id, provider, key_hint, created_at, updated_at)
  ON public.user_ai_credentials TO authenticated;
-- encrypted_key is intentionally NOT granted to authenticated.
-- service_role retains ALL privileges (RLS + grants bypassed) for server-side decryption.

-- Recreate the safe view with security_invoker=on so it runs as the caller
-- and naturally inherits the column-level grants above.
CREATE VIEW public.user_ai_credentials_safe
WITH (security_invoker = on) AS
SELECT id, owner_id, provider, key_hint, created_at, updated_at
FROM public.user_ai_credentials;

REVOKE ALL ON public.user_ai_credentials_safe FROM PUBLIC;
REVOKE ALL ON public.user_ai_credentials_safe FROM anon;
GRANT SELECT ON public.user_ai_credentials_safe TO authenticated;
GRANT SELECT ON public.user_ai_credentials_safe TO service_role;
