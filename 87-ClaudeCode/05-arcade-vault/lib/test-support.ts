import { vi } from "vitest";

export interface FakeStorage {
  data: Map<string, string>;
  /** Make getItem throw, like a browser that blocks storage. */
  failReads: boolean;
  /** Make setItem and removeItem throw, like a full or blocked storage. */
  failWrites: boolean;
}

/** Stubs a minimal `window` (EventTarget plus localStorage) for the lib/ modules. */
export function installFakeWindow(): FakeStorage {
  const fake: FakeStorage = { data: new Map(), failReads: false, failWrites: false };
  const localStorage = {
    get length() {
      if (fake.failReads) throw new Error("storage blocked");
      return fake.data.size;
    },
    key(index: number) {
      if (fake.failReads) throw new Error("storage blocked");
      return [...fake.data.keys()][index] ?? null;
    },
    getItem(key: string) {
      if (fake.failReads) throw new Error("storage blocked");
      return fake.data.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (fake.failWrites) throw new Error("storage full");
      fake.data.set(key, value);
    },
    removeItem(key: string) {
      if (fake.failWrites) throw new Error("storage blocked");
      fake.data.delete(key);
    },
  };
  vi.stubGlobal("window", Object.assign(new EventTarget(), { localStorage }));
  return fake;
}
