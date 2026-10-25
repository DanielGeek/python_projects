import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installFakeWindow, type FakeStorage } from "./test-support";

const KEY = "arcade-vault:session";
let storage: FakeStorage;

// A stand-in for the Supabase browser client: tests push auth events and read what was called.
type AuthListener = (event: string, session: { user: { id: string } } | null) => void;
let authListener: AuthListener | null;
let profile: { username: string } | null;
const signOutSupabase = vi.fn(async () => ({ error: null }));
vi.mock("./supabase/client", () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: (cb: AuthListener) => {
        authListener = cb;
      },
      signOut: signOutSupabase,
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: profile, error: null }) }),
      }),
    }),
  }),
}));

// The module keeps state (cache and memory fallback), so every test loads a fresh copy.
async function load() {
  vi.resetModules();
  return import("./session");
}

beforeEach(() => {
  storage = installFakeWindow();
  authListener = null;
  profile = { username: "ADA" };
  signOutSupabase.mockClear();
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

  it("plays as guest and signs out", async () => {
    const { playAsGuest, signOut, readSession } = await load();
    await playAsGuest();
    expect(readSession()).toEqual({ name: "GUEST", guest: true });
    await signOut();
    expect(readSession()).toBeNull();
    expect(signOutSupabase).not.toHaveBeenCalled();
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
    const { playAsGuest, readSession, signOut } = await load();
    expect(await playAsGuest()).toBe(false);
    expect(readSession()).toEqual({ name: "GUEST", guest: true });
    await signOut();
    expect(readSession()).toBeNull();
  });

  it("notifies subscribers when a guest starts", async () => {
    const { playAsGuest } = await load();
    const listener = vi.fn();
    window.addEventListener("arcade-vault:session", listener);
    await playAsGuest();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

// The account arrives through Supabase's onAuthStateChange, which `subscribe` (the useSession hook) starts.
describe("account session", () => {
  async function loadWatching() {
    const session = await load();
    session.subscribe(() => {});
    return session;
  }

  it("loads the username of the signed-in user and clears the guest", async () => {
    const { readSession, playAsGuest, subscribe } = await load();
    await playAsGuest();
    subscribe(() => {});
    authListener?.("SIGNED_IN", { user: { id: "u1" } });
    await vi.waitFor(() =>
      expect(readSession()).toEqual({ name: "ADA", guest: false, userId: "u1" }),
    );
    expect(storage.data.has(KEY)).toBe(false);
  });

  it("signs out of Supabase when playing as a guest", async () => {
    const { readSession, playAsGuest } = await loadWatching();
    authListener?.("SIGNED_IN", { user: { id: "u1" } });
    await vi.waitFor(() => expect(readSession()?.guest).toBe(false));
    await playAsGuest();
    expect(signOutSupabase).toHaveBeenCalledTimes(1);
    expect(readSession()).toEqual({ name: "GUEST", guest: true });
  });

  it("signOut ends the account", async () => {
    const { readSession, signOut } = await loadWatching();
    authListener?.("SIGNED_IN", { user: { id: "u1" } });
    await vi.waitFor(() => expect(readSession()?.userId).toBe("u1"));
    await signOut();
    expect(signOutSupabase).toHaveBeenCalledTimes(1);
    expect(readSession()).toBeNull();
  });

  it("ignores a signed-in user that has no profile", async () => {
    profile = null;
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { readSession } = await loadWatching();
    authListener?.("SIGNED_IN", { user: { id: "u1" } });
    await new Promise((r) => setTimeout(r, 10));
    expect(readSession()).toBeNull();
  });

  it("drops the account when Supabase reports no session", async () => {
    const { readSession } = await loadWatching();
    authListener?.("SIGNED_IN", { user: { id: "u1" } });
    await vi.waitFor(() => expect(readSession()?.userId).toBe("u1"));
    authListener?.("SIGNED_OUT", null);
    await vi.waitFor(() => expect(readSession()).toBeNull());
  });
});

// SPEC 17: proxy.ts reads this cookie to let a guest open the player. It follows the guest in localStorage.
describe("guest cookie", () => {
  const COOKIE = "arcade-vault-guest";
  let jar: Map<string, string>;
  let writes: string[];
  let blocked: boolean;

  beforeEach(() => {
    jar = new Map();
    writes = [];
    blocked = false;
    vi.stubGlobal("document", {
      get cookie() {
        return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
      },
      set cookie(value: string) {
        if (blocked) throw new Error("cookies blocked");
        writes.push(value);
        const [pair, ...attrs] = value.split("; ");
        const [name, val] = pair.split("=");
        if (val === "" || attrs.includes("Max-Age=0")) jar.delete(name);
        else jar.set(name, val);
      },
    });
  });

  it("is set when a guest starts, for a year, on every path", async () => {
    const { playAsGuest } = await load();
    await playAsGuest();
    expect(jar.get(COOKIE)).toBe("1");
    expect(writes[0]).toBe(`${COOKIE}=1; Path=/; SameSite=Lax; Max-Age=31536000`);
  });

  it("is removed on sign-out", async () => {
    const { playAsGuest, signOut } = await load();
    await playAsGuest();
    await signOut();
    expect(jar.has(COOKIE)).toBe(false);
  });

  it("is set when a guest made before SPEC 17 is read from localStorage", async () => {
    storage.data.set(KEY, JSON.stringify({ name: "GUEST", guest: true }));
    const { readSession } = await load();
    expect(jar.has(COOKIE)).toBe(false);
    expect(readSession()).toEqual({ name: "GUEST", guest: true });
    expect(jar.get(COOKIE)).toBe("1");
  });

  it("is not set when there is no guest", async () => {
    const { readSession } = await load();
    expect(readSession()).toBeNull();
    expect(jar.has(COOKIE)).toBe(false);
  });

  it("is removed when an account signs in", async () => {
    const { readSession, playAsGuest, subscribe } = await load();
    await playAsGuest();
    expect(jar.get(COOKIE)).toBe("1");
    subscribe(() => {});
    authListener?.("SIGNED_IN", { user: { id: "u1" } });
    await vi.waitFor(() => expect(readSession()?.guest).toBe(false));
    expect(jar.has(COOKIE)).toBe(false);
  });

  it("is removed when playing as a guest ends the account and signing out later", async () => {
    const { readSession, playAsGuest, signOut, subscribe } = await load();
    subscribe(() => {});
    authListener?.("SIGNED_IN", { user: { id: "u1" } });
    await vi.waitFor(() => expect(readSession()?.guest).toBe(false));
    await playAsGuest();
    expect(jar.get(COOKIE)).toBe("1");
    await signOut();
    expect(jar.has(COOKIE)).toBe(false);
  });

  it("does not fail when the browser blocks cookies", async () => {
    blocked = true;
    const { playAsGuest, readSession } = await load();
    await expect(playAsGuest()).resolves.toBe(true);
    expect(readSession()).toEqual({ name: "GUEST", guest: true });
  });
});
