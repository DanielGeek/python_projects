import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { GAMES } from "./games";
import { ARCHIVED_GAMES } from "./games-archive";

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const bridge = read("public/games/bridge.js");
const css = read("app/globals.css");
const playable = GAMES.filter((g) => g.src !== null);
// The codes the bridge lets the host send as keys: the KEYS table of public/games/bridge.js.
const bridgeKeys = Array.from(
  (/var KEYS = \{([\s\S]*?)\};/.exec(bridge)?.[1] ?? "").matchAll(/(\w+):\s*'/g),
  (m) => m[1],
);

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

  describe.each(playable.map((g) => [g.id, g.src as string] as const))(
    "%s touch controls",
    (id, src) => {
      const touch = GAMES.find((g) => g.id === id)?.touch;
      const buttons = touch ? [...touch.move, touch.a, touch.b, ...(touch.extra ?? [])] : [];
      const source = read(join("public", dirname(src), "game.js"));

      it("has a touch config", () => {
        expect(touch, `${id}: no touch config in lib/games.ts`).toBeDefined();
      });

      it("has A, B and labelled buttons", () => {
        if (!touch) return;
        expect(touch.a, `${id}: no A button`).toBeDefined();
        expect(touch.b, `${id}: no B button`).toBeDefined();
        expect(touch.move.length).toBeGreaterThan(0);
        for (const b of buttons) {
          expect(b.label.trim(), `${id}: ${b.code} has no label`).not.toBe("");
          expect(b.name.trim(), `${id}: ${b.code} has no accessible name`).not.toBe("");
        }
      });

      it("has only arrow codes in move and at most three extra buttons", () => {
        if (!touch) return;
        const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        for (const b of touch.move) {
          expect(arrows, `${id}: move code ${b.code} is not an arrow`).toContain(b.code);
        }
        expect(
          touch.extra?.length ?? 0,
          `${id}: more than three extra buttons`,
        ).toBeLessThanOrEqual(3);
      });

      it("has no repeated key code", () => {
        const codes = buttons.map((b) => b.code);
        expect(new Set(codes).size, `${id}: repeated code in ${codes.join(", ")}`).toBe(
          codes.length,
        );
      });

      it.each(buttons.map((b) => b.code))("%s is handled by game.js", (code) => {
        expect(source, `${id}: game.js never mentions ${code}`).toMatch(
          new RegExp(`\\b${code}\\b`),
        );
      });

      it.each(buttons.map((b) => b.code))("%s is in the bridge allowlist", (code) => {
        expect(bridgeKeys, `${id}: ${code} is not in the allowlist of bridge.js`).toContain(code);
      });
    },
  );
});

describe("bridge.js key message", () => {
  it("handles the key type from the host", () => {
    expect(bridge).toMatch(/e\.data\.type === 'key'/);
  });

  it("only allows the keys the touch controls need", () => {
    expect(bridgeKeys.length).toBeGreaterThan(0);
    for (const code of bridgeKeys)
      expect(code).toMatch(/^(Arrow\w+|Space|Enter|Key[A-Z]|Digit\d)$/);
  });
});

describe("ARCHIVED_GAMES", () => {
  it("keeps the games removed by SPEC 08 that have not come back", () => {
    expect(ARCHIVED_GAMES.map((g) => g.id).sort()).toEqual(
      ["invaders", "muncher", "pixel-duel", "rocks", "serpent"].sort(),
    );
  });

  it("has unique ids that are not in GAMES", () => {
    const ids = ARCHIVED_GAMES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    const catalog = new Set(GAMES.map((g) => g.id));
    expect(ids.filter((id) => catalog.has(id))).toEqual([]);
  });

  it.each(
    ARCHIVED_GAMES.filter((g) => g.src !== null).map((g) => [g.id, g.src as string] as const),
  )("%s keeps its playable files on disk", (id, src) => {
    expect(existsSync(join(ROOT, "public", src)), `${id}: missing public${src}`).toBe(true);
  });
});
