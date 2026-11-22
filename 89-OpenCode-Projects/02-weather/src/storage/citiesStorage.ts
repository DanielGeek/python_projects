import { parseCity, type City } from "../types/City";
import { CITIES_STORAGE_PATH } from "../utils/constants";
import { readStorageFile, writeStorageFile } from "./storageFile";

export interface CitiesFile {
  cities: City[];
  defaultCityId: number | null;
}

export function createInitialCities(): CitiesFile {
  return { cities: [], defaultCityId: null };
}

export function parseCitiesFile(value: unknown): CitiesFile | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const file = value as Record<string, unknown>;
  const cities = file.cities;
  const defaultCityId = file.defaultCityId;
  if (
    !Array.isArray(cities) ||
    (defaultCityId !== null && typeof defaultCityId !== "number")
  ) {
    return null;
  }

  const parsedCities = cities.map(parseCity);
  if (parsedCities.some((city) => city === null)) {
    return null;
  }

  const validCities = parsedCities as City[];
  const cityIds = new Set(validCities.map((city) => city.id));
  if (cityIds.size !== validCities.length) {
    return null;
  }

  if (
    defaultCityId !== null &&
    (!Number.isFinite(defaultCityId) || !cityIds.has(defaultCityId))
  ) {
    return null;
  }

  return { cities: validCities, defaultCityId };
}

export async function loadCities(
  path = CITIES_STORAGE_PATH,
): Promise<CitiesFile> {
  return readStorageFile(path, parseCitiesFile, createInitialCities());
}

export async function saveCities(
  state: CitiesFile,
  path = CITIES_STORAGE_PATH,
): Promise<void> {
  await writeStorageFile(path, {
    cities: state.cities,
    defaultCityId: state.defaultCityId,
  });
}

export function addCity(citiesFile: CitiesFile, city: City): boolean {
  if (citiesFile.cities.some((savedCity) => savedCity.id === city.id)) {
    return false;
  }

  citiesFile.cities.push(city);
  citiesFile.defaultCityId ??= city.id;
  return true;
}

export function removeCity(citiesFile: CitiesFile, cityId: number): boolean {
  const cityIndex = citiesFile.cities.findIndex((city) => city.id === cityId);
  if (cityIndex === -1) {
    return false;
  }

  citiesFile.cities.splice(cityIndex, 1);
  if (citiesFile.defaultCityId === cityId) {
    citiesFile.defaultCityId = citiesFile.cities[0]?.id ?? null;
  }

  return true;
}

export function setDefaultCity(
  citiesFile: CitiesFile,
  cityId: number,
): boolean {
  if (!citiesFile.cities.some((city) => city.id === cityId)) {
    return false;
  }

  citiesFile.defaultCityId = cityId;
  return true;
}

export function getDefaultCity(citiesFile: CitiesFile): City | undefined {
  return citiesFile.cities.find((city) => city.id === citiesFile.defaultCityId);
}
