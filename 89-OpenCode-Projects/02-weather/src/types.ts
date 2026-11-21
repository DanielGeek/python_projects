export type TemperatureUnit = "celsius" | "fahrenheit";

export interface City {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface AppState {
  cities: City[];
  defaultCityId: number | null;
  unit: TemperatureUnit;
}

export function parseCity(value: unknown): City | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const city = value as Record<string, unknown>;
  const { id, latitude, longitude, name } = city;
  if (
    typeof id !== "number" ||
    !Number.isFinite(id) ||
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    typeof name !== "string" ||
    !name.trim()
  ) {
    return null;
  }

  return {
    id,
    name: name.trim(),
    admin1: typeof city.admin1 === "string" ? city.admin1 : undefined,
    country: typeof city.country === "string" ? city.country : undefined,
    latitude,
    longitude,
  };
}
