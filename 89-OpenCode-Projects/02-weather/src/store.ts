import { red } from "./colors";
import {
  parseCity,
  type AppState,
  type City,
  type TemperatureUnit,
} from "./types";

export const STORAGE_PATH = "weather.json";

export function createInitialState(): AppState {
  return {
    cities: [],
    defaultCityId: null,
    unit: "celsius",
  };
}

export function addCity(state: AppState, city: City): boolean {
  if (state.cities.some((savedCity) => savedCity.id === city.id)) {
    return false;
  }

  state.cities.push(city);
  state.defaultCityId ??= city.id;
  return true;
}

export function removeCity(state: AppState, cityId: number): boolean {
  const cityIndex = state.cities.findIndex((city) => city.id === cityId);
  if (cityIndex === -1) {
    return false;
  }

  state.cities.splice(cityIndex, 1);
  if (state.defaultCityId === cityId) {
    state.defaultCityId = state.cities[0]?.id ?? null;
  }

  return true;
}

export function setDefaultCity(state: AppState, cityId: number): boolean {
  if (!state.cities.some((city) => city.id === cityId)) {
    return false;
  }

  state.defaultCityId = cityId;
  return true;
}

export function getDefaultCity(state: AppState): City | undefined {
  return state.cities.find((city) => city.id === state.defaultCityId);
}

export function toggleUnit(state: AppState): TemperatureUnit {
  state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius";
  return state.unit;
}

function parseState(value: unknown): AppState | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const state = value as Record<string, unknown>;
  if (
    !Array.isArray(state.cities) ||
    (state.unit !== "celsius" && state.unit !== "fahrenheit") ||
    (state.defaultCityId !== null && typeof state.defaultCityId !== "number")
  ) {
    return null;
  }

  const cities = state.cities.map(parseCity);
  if (cities.some((city) => city === null)) {
    return null;
  }

  const validCities = cities as City[];
  const cityIds = new Set(validCities.map((city) => city.id));
  if (cityIds.size !== validCities.length) {
    return null;
  }

  if (
    state.defaultCityId !== null &&
    (!Number.isFinite(state.defaultCityId) || !cityIds.has(state.defaultCityId))
  ) {
    return null;
  }

  return {
    cities: validCities,
    defaultCityId: state.defaultCityId,
    unit: state.unit,
  };
}

export async function loadState(path = STORAGE_PATH): Promise<AppState> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return createInitialState();
  }

  try {
    const state = parseState(await file.json());
    if (!state) {
      throw new Error("Invalid saved state");
    }
    return state;
  } catch {
    console.warn(red(`Saved data in ${path} is invalid or unreadable. Starting with empty data.`));
    return createInitialState();
  }
}

export async function saveState(
  state: AppState,
  path = STORAGE_PATH,
): Promise<void> {
  await Bun.write(path, `${JSON.stringify(state, null, 2)}\n`);
}
