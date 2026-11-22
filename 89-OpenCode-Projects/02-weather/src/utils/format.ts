import type { City } from "../types/City";
import type { TemperatureUnit } from "../types/Weather";

export function unitSymbol(unit: TemperatureUnit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCity(city: City): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

export function formatTemperature(
  value: number,
  unit: TemperatureUnit,
): string {
  return `${value.toFixed(1)} ${unitSymbol(unit)}`;
}

export function formatForecastDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
