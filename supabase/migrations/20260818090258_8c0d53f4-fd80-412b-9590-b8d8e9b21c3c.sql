-- Final attempt to revoke and grant execute explicitly
revoke all on function public.has_role(uuid, app_role) from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.has_role(uuid, app_role) from anon;
revoke all on function public.handle_new_user() from anon;

grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.has_role(uuid, app_role) to service_role;
grant execute on function public.handle_new_user() to service_role;
