-- SPEC 16: OAuth users never type a username, so handle_new_user() generates one.
-- A valid, free username from the sign-up metadata (SPEC 15 email flow) is used unchanged.
-- Otherwise: base = provider name (user_name, name, or the part of the email before "@"),
-- upper-cased, characters outside [A-Z0-9] removed, cut to 7, plus "_" and 4 random digits (DANIEL_4821).
-- The unique index on profiles.username is the authority: a unique violation retries with new digits,
-- 10 times with the base, then 10 times with PLAYER, so the trigger never blocks a sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := upper(btrim(new.raw_user_meta_data ->> 'username'));
  base text;
  candidate text;
  attempt int := 0;
begin
  -- 1. Username given at sign-up, when it is valid and still free.
  if wanted is not null and wanted ~ '^[A-Z0-9_]{3,12}$' and wanted <> 'GUEST' then
    begin
      insert into public.profiles (id, username) values (new.id, wanted);
      return new;
    exception when unique_violation then
      null; -- taken: generate one below
    end;
  end if;

  -- 2. Generated username.
  base := left(
    regexp_replace(
      upper(coalesce(
        nullif(btrim(new.raw_user_meta_data ->> 'user_name'), ''),
        nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
        split_part(coalesce(new.email, ''), '@', 1)
      )),
      '[^A-Z0-9]', '', 'g'
    ),
    7
  );
  if base = '' or base = 'GUEST' then
    base := 'PLAYER';
  end if;

  loop
    attempt := attempt + 1;
    if attempt = 11 then
      base := 'PLAYER'; -- 10 collisions with the provider name: fall back
    end if;
    candidate := base || '_' || lpad(floor(random() * 10000)::int::text, 4, '0');
    begin
      insert into public.profiles (id, username) values (new.id, candidate);
      return new;
    exception when unique_violation then
      if attempt >= 20 then
        raise;
      end if;
    end;
  end loop;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
