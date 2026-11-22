import type { AppState } from "../types/AppState";
import { loadCities } from "./citiesStorage";
import {
  DEFAULT_STORAGE_PATHS,
  migrateLegacyState,
  type StoragePaths,
} from "./migration";
import { loadSettings } from "./settingsStorage";

export async function loadAppState(
  paths: StoragePaths = DEFAULT_STORAGE_PATHS,
): Promise<AppState> {
  await migrateLegacyState(paths);
  const citiesFile = await loadCities(paths.citiesPath);
  const settingsFile = await loadSettings(paths.settingsPath);
  return { ...citiesFile, ...settingsFile };
}
