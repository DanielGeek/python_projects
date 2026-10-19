-- SPEC 08: save Asteroids scores from the browser.
-- Only Asteroids stays in the catalog for now. Other games return with their own migration that
-- inserts their `games` row. There is still no update or delete policy on `scores`.

-- 1. The SPEC 06 seed is invented data: remove every score.
delete from public.scores;

-- 2. Only Asteroids stays in the catalog table. The foreign key on scores.game_id then accepts
--    scores for Asteroids only.
delete from public.games where id <> 'asteroids';

-- 3. The browser may set only these three columns. id and created_at always come from the defaults,
--    so a client cannot choose its own date or id.
revoke insert on public.scores from anon, authenticated;
grant insert (game_id, player, score) on public.scores to anon, authenticated;

-- 4. Insert policy with value checks. The table constraints (player 1..20 chars, score >= 0, FK on
--    game_id) keep running as well.
create policy "anyone can submit a score" on public.scores
  for insert to anon, authenticated
  with check (
    char_length(btrim(player)) between 1 and 20
    and score between 0 and 9999999
  );
