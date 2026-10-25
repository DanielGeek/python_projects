import { describe, expect, it } from "vitest";
import { DEFAULT_NEXT, safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it.each([
    "/login/reset",
    "/game/asteroids/play",
    "/profile",
    "/library?tab=arcade",
    "/hall-of-fame#top",
  ])("accepts the same-origin path %j", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([
    ["a protocol-relative URL", "//evil.example"],
    ["an absolute URL", "https://evil.example"],
    ["a backslash path", "/\\evil"],
    ["a backslash after a folder", "/a\\evil.example"],
    ["a triple slash", "///evil.example"],
    ["a double slash inside the path", "/a//evil.example"],
    ["a javascript scheme", "javascript:alert(1)"],
    ["a data scheme", "data:text/html,hi"],
    ["a path without a leading slash", "evil.example"],
    ["a tab that the browser strips", "/\t/evil.example"],
    ["a newline", "/a\nb"],
    ["a space", "/a b"],
    ["an empty string", ""],
  ])("falls back to /library for %s", (_label, value) => {
    expect(safeNextPath(value)).toBe(DEFAULT_NEXT);
  });

  it.each([null, undefined])("falls back to /library for %s", (value) => {
    expect(safeNextPath(value)).toBe("/library");
  });
});
