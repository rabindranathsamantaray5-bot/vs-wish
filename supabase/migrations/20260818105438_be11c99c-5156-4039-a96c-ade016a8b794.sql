-- Fix WARN 2 & 3: Revoke PUBLIC/AUTHENTICATED execute on SECURITY DEFINER functions
-- These functions are used by triggers or internal logic and shouldn't be callable directly by users.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Note: has_role was already restricted in the previous migration, but re-confirming here
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
