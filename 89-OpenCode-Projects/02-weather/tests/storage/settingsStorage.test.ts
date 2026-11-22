import { describe, expect, spyOn, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createInitialSettings,
  loadSettings,
  saveSettings,
  toggleUnit,
} from "../../src/storage/settingsStorage";

describe("settings storage", () => {
  test("toggles temperature units", () => {
    const settings = createInitialSettings();
    expect(toggleUnit(settings)).toBe("fahrenheit");
    expect(toggleUnit(settings)).toBe("celsius");
  });

  test("saves and restores settings", async () => {
    const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
    const path = join(directory, "settings.json");

    try {
      const settings = createInitialSettings();
      toggleUnit(settings);
      await saveSettings(settings, path);

      expect(await loadSettings(path)).toEqual(settings);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("recovers from malformed saved data", async () => {
    const directory = await mkdtemp(join(tmpdir(), "weather-cli-"));
    const path = join(directory, "settings.json");
    const warning = spyOn(console, "warn").mockImplementation(() => {});

    try {
      await Bun.write(path, "not json");
      expect(await loadSettings(path)).toEqual(createInitialSettings());
      expect(warning).toHaveBeenCalledTimes(1);
    } finally {
      warning.mockRestore();
      await rm(directory, { recursive: true, force: true });
    }
  });
});
