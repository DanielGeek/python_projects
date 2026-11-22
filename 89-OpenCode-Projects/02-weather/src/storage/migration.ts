import { rename } from "node:fs/promises";
import type { City } from "../types/City";
import type { TemperatureUnit } from "../types/Weather";
import { red } from "../utils/colors";
import {
  CITIES_STORAGE_PATH,
  LEGACY_STORAGE_PATH,
  SETTINGS_STORAGE_PATH,
} from "../utils/constants";
import { parseCitiesFile } from "./citiesStorage";
import { parseSettingsFile } from "./settingsStorage";
import { writeStorageFile } from "./storageFile";

interface LegacyState {
  cities: City[];
  defaultCityId: number | null;
  unit: TemperatureUnit;
}

export interface StoragePaths {
  citiesPath: string;
  settingsPath: string;
  legacyPath: string;
}

export const DEFAULT_STORAGE_PATHS: StoragePaths = {
  citiesPath: CITIES_STORAGE_PATH,
  settingsPath: SETTINGS_STORAGE_PATH,
  legacyPath: LEGACY_STORAGE_PATH,
};

function parseLegacyState(value: unknown): LegacyState | null {
  const citiesFile = parseCitiesFile(value);
  const settingsFile = parseSettingsFile(value);
  if (!citiesFile || !settingsFile) {
    return null;
  }

  return { ...citiesFile, ...settingsFile };
}

export async function migrateLegacyState(
  paths: StoragePaths = DEFAULT_STORAGE_PATHS,
): Promise<void> {
  const citiesFileExists = await Bun.file(paths.citiesPath).exists();
  const settingsFileExists = await Bun.file(paths.settingsPath).exists();
  if (citiesFileExists || settingsFileExists) {
    return;
  }

  const legacyFile = Bun.file(paths.legacyPath);
  if (!(await legacyFile.exists())) {
    return;
  }

  try {
    const legacy = parseLegacyState(await legacyFile.json());
    if (!legacy) {
      throw new Error("Invalid legacy data");
    }

    await writeStorageFile(paths.citiesPath, {
      cities: legacy.cities,
      defaultCityId: legacy.defaultCityId,
    });
    await writeStorageFile(paths.settingsPath, { unit: legacy.unit });
    await rename(paths.legacyPath, `${paths.legacyPath}.bak`);
  } catch {
    console.warn(
      red(`Legacy data in ${paths.legacyPath} is invalid or unreadable. Starting with empty data.`),
    );
  }
}
