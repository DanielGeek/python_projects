import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GAMES } from "./games";
import { rowToEntry } from "./leaderboard";

describe("rowToEntry", () => {
  it("maps player, score and created_at to a ScoreEntry", () => {
    expect(
      rowToEntry({ player: "NOVA_RIDER", score: 4820, created_at: "2026-10-17T09:00:00+00:00" }),
    ).toEqual({ player: "NOVA_RIDER", score: 4820, date: "2026-10-17T09:00:00+00:00" });
  });
});

describe("games seed", () => {
  const dir = join(process.cwd(), "supabase/migrations");
  const file = readdirSync(dir).find((name) => name.endsWith("_games_and_scores.sql"));
  const sql = file ? readFileSync(join(dir, file), "utf8") : "";
  const block = sql.split("insert into public.games")[1]?.split(";")[0] ?? "";
  const rows = [
    ...block.matchAll(/\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g),
  ].map(([, id, title, category, accent]) => ({ id, title, category, accent }));

  it("finds the games_and_scores migration", () => {
    expect(file, "no supabase/migrations/*_games_and_scores.sql").toBeDefined();
  });

  it.each(GAMES.map((g) => [g.id, g] as const))("seeds %s as in lib/games.ts", (id, game) => {
    const row = rows.find((r) => r.id === id);
    expect(row, `${id}: missing from the games insert in ${file}`).toBeDefined();
    expect(row).toEqual({ id, title: game.title, category: game.category, accent: game.accent });
  });

  it("seeds no game that is missing from lib/games.ts", () => {
    const ids = new Set(GAMES.map((g) => g.id));
    expect(rows.filter((r) => !ids.has(r.id)).map((r) => r.id)).toEqual([]);
  });
});
