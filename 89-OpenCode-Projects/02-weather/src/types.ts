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

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  maxTemperature: number;
  minTemperature: number;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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

export function parseDailyForecast(value: unknown): DailyForecast[] | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const daily = value as Record<string, unknown>;
  const time = daily.time;
  const maxTemperatures = daily.temperature_2m_max;
  const minTemperatures = daily.temperature_2m_min;

  if (
    !Array.isArray(time) ||
    !Array.isArray(maxTemperatures) ||
    !Array.isArray(minTemperatures) ||
    time.length === 0 ||
    time.length !== maxTemperatures.length ||
    time.length !== minTemperatures.length
  ) {
    return null;
  }

  const forecast: DailyForecast[] = [];
  for (let index = 0; index < time.length; index += 1) {
    const date = time[index];
    const maxTemperature = maxTemperatures[index];
    const minTemperature = minTemperatures[index];

    if (
      typeof date !== "string" ||
      !date.trim() ||
      !isFiniteNumber(maxTemperature) ||
      !isFiniteNumber(minTemperature)
    ) {
      return null;
    }

    forecast.push({ date, maxTemperature, minTemperature });
  }

  return forecast;
}
