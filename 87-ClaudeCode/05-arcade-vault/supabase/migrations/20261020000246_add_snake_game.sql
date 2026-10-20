-- SPEC 11: add the new Snake game to the catalog.
-- The SPEC 08 insert policy and the column grants already accept any game_id that exists in
-- `games`, so nothing else changes.
insert into public.games (id, title, category, accent)
values ('snake', 'Snake', 'Arcade', 'green');
