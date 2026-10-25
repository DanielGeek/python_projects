-- SPEC 17. rls_auto_enable() is the SECURITY DEFINER body of the ensure_rls event trigger.
-- The app never calls it and the browser must not reach it over /rest/v1/rpc.
-- Postgres checks EXECUTE on a trigger function when the trigger is created, so the event trigger keeps working.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
