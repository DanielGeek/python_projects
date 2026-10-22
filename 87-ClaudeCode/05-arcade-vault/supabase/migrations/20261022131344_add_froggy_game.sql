-- SPEC GJ froggy-01: bring Froggy back to the catalog, written from scratch.
-- The SPEC 06 seed had it with accent 'green' and SPEC 08 deleted that row, so this insert does not
-- conflict. The SPEC 08 insert policy and the column grants already accept any game_id that exists
-- in `games`, so nothing else changes.
insert into public.games (id, title, category, accent)
values ('froggy', 'Froggy', 'Arcade', 'yellow');
