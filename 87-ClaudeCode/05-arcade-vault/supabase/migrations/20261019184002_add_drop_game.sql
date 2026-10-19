-- SPEC 09: bring Drop back into the catalog.
-- Same values as the SPEC 06 seed row. The SPEC 08 insert policy and the column grants already
-- accept any game_id that exists in `games`, so nothing else changes.
insert into public.games (id, title, category, accent)
values ('drop', 'Drop', 'Puzzle', 'magenta');
