GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_ai_credentials TO authenticated;
GRANT ALL ON public.user_ai_credentials TO service_role;

GRANT SELECT ON public.user_ai_credentials_safe TO authenticated;
GRANT ALL ON public.user_ai_credentials_safe TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_local_endpoints TO authenticated;
GRANT ALL ON public.user_local_endpoints TO service_role;