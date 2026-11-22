import { isFiniteNumber } from "./validation";

export interface City {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export function parseCity(value: unknown): City | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const city = value as Record<string, unknown>;
  const { id, latitude, longitude, name } = city;
  if (
    !isFiniteNumber(id) ||
    !isFiniteNumber(latitude) ||
    !isFiniteNumber(longitude) ||
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
