import { describe, expect, spyOn, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCities } from "../../src/storage/citiesStorage";
import { loadAppState } from "../../src/storage/index";
import {
  migrateLegacyState,
  type StoragePaths,
} from "../../src/storage/migration";
import { loadSettings } from "../../src/storage/settingsStorage";
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

const legacyState = {
  cities: [ottawa, toronto],
  defaultCityId: toronto.id,
  unit: "fahrenheit",
};

async function createPaths(): Promise<
  StoragePaths & { directory: string }
> {
  const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
  return {
    directory,
    citiesPath: join(directory, "cities.json"),
    settingsPath: join(directory, "settings.json"),
    legacyPath: join(directory, "weather.json"),
  };
}

describe("legacy state migration", () => {
  test("migrates a legacy weather.json into the new storage files", async () => {
    const paths = await createPaths();
    await Bun.write(paths.legacyPath, JSON.stringify(legacyState));

    try {
      await migrateLegacyState(paths);

      const citiesFile = await loadCities(paths.citiesPath);
      expect(citiesFile.cities).toEqual([ottawa, toronto]);
      expect(citiesFile.defaultCityId).toBe(toronto.id);

      const settingsFile = await loadSettings(paths.settingsPath);
      expect(settingsFile.unit).toBe("fahrenheit");

      expect(await Bun.file(paths.legacyPath).exists()).toBe(false);
      expect(await Bun.file(`${paths.legacyPath}.bak`).exists()).toBe(true);
    } finally {
      await rm(paths.directory, { recursive: true, force: true });
    }
  });

  test("skips migration when the new storage files already exist", async () => {
    const paths = await createPaths();
    await Bun.write(paths.legacyPath, JSON.stringify(legacyState));
    await Bun.write(
      paths.citiesPath,
      JSON.stringify({ cities: [], defaultCityId: null }),
    );

    try {
      await migrateLegacyState(paths);

      expect(await Bun.file(paths.settingsPath).exists()).toBe(false);
      expect(await Bun.file(paths.legacyPath).exists()).toBe(true);
    } finally {
      await rm(paths.directory, { recursive: true, force: true });
    }
  });

  test("does nothing when there is no legacy file", async () => {
    const paths = await createPaths();

    try {
      await migrateLegacyState(paths);

      expect(await Bun.file(paths.citiesPath).exists()).toBe(false);
      expect(await Bun.file(paths.settingsPath).exists()).toBe(false);
    } finally {
      await rm(paths.directory, { recursive: true, force: true });
    }
  });

  test("leaves invalid legacy data behind and warns", async () => {
    const paths = await createPaths();
    await Bun.write(paths.legacyPath, "not json");
    const warning = spyOn(console, "warn").mockImplementation(() => {});

    try {
      await migrateLegacyState(paths);

      expect(await Bun.file(paths.citiesPath).exists()).toBe(false);
      expect(await Bun.file(paths.settingsPath).exists()).toBe(false);
      expect(await Bun.file(paths.legacyPath).exists()).toBe(true);
      expect(warning).toHaveBeenCalledTimes(1);
    } finally {
      warning.mockRestore();
      await rm(paths.directory, { recursive: true, force: true });
    }
  });

  test("loadAppState returns the migrated state", async () => {
    const paths = await createPaths();
    await Bun.write(paths.legacyPath, JSON.stringify(legacyState));

    try {
      expect(await loadAppState(paths)).toEqual({
        cities: [ottawa, toronto],
        defaultCityId: toronto.id,
        unit: "fahrenheit",
      });
    } finally {
      await rm(paths.directory, { recursive: true, force: true });
    }
  });
});
