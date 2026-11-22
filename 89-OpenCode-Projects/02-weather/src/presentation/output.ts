import type { AppState } from "../types/AppState";
import type { City } from "../types/City";
import type { CurrentWeather, DailyForecast, TemperatureUnit } from "../types/Weather";
import { cyan, green, red, yellow } from "../utils/colors";
import { formatCity, formatForecastDate, formatTemperature } from "../utils/format";
import { describeWeatherCode } from "../utils/weatherCodes";

export function printSuccess(message: string): void {
  console.log(green(`  ${message}`));
}

export function printError(message: string): void {
  console.error(red(`  ${message}`));
}

export function printCities(state: AppState): void {
  const cities = state.cities
    .map((city, index) => {
      const defaultMarker = city.id === state.defaultCityId ? " (default)" : "";
      return `  ${index + 1}. ${formatCity(city)}${defaultMarker}`;
    })
    .join("\n");

  console.log(cyan(cities));
}

export function printWeather(
  city: City,
  weather: CurrentWeather,
  unit: TemperatureUnit,
): void {
  const temperatureText = formatTemperature(weather.temperature, unit);
  const condition = describeWeatherCode(weather.weatherCode);
  console.log(`  ${formatCity(city)}: ${yellow(temperatureText)}, ${condition}`);
}

export function printForecast(
  city: City,
  forecast: DailyForecast[],
  unit: TemperatureUnit,
): void {
  console.log(cyan(`  ${formatCity(city)}`));
  for (const day of forecast) {
    const dateText = formatForecastDate(day.date).padEnd(12);
    const maxText = formatTemperature(day.maxTemperature, unit);
    const minText = formatTemperature(day.minTemperature, unit);
    console.log(`    ${dateText} max ${yellow(maxText)}  min ${yellow(minText)}`);
  }
}
