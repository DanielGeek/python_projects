import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GAMES } from "./games";

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const bridge = read("public/games/bridge.js");
const css = read("app/globals.css");
const playable = GAMES.filter((g) => g.src !== null);

describe("GAMES catalog", () => {
  it("has unique ids", () => {
    const ids = GAMES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("lists at least one playable game", () => {
    expect(playable.length).toBeGreaterThan(0);
  });

  describe.each(playable.map((g) => [g.id, g.src as string] as const))("%s", (id, src) => {
    const file = join("public", src);

    it("points to an index.html that exists under public/", () => {
      expect(existsSync(join(ROOT, file)), `${id}: missing ${file}`).toBe(true);
    });

    it("loads bridge.js with a matching data-game", () => {
      const html = read(file);
      expect(html, `${id}: ${file} has no bridge.js with data-game="${id}"`).toMatch(
        new RegExp(`<script[^>]*src="[^"]*bridge\\.js"[^>]*data-game="${id}"`),
      );
    });

    it("has a reader in bridge.js", () => {
      expect(bridge, `${id}: no reader in public/games/bridge.js`).toMatch(
        new RegExp(`(^|\\s)"?${id}"?\\s*:\\s*function`, "m"),
      );
    });

    it("has an av-cover rule in globals.css", () => {
      expect(css, `${id}: no .av-cover-${id} rule in app/globals.css`).toContain(`.av-cover-${id}`);
    });
  });
});
