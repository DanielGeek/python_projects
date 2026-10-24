-- SPEC 15: Supabase Auth with email and password.
-- profiles holds the public username of each account; scores gets its owner (user_id).
-- Guests keep saving with user_id null and player = 'GUEST'. Signed-in users can only save under
-- their own user_id and username.

-- 1. One row per account. Only the trigger below writes it.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Z0-9_]{3,12}$' and username <> 'GUEST')
);
create unique index profiles_username_key on public.profiles (username);

alter table public.profiles enable row level security;

create policy "users read their own profile" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- 2. Create the profile when an account appears. The username comes from the sign-up metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, upper(btrim(new.raw_user_meta_data ->> 'username')));
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Lets the sign-up form say "Username taken" before calling signUp. The unique index is the authority.
create function public.username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where username = upper(btrim(name))
  );
$$;

revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- 4. Owner of a score. Null for guests and for every row created before this migration.
alter table public.scores
  add column user_id uuid references auth.users (id) on delete set null;

grant insert (user_id) on public.scores to anon, authenticated;

-- 5. Replace the open insert policy with one for guests and one for signed-in users.
drop policy "anyone can submit a score" on public.scores;

create policy "guests submit scores as GUEST" on public.scores
  for insert to anon
  with check (
    user_id is null
    and player = 'GUEST'
    and score between 0 and 9999999
  );

create policy "users submit their own scores" on public.scores
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and player = (select username from public.profiles where id = (select auth.uid()))
    and score between 0 and 9999999
  );
