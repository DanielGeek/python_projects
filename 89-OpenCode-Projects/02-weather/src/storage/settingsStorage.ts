import type { TemperatureUnit } from "../types/Weather";
import { SETTINGS_STORAGE_PATH } from "../utils/constants";
import { readStorageFile, writeStorageFile } from "./storageFile";

export interface SettingsFile {
  unit: TemperatureUnit;
}

export function createInitialSettings(): SettingsFile {
  return { unit: "celsius" };
}

export function parseSettingsFile(value: unknown): SettingsFile | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const settings = value as Record<string, unknown>;
  if (settings.unit !== "celsius" && settings.unit !== "fahrenheit") {
    return null;
  }

  return { unit: settings.unit };
}

export async function loadSettings(
  path = SETTINGS_STORAGE_PATH,
): Promise<SettingsFile> {
  return readStorageFile(path, parseSettingsFile, createInitialSettings());
}

export async function saveSettings(
  state: SettingsFile,
  path = SETTINGS_STORAGE_PATH,
): Promise<void> {
  await writeStorageFile(path, { unit: state.unit });
}

export function toggleUnit(settings: SettingsFile): TemperatureUnit {
  settings.unit = settings.unit === "celsius" ? "fahrenheit" : "celsius";
  return settings.unit;
}
