-- SPEC 06: games and scores tables, read-only for the public key.
-- There is no insert, update or delete policy on purpose: with RLS on, those operations are
-- denied for anon and authenticated. Writing scores arrives with the auth spec.
-- The seed players below are invented. They exist so the Hall of Fame can be verified.

create table public.games (
  id         text primary key,
  title      text not null,
  category   text not null,
  accent     text not null,
  created_at timestamptz not null default now()
);

create table public.scores (
  id         uuid primary key default gen_random_uuid(),
  game_id    text not null references public.games (id) on delete cascade,
  player     text not null check (char_length(player) between 1 and 20),
  score      integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create index scores_game_score_idx on public.scores (game_id, score desc);

alter table public.games enable row level security;
alter table public.scores enable row level security;

create policy "games are public" on public.games
  for select to anon, authenticated using (true);

create policy "scores are public" on public.scores
  for select to anon, authenticated using (true);

-- Seed: every entry of GAMES in lib/games.ts.
insert into public.games (id, title, category, accent) values
  ('brick-buster', 'Brick Buster', 'Arcade',  'cyan'),
  ('drop',         'Drop',         'Puzzle',  'magenta'),
  ('serpent',      'Serpent',      'Arcade',  'green'),
  ('muncher',      'Muncher',      'Arcade',  'yellow'),
  ('invaders',     'Invaders',     'Shooter', 'green'),
  ('rocks',        'Rocks',        'Shooter', 'yellow'),
  ('asteroids',    'Asteroids',    'Shooter', 'cyan'),
  ('froggy',       'Froggy',       'Arcade',  'green'),
  ('pixel-duel',   'Pixel Duel',   'Versus',  'cyan');

-- Seed: scores only for the four playable games.
insert into public.scores (game_id, player, score, created_at) values
  ('brick-buster', 'NOVA_RIDER',  4820, now() - interval '2 days'),
  ('brick-buster', 'PIXELFOX',    4310, now() - interval '5 days'),
  ('brick-buster', 'ARCADIA',     3975, now() - interval '9 days'),
  ('brick-buster', 'BYTEWOLF',    3640, now() - interval '12 days'),
  ('brick-buster', 'LASERLUNA',   3220, now() - interval '3 days'),
  ('brick-buster', 'CRTKID',      2890, now() - interval '16 days'),
  ('brick-buster', 'MAGENTA_9',   2455, now() - interval '20 days'),
  ('brick-buster', 'OLDSCHOOL',   2110, now() - interval '7 days'),
  ('brick-buster', 'TURBOTAM',    1760, now() - interval '25 days'),
  ('brick-buster', 'COINCATCHER', 1295, now() - interval '1 day'),

  ('drop', 'STACKMASTER', 31200, now() - interval '1 day'),
  ('drop', 'LINEFIEND',   27450, now() - interval '4 days'),
  ('drop', 'BLOCKBARON',  24800, now() - interval '8 days'),
  ('drop', 'NOVA_RIDER',  21330, now() - interval '6 days'),
  ('drop', 'TETRAQUEEN',  18900, now() - interval '14 days'),
  ('drop', 'GRIDLOCK',    15760, now() - interval '11 days'),
  ('drop', 'PIXELFOX',    12480, now() - interval '19 days'),
  ('drop', 'ZEDPIECE',     9650, now() - interval '3 days'),
  ('drop', 'SLOWFALL',     6320, now() - interval '22 days'),
  ('drop', 'ROOKIE_01',    3150, now() - interval '2 days'),

  ('rocks', 'DEBRISDAN',   9870, now() - interval '3 days'),
  ('rocks', 'ORBITAL',     8420, now() - interval '6 days'),
  ('rocks', 'VOIDWALKER',  7390, now() - interval '10 days'),
  ('rocks', 'STARDRIFT',   6150, now() - interval '2 days'),
  ('rocks', 'COMETCHASER', 5240, now() - interval '15 days'),
  ('rocks', 'GRAVITYWELL', 4380, now() - interval '18 days'),
  ('rocks', 'PIXELFOX',    3510, now() - interval '5 days'),
  ('rocks', 'LUNARLEE',    2670, now() - interval '24 days'),
  ('rocks', 'BYTEWOLF',    1840, now() - interval '9 days'),
  ('rocks', 'NEWPILOT',     920, now() - interval '1 day'),

  ('asteroids', 'VOIDWALKER',  12640, now() - interval '2 days'),
  ('asteroids', 'STARDRIFT',   10980, now() - interval '4 days'),
  ('asteroids', 'NOVA_RIDER',   9450, now() - interval '7 days'),
  ('asteroids', 'DEBRISDAN',    8130, now() - interval '13 days'),
  ('asteroids', 'ORBITAL',      6970, now() - interval '1 day'),
  ('asteroids', 'LASERLUNA',    5820, now() - interval '17 days'),
  ('asteroids', 'COMETCHASER',  4560, now() - interval '21 days'),
  ('asteroids', 'ARCADIA',      3340, now() - interval '8 days'),
  ('asteroids', 'SPACEJOCKEY',  2210, now() - interval '3 days'),
  ('asteroids', 'ROOKIE_01',    1180, now() - interval '26 days');
