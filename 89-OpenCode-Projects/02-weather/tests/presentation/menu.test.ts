import { describe, expect, test } from "bun:test";
import { parseMenuOption } from "../../src/presentation/menu";

describe("menu options", () => {
  test("maps keys to menu options", () => {
    expect(parseMenuOption("1")).toBe("default-city-weather");
    expect(parseMenuOption("6")).toBe("seven-day-forecast");
    expect(parseMenuOption("7")).toBe("list-cities");
    expect(parseMenuOption("9")).toBe("exit");
  });

  test("returns null for unknown keys", () => {
    expect(parseMenuOption("42")).toBeNull();
    expect(parseMenuOption("")).toBeNull();
  });
});
