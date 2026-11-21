import { describe, expect, test } from "bun:test";
import { colorize } from "../src/colors";

describe("terminal colors", () => {
  test("wraps text with the requested ANSI color", () => {
    expect(colorize("Menu", "cyan", true)).toBe("\u001b[36mMenu\u001b[0m");
    expect(colorize("12.3 °C", "yellow", true)).toBe(
      "\u001b[33m12.3 °C\u001b[0m",
    );
    expect(colorize("Added Ottawa.", "green", true)).toBe(
      "\u001b[32mAdded Ottawa.\u001b[0m",
    );
    expect(colorize("Invalid option.", "red", true)).toBe(
      "\u001b[31mInvalid option.\u001b[0m",
    );
  });

  test("keeps text plain when colors are disabled", () => {
    expect(colorize("Menu", "cyan", false)).toBe("Menu");
    expect(colorize("12.3 °C", "yellow", false)).toBe("12.3 °C");
  });
});
