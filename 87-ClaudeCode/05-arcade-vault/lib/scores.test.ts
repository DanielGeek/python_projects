import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFakeWindow, type FakeStorage } from "./test-support";

const KEY = "arcade-vault:scores:tetris";
let storage: FakeStorage;

// The module keeps state (cache and unsaved lists), so every test loads a fresh copy.
async function load() {
  vi.resetModules();
  return import("./scores");
}

const entry = (player: string, score: number, date = "2026-10-17T09:00:00.000Z") => ({
  player,
  score,
  date,
});

beforeEach(() => {
  storage = installFakeWindow();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("readScores / saveScore", () => {
  it("returns an empty list when nothing is stored", async () => {
    const { readScores } = await load();
    expect(readScores("tetris")).toEqual([]);
  });

  it("saves scores best first", async () => {
    const { saveScore, readScores } = await load();
    saveScore("tetris", entry("A", 10));
    saveScore("tetris", entry("B", 30));
    saveScore("tetris", entry("C", 20));
    expect(readScores("tetris").map((e) => e.player)).toEqual(["B", "C", "A"]);
  });

  it("keeps only the top 50", async () => {
    const { saveScore, readScores } = await load();
    for (let i = 1; i <= 55; i++) saveScore("tetris", entry(`P${i}`, i));
    const list = readScores("tetris");
    expect(list).toHaveLength(50);
    expect(list[0].score).toBe(55);
    expect(list[49].score).toBe(6);
  });

  it("returns the same array while the stored value is unchanged", async () => {
    const { saveScore, readScores } = await load();
    saveScore("tetris", entry("A", 10));
    expect(readScores("tetris")).toBe(readScores("tetris"));
  });

  it("ignores stored data that is not a list", async () => {
    storage.data.set(KEY, "{}");
    const { readScores } = await load();
    expect(readScores("tetris")).toEqual([]);
    expect(console.warn).toHaveBeenCalled();
  });

  it("ignores unparseable stored data", async () => {
    storage.data.set(KEY, "not json");
    const { readScores } = await load();
    expect(readScores("tetris")).toEqual([]);
  });

  it("drops malformed entries and keeps the valid ones", async () => {
    storage.data.set(
      KEY,
      JSON.stringify([
        entry("OK", 5),
        { player: "NaN", score: "9", date: "2026-10-17" },
        { player: 1, score: 9, date: "2026-10-17" },
        { player: "NoDate", score: 9 },
        null,
        entry("BEST", 50),
      ]),
    );
    const { readScores } = await load();
    expect(readScores("tetris").map((e) => e.player)).toEqual(["BEST", "OK"]);
    expect(console.warn).toHaveBeenCalledWith("[scores] dropped 4 invalid entries");
  });

  it("returns an empty list when storage is blocked", async () => {
    storage.failReads = true;
    const { readScores } = await load();
    expect(readScores("tetris")).toEqual([]);
  });

  it("reports a failed write and still serves the score for this page view", async () => {
    storage.failWrites = true;
    const { saveScore, readScores } = await load();
    expect(saveScore("tetris", entry("A", 10))).toBe(false);
    expect(readScores("tetris")).toEqual([entry("A", 10)]);
  });

  it("returns true and notifies subscribers when the write succeeds", async () => {
    const { saveScore } = await load();
    const listener = vi.fn();
    window.addEventListener("arcade-vault:scores", listener);
    expect(saveScore("tetris", entry("A", 10))).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("topPlayersToday", () => {
  const now = new Date(2026, 9, 17, 12, 0, 0);
  const at = (day: number, hour: number) => new Date(2026, 9, day, hour).toISOString();

  it("keeps the best score per player among today's entries", async () => {
    const { topPlayersToday } = await load();
    const all = [
      { ...entry("A", 10, at(17, 9)), gameId: "tetris" },
      { ...entry("A", 40, at(17, 10)), gameId: "rocks" },
      { ...entry("B", 25, at(17, 11)), gameId: "drop" },
      { ...entry("C", 99, at(16, 23)), gameId: "drop" },
      { ...entry("D", 99, "not a date"), gameId: "drop" },
    ];
    expect(topPlayersToday(all, now)).toEqual([
      { player: "A", score: 40, gameId: "rocks" },
      { player: "B", score: 25, gameId: "drop" },
    ]);
  });

  it("honours the limit", async () => {
    const { topPlayersToday } = await load();
    const all = ["A", "B", "C"].map((p, i) => ({
      ...entry(p, i + 1, at(17, 9)),
      gameId: "tetris",
    }));
    expect(topPlayersToday(all, now, 2).map((p) => p.player)).toEqual(["C", "B"]);
  });
});

describe("timeAgo", () => {
  const now = new Date(2026, 9, 17, 12, 0, 0);
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it.each([
    [30_000, "just now"],
    [2 * 60_000, "2 min ago"],
    [3 * 3_600_000, "3 h ago"],
    [2 * 86_400_000, "2 d ago"],
  ])("formats %i ms as %s", async (ms, expected) => {
    const { timeAgo } = await load();
    expect(timeAgo(ago(ms), now)).toBe(expected);
  });

  it("falls back to a formatted date after 7 days", async () => {
    const { timeAgo, formatDate } = await load();
    const iso = ago(8 * 86_400_000);
    expect(timeAgo(iso, now)).toBe(formatDate(iso));
  });
});

describe("purgeRemovedGameScores", () => {
  const list = JSON.stringify([entry("A", 10)]);

  it("removes the score lists of games that are not in GAMES", async () => {
    storage.data.set("arcade-vault:scores:retired-game", list);
    storage.data.set("arcade-vault:scores:rocks", list);
    storage.data.set("arcade-vault:scores:tetris", list);
    const { purgeRemovedGameScores } = await load();
    purgeRemovedGameScores();
    expect([...storage.data.keys()]).toEqual([]);
  });

  it("keeps the scores of games in GAMES, the session and the credits", async () => {
    storage.data.set("arcade-vault:scores:asteroids", list);
    storage.data.set("arcade-vault:scores:retired-game", list);
    storage.data.set("arcade-vault:session", '{"name":"ANA","guest":false}');
    storage.data.set("arcade-vault:credits", "3");
    storage.data.set("unrelated", "x");
    const { purgeRemovedGameScores } = await load();
    purgeRemovedGameScores();
    expect([...storage.data.keys()].sort()).toEqual([
      "arcade-vault:credits",
      "arcade-vault:scores:asteroids",
      "arcade-vault:session",
      "unrelated",
    ]);
  });

  it("notifies subscribers only when it removed something", async () => {
    const { purgeRemovedGameScores } = await load();
    const heard = vi.fn();
    window.addEventListener("arcade-vault:scores", heard);
    purgeRemovedGameScores();
    expect(heard).not.toHaveBeenCalled();
    storage.data.set("arcade-vault:scores:retired-game", list);
    purgeRemovedGameScores();
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it("does not throw when storage is blocked", async () => {
    storage.data.set("arcade-vault:scores:retired-game", list);
    storage.failReads = true;
    const { purgeRemovedGameScores } = await load();
    expect(() => purgeRemovedGameScores()).not.toThrow();
    storage.failReads = false;
    expect(storage.data.has("arcade-vault:scores:retired-game")).toBe(true);
  });

  it("does not throw when removing fails", async () => {
    storage.data.set("arcade-vault:scores:retired-game", list);
    storage.failWrites = true;
    const { purgeRemovedGameScores } = await load();
    expect(() => purgeRemovedGameScores()).not.toThrow();
  });
});
