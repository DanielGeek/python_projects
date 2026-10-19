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

interface GameRow {
  id: string;
  title: string;
  category: string;
  accent: string;
}

/** Rebuilds the `games` table by applying every migration in order: its inserts, then its deletes. */
function gamesAfterMigrations(dir: string, files: string[]): GameRow[] {
  const insertRow = /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
  let rows: GameRow[] = [];
  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    for (const [, block] of sql.matchAll(/insert into public\.games[^;]*?values([^;]*);/gi)) {
      for (const [, id, title, category, accent] of block.matchAll(insertRow)) {
        rows.push({ id, title, category, accent });
      }
    }
    for (const [, keep] of sql.matchAll(/delete from public\.games where id <> '([^']+)'/gi)) {
      rows = rows.filter((r) => r.id === keep);
    }
  }
  return rows;
}

describe("games table after the migrations", () => {
  const dir = join(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const rows = gamesAfterMigrations(dir, files);

  it("finds the games_and_scores migration", () => {
    expect(
      files.some((f) => f.endsWith("_games_and_scores.sql")),
      "no supabase/migrations/*_games_and_scores.sql",
    ).toBe(true);
  });

  it.each(GAMES.map((g) => [g.id, g] as const))("has %s as in lib/games.ts", (id, game) => {
    const row = rows.find((r) => r.id === id);
    expect(row, `${id}: not in the games table after ${files.join(", ")}`).toBeDefined();
    expect(row).toEqual({ id, title: game.title, category: game.category, accent: game.accent });
  });

  it("has no game that is missing from lib/games.ts", () => {
    const ids = new Set(GAMES.map((g) => g.id));
    expect(rows.filter((r) => !ids.has(r.id)).map((r) => r.id)).toEqual([]);
  });
});
