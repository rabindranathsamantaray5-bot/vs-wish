-- Revoke public execution of security definer functions
revoke execute on function public.has_role(uuid, app_role) from public;
revoke execute on function public.handle_new_user() from public;

-- Explicitly grant execution to authenticated and service_role for has_role
grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.has_role(uuid, app_role) to service_role;

-- Grant execution to service_role for handle_new_user (auth trigger context)
grant execute on function public.handle_new_user() to service_role;
