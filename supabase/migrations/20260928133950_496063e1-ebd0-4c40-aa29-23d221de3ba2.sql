REVOKE EXECUTE ON FUNCTION public.can_manage_class(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_class(uuid, text) TO authenticated, service_role;