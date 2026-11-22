import { describe, expect, spyOn, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  addCity,
  createInitialCities,
  getDefaultCity,
  loadCities,
  removeCity,
  saveCities,
  setDefaultCity,
} from "../../src/storage/citiesStorage";
import type { City } from "../../src/types/City";

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

describe("cities storage", () => {
  test("adds unique cities and assigns the first default", () => {
    const citiesFile = createInitialCities();

    expect(addCity(citiesFile, ottawa)).toBe(true);
    expect(addCity(citiesFile, ottawa)).toBe(false);
    expect(citiesFile.cities).toEqual([ottawa]);
    expect(getDefaultCity(citiesFile)).toEqual(ottawa);
  });

  test("changes the default city and promotes another city after removal", () => {
    const citiesFile = createInitialCities();
    addCity(citiesFile, ottawa);
    addCity(citiesFile, toronto);

    expect(setDefaultCity(citiesFile, toronto.id)).toBe(true);
    expect(getDefaultCity(citiesFile)).toEqual(toronto);
    expect(removeCity(citiesFile, toronto.id)).toBe(true);
    expect(getDefaultCity(citiesFile)).toEqual(ottawa);
    expect(removeCity(citiesFile, 999)).toBe(false);
  });

  test("saves and restores cities", async () => {
    const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
    const path = join(directory, "cities.json");

    try {
      const citiesFile = createInitialCities();
      addCity(citiesFile, ottawa);
      await saveCities(citiesFile, path);

      expect(await loadCities(path)).toEqual(citiesFile);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("recovers from malformed saved data", async () => {
    const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
    const path = join(directory, "cities.json");
    const warning = spyOn(console, "warn").mockImplementation(() => {});

    try {
      await Bun.write(path, "not json");
      expect(await loadCities(path)).toEqual(createInitialCities());
      expect(warning).toHaveBeenCalledTimes(1);
    } finally {
      warning.mockRestore();
      await rm(directory, { recursive: true, force: true });
    }
  });
});
