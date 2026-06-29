REVOKE SELECT ON public.user_ai_credentials FROM authenticated;
REVOKE SELECT ON public.user_ai_credentials FROM anon;
DROP POLICY IF EXISTS "own creds select" ON public.user_ai_credentials;