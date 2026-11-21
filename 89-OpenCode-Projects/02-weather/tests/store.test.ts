import { describe, expect, spyOn, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  addCity,
  createInitialState,
  getDefaultCity,
  loadState,
  removeCity,
  saveState,
  setDefaultCity,
  toggleUnit,
} from "../src/store";
import type { City } from "../src/types";

const ottawa: City = {
  id: 1,
  name: "Ottawa",
  country: "Canada",
  latitude: 45.41117,
  longitude: -75.69812,
};

const toronto: City = {
  id: 2,
  name: "Toronto",
  country: "Canada",
  latitude: 43.70011,
  longitude: -79.4163,
};

describe("weather state", () => {
  test("adds unique cities and assigns the first default", () => {
    const state = createInitialState();

    expect(addCity(state, ottawa)).toBe(true);
    expect(addCity(state, ottawa)).toBe(false);
    expect(state.cities).toEqual([ottawa]);
    expect(getDefaultCity(state)).toEqual(ottawa);
  });

  test("changes the default city and promotes another city after removal", () => {
    const state = createInitialState();
    addCity(state, ottawa);
    addCity(state, toronto);

    expect(setDefaultCity(state, toronto.id)).toBe(true);
    expect(getDefaultCity(state)).toEqual(toronto);
    expect(removeCity(state, toronto.id)).toBe(true);
    expect(getDefaultCity(state)).toEqual(ottawa);
    expect(removeCity(state, 999)).toBe(false);
  });

  test("toggles temperature units", () => {
    const state = createInitialState();
    expect(toggleUnit(state)).toBe("fahrenheit");
    expect(toggleUnit(state)).toBe("celsius");
  });

  test("saves and restores state", async () => {
    const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
    const path = join(directory, "weather.json");

    try {
      const state = createInitialState();
      addCity(state, ottawa);
      toggleUnit(state);
      await saveState(state, path);

      expect(await loadState(path)).toEqual(state);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("recovers from malformed saved data", async () => {
    const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
    const path = join(directory, "weather.json");
    const warning = spyOn(console, "warn").mockImplementation(() => {});

    try {
      await Bun.write(path, "not json");
      expect(await loadState(path)).toEqual(createInitialState());
      expect(warning).toHaveBeenCalledTimes(1);
    } finally {
      warning.mockRestore();
      await rm(directory, { recursive: true, force: true });
    }
  });
});
