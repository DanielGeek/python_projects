-- SPEC 08: least privilege for the public roles.
-- Supabase grants every privilege on new public tables to anon and authenticated, and RLS is the
-- only thing that limits them. Revoke everything, then grant back only what the app uses, so a
-- missing or wrong policy can never open more than that. TRUNCATE, for example, ignores RLS.

revoke all on public.games from anon, authenticated;
grant select on public.games to anon, authenticated;

revoke all on public.scores from anon, authenticated;
grant select on public.scores to anon, authenticated;
-- id and created_at always come from the column defaults, so the browser never sets them.
grant insert (game_id, player, score) on public.scores to anon, authenticated;
