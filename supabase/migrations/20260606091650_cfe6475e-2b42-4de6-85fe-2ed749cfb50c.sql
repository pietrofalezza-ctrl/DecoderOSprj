REVOKE EXECUTE ON FUNCTION public.promote_to_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO service_role;