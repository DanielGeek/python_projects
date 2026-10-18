import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFakeWindow, type FakeStorage } from "./test-support";

const KEY = "arcade-vault:credits";
let storage: FakeStorage;

// The module keeps state (memory fallback), so every test loads a fresh copy.
async function load() {
  vi.resetModules();
  return import("./credits");
}

beforeEach(() => {
  storage = installFakeWindow();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("credits", () => {
  it("starts a fresh device with the initial credits", async () => {
    const { readCredits, INITIAL_CREDITS } = await load();
    expect(readCredits()).toBe(INITIAL_CREDITS);
  });

  it("spends one credit at a time and refuses at zero", async () => {
    const { spendCredit, readCredits } = await load();
    expect([spendCredit(), spendCredit(), spendCredit()]).toEqual([true, true, true]);
    expect(readCredits()).toBe(0);
    expect(spendCredit()).toBe(false);
    expect(readCredits()).toBe(0);
  });

  it("restores the initial credits with insertCoin", async () => {
    const { spendCredit, insertCoin, readCredits, INITIAL_CREDITS } = await load();
    spendCredit();
    expect(insertCoin()).toBe(true);
    expect(readCredits()).toBe(INITIAL_CREDITS);
  });

  it("notifies subscribers when the balance changes", async () => {
    const { spendCredit } = await load();
    const listener = vi.fn();
    window.addEventListener("arcade-vault:credits", listener);
    spendCredit();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it.each(["abc", "-1", "2abc", "1.5", "", "99999999999999999999"])(
    "treats the corrupt value %j as no credits, not as free credits",
    async (raw) => {
      storage.data.set(KEY, raw);
      const { readCredits, spendCredit } = await load();
      expect(readCredits()).toBe(0);
      expect(spendCredit()).toBe(false);
    },
  );

  it("keeps counting down in memory when storage is blocked", async () => {
    storage.failReads = true;
    storage.failWrites = true;
    const { spendCredit, readCredits, INITIAL_CREDITS } = await load();
    expect(readCredits()).toBe(INITIAL_CREDITS);
    for (let i = 0; i < INITIAL_CREDITS; i++) expect(spendCredit()).toBe(true);
    expect(spendCredit()).toBe(false);
    expect(readCredits()).toBe(0);
  });

  it("keeps the balance in memory when a write fails", async () => {
    const { spendCredit, readCredits, INITIAL_CREDITS } = await load();
    storage.failWrites = true;
    expect(spendCredit()).toBe(true);
    expect(readCredits()).toBe(INITIAL_CREDITS - 1);
    expect(console.warn).toHaveBeenCalled();
  });

  it("reports a failed write from insertCoin", async () => {
    const { insertCoin } = await load();
    storage.failWrites = true;
    expect(insertCoin()).toBe(false);
  });
});
