-- Read-only checks for the production database (SPEC: dev -> prod migration).
-- Run through `scripts/supabase-prod.sh verify`, which compares each `key|value` row
-- with references/production/verify-prod.expected (taken from dev on 2026-11-03).
-- The expected file must be updated when a migration changes any of these values.
-- It can also be pasted into the Supabase SQL Editor of production and compared by eye.

select 'rls' as k, string_agg(c.relname || ':' || c.relrowsecurity, ',' order by c.relname) as v
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r'
union all
select 'policies', string_agg(tablename || '/' || policyname || '/' || cmd || '/' || array_to_string(roles, '+'), ' ; ' order by tablename, policyname)
  from pg_policies where schemaname = 'public'
union all
select 'grants', string_agg(table_name || '/' || grantee || '/' || privilege_type, ',' order by table_name, grantee, privilege_type)
  from information_schema.role_table_grants
 where table_schema = 'public' and grantee in ('anon', 'authenticated')
union all
select 'col_grants', coalesce(string_agg(table_name || '.' || column_name || '/' || grantee || '/' || privilege_type, ',' order by table_name, column_name, grantee), '')
  from information_schema.column_privileges
 where table_schema = 'public' and grantee in ('anon', 'authenticated') and privilege_type in ('INSERT', 'UPDATE')
union all
select 'fn_exec', string_agg(p.proname || ':' || coalesce((select string_agg(r.rolname, '+' order by r.rolname)
                                                              from pg_roles r
                                                             where r.rolname in ('anon', 'authenticated', 'public')
                                                               and has_function_privilege(r.oid, p.oid, 'execute')), '-'), ',' order by p.proname)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
union all
select 'games', string_agg(id, ',' order by id) from public.games
union all
select 'trg_auth', string_agg(tgname, ',' order by tgname)
  from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'auth' and not t.tgisinternal
union all
select 'event_trigger_ensure_rls', count(*)::text from pg_event_trigger where evtname = 'ensure_rls'
union all
select 'scores_rows', count(*)::text from public.scores
union all
select 'profiles_rows', count(*)::text from public.profiles
union all
select 'migrations', string_agg(version, ',' order by version) from supabase_migrations.schema_migrations;
