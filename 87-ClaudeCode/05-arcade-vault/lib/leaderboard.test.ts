import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GAMES } from "./games";
import { rowToEntry, submitScore, toScoreRow } from "./leaderboard";
import { createClient } from "./supabase/client";

vi.mock("./supabase/client", () => ({ createClient: vi.fn() }));

describe("rowToEntry", () => {
  it("maps player, score and created_at to a ScoreEntry", () => {
    expect(
      rowToEntry({ player: "NOVA_RIDER", score: 4820, created_at: "2026-10-17T09:00:00+00:00" }),
    ).toEqual({ player: "NOVA_RIDER", score: 4820, date: "2026-10-17T09:00:00+00:00" });
  });
});

describe("toScoreRow", () => {
  const input = { gameId: "asteroids", player: "ANA", score: 1200, userId: "user-1" };

  it("maps an account's input to the insert row with its user id", () => {
    expect(toScoreRow(input)).toEqual({
      game_id: "asteroids",
      player: "ANA",
      score: 1200,
      user_id: "user-1",
    });
  });

  it.each([undefined, null, ""])("saves a score without an account (%j) as GUEST", (userId) => {
    expect(toScoreRow({ ...input, userId, player: "ANA" })).toEqual({
      game_id: "asteroids",
      player: "GUEST",
      score: 1200,
      user_id: null,
    });
  });

  it("trims the name and cuts it to 20 characters", () => {
    expect(toScoreRow({ ...input, player: "  ANA  " })?.player).toBe("ANA");
    expect(toScoreRow({ ...input, player: "A".repeat(25) })?.player).toBe("A".repeat(20));
  });

  it("accepts the score bounds", () => {
    expect(toScoreRow({ ...input, score: 0 })?.score).toBe(0);
    expect(toScoreRow({ ...input, score: 9_999_999 })?.score).toBe(9_999_999);
  });

  it.each([
    ["an account with an empty name", { player: "" }],
    ["an account with a name of only spaces", { player: "     " }],
    ["a negative score", { score: -1 }],
    ["a score above the maximum", { score: 10_000_000 }],
    ["a decimal score", { score: 1.5 }],
    ["a NaN score", { score: Number.NaN }],
    ["an infinite score", { score: Number.POSITIVE_INFINITY }],
  ])("returns null for %s", (_label, patch) => {
    expect(toScoreRow({ ...input, ...patch })).toBeNull();
  });
});

describe("submitScore", () => {
  const input = { gameId: "asteroids", player: "ANA", score: 1200, userId: "user-1" };
  const insert = vi.fn();
  const from = vi.fn(() => ({ insert }));

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    insert.mockReset();
    from.mockClear();
    vi.mocked(createClient).mockReset();
    vi.mocked(createClient).mockReturnValue({ from } as never);
  });

  it("inserts the row into scores and resolves true", async () => {
    insert.mockResolvedValue({ error: null });
    await expect(submitScore(input)).resolves.toBe(true);
    expect(from).toHaveBeenCalledWith("scores");
    expect(insert).toHaveBeenCalledWith({
      game_id: "asteroids",
      player: "ANA",
      score: 1200,
      user_id: "user-1",
    });
  });

  it("resolves false when Supabase answers with an error", async () => {
    insert.mockResolvedValue({ error: { message: "new row violates row-level security policy" } });
    await expect(submitScore(input)).resolves.toBe(false);
  });

  it("resolves false instead of throwing when the request fails", async () => {
    insert.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(submitScore(input)).resolves.toBe(false);
  });

  it("resolves false instead of throwing when the client cannot be created", async () => {
    vi.mocked(createClient).mockImplementation(() => {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    });
    await expect(submitScore(input)).resolves.toBe(false);
  });

  it("sends a guest score as GUEST with no user id", async () => {
    insert.mockResolvedValue({ error: null });
    await expect(submitScore({ ...input, userId: undefined, player: "ANA" })).resolves.toBe(true);
    expect(insert).toHaveBeenCalledWith({
      game_id: "asteroids",
      player: "GUEST",
      score: 1200,
      user_id: null,
    });
  });

  it("does not send anything for an invalid score", async () => {
    await expect(submitScore({ ...input, player: "   " })).resolves.toBe(false);
    await expect(submitScore({ ...input, score: -5 })).resolves.toBe(false);
    expect(createClient).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
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
