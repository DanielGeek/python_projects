import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFakeWindow, type FakeStorage } from "./test-support";

const KEY = "arcade-vault:session";
let storage: FakeStorage;

// The module keeps state (cache and memory fallback), so every test loads a fresh copy.
async function load() {
  vi.resetModules();
  return import("./session");
}

beforeEach(() => {
  storage = installFakeWindow();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("session", () => {
  it("has no session by default", async () => {
    const { readSession } = await load();
    expect(readSession()).toBeNull();
  });

  it("signs in with a trimmed, upper-cased name", async () => {
    const { signIn, readSession } = await load();
    expect(signIn("  ada ")).toBe(true);
    expect(readSession()).toEqual({ name: "ADA", guest: false });
  });

  it("plays as guest and signs out", async () => {
    const { playAsGuest, signOut, readSession } = await load();
    playAsGuest();
    expect(readSession()).toEqual({ name: "GUEST", guest: true });
    signOut();
    expect(readSession()).toBeNull();
  });

  it.each([
    "123",
    "{}",
    "null",
    '{"name":1,"guest":false}',
    '{"name":"","guest":false}',
    "not json",
  ])("ignores the invalid stored value %j", async (raw) => {
    storage.data.set(KEY, raw);
    const { readSession } = await load();
    expect(readSession()).toBeNull();
  });

  it("keeps the session in memory when storage is blocked", async () => {
    storage.failReads = true;
    storage.failWrites = true;
    const { signIn, readSession, signOut } = await load();
    expect(signIn("ada")).toBe(false);
    expect(readSession()).toEqual({ name: "ADA", guest: false });
    signOut();
    expect(readSession()).toBeNull();
  });

  it("notifies subscribers on sign in", async () => {
    const { signIn } = await load();
    const listener = vi.fn();
    window.addEventListener("arcade-vault:session", listener);
    signIn("ada");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
