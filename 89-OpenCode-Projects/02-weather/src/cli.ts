import { cyan, green, red, yellow } from "./colors";
import { findCity, getCurrentWeather, getDailyForecast } from "./open-meteo";
import {
  addCity as addCityToState,
  getDefaultCity,
  loadState,
  removeCity as removeCityFromState,
  saveState,
  setDefaultCity,
  toggleUnit,
} from "./store";
import type { AppState, City, DailyForecast, TemperatureUnit } from "./types";
import { describeWeatherCode } from "./weather-codes";

const DIVIDER = "════════════════════════════════════════";

function unitSymbol(unit: TemperatureUnit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCity(city: City): string {
  return [city.name, city.admin1, city.country].filter(Boolean).join(", ");
}

function printSuccess(message: string): void {
  console.log(green(`  ${message}`));
}

function printError(message: string): void {
  console.error(red(`  ${message}`));
}

function printMenu(state: AppState): void {
  const menu = [
    `\n${DIVIDER}`,
    "         WEATHER CLI",
    DIVIDER,
    "  1. Default city weather",
    `  2. Weather for all cities (${state.cities.length})`,
    "  3. Search for and add a city",
    "  4. Remove a city",
    "  5. Set default city",
    `  6. 7 day forecast for all cities (${state.cities.length})`,
    `  8. Settings (${unitSymbol(state.unit)})`,
    "  9. Exit",
    DIVIDER,
  ].join("\n");

  console.log(cyan(menu));
}

function printCities(state: AppState): void {
  const cities = state.cities
    .map((city, index) => {
      const defaultMarker = city.id === state.defaultCityId ? " (default)" : "";
      return `  ${index + 1}. ${formatCity(city)}${defaultMarker}`;
    })
    .join("\n");

  console.log(cyan(cities));
}

function selectCity(state: AppState, action: string): City | null {
  printCities(state);
  const answer = prompt(cyan(`  City number to ${action}: `));
  if (answer === null) {
    return null;
  }

  const index = Number(answer.trim()) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= state.cities.length) {
    return null;
  }

  return state.cities[index] ?? null;
}

async function printCityWeather(city: City, state: AppState): Promise<void> {
  const weather = await getCurrentWeather(city, state.unit);
  const temperatureText = `${weather.temperature.toFixed(1)} ${unitSymbol(state.unit)}`;
  const condition = describeWeatherCode(weather.weatherCode);
  console.log(`  ${formatCity(city)}: ${yellow(temperatureText)}, ${condition}`);
}

async function showDefaultWeather(state: AppState): Promise<void> {
  const city = getDefaultCity(state);
  if (!city) {
    printError("No default city is set. Add a city with option 3.");
    return;
  }

  await printCityWeather(city, state);
}

async function showForEachCity(
  state: AppState,
  print: (city: City, state: AppState) => Promise<void>,
): Promise<void> {
  if (state.cities.length === 0) {
    printError("No cities saved. Add a city with option 3.");
    return;
  }

  for (const city of state.cities) {
    try {
      await print(city, state);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      printError(`${formatCity(city)}: ${message}`);
    }
  }
}

async function showAllWeather(state: AppState): Promise<void> {
  await showForEachCity(state, printCityWeather);
}

function formatForecastDay(day: DailyForecast, unit: TemperatureUnit): string {
  const dateText = new Date(`${day.date}T00:00:00`).toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const maxText = `${day.maxTemperature.toFixed(1)} ${unitSymbol(unit)}`;
  const minText = `${day.minTemperature.toFixed(1)} ${unitSymbol(unit)}`;
  return `    ${dateText.padEnd(12)} max ${yellow(maxText)}  min ${yellow(minText)}`;
}

async function printCityForecast(city: City, state: AppState): Promise<void> {
  const forecast = await getDailyForecast(city, state.unit);
  console.log(cyan(`  ${formatCity(city)}`));
  for (const day of forecast) {
    console.log(formatForecastDay(day, state.unit));
  }
}

async function showAllForecasts(state: AppState): Promise<void> {
  await showForEachCity(state, printCityForecast);
}

async function searchAndAddCity(state: AppState): Promise<void> {
  const query = prompt(cyan("  City name: "))?.trim();
  if (!query) {
    printError("Enter a city name.");
    return;
  }

  const city = await findCity(query);
  if (!city) {
    printError(`No results found for "${query}".`);
    return;
  }

  if (!addCityToState(state, city)) {
    printError(`${formatCity(city)} is already saved.`);
    return;
  }

  await saveState(state);
  const defaultMessage = state.defaultCityId === city.id ? " and set it as default" : "";
  printSuccess(`Added ${formatCity(city)}${defaultMessage}.`);
}

async function removeCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    printError("No cities saved.");
    return;
  }

  const city = selectCity(state, "remove");
  if (!city) {
    printError("Invalid city selection.");
    return;
  }

  removeCityFromState(state, city.id);
  await saveState(state);
  printSuccess(`Removed ${formatCity(city)}.`);
}

async function chooseDefaultCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    printError("No cities saved. Add a city with option 3.");
    return;
  }

  const city = selectCity(state, "set as default");
  if (!city) {
    printError("Invalid city selection.");
    return;
  }

  setDefaultCity(state, city.id);
  await saveState(state);
  printSuccess(`Default city set to ${formatCity(city)}.`);
}

async function changeUnit(state: AppState): Promise<void> {
  const unit = toggleUnit(state);
  await saveState(state);
  printSuccess(`Temperature unit set to ${unitSymbol(unit)}.`);
}

export async function runCli(): Promise<void> {
  const state = await loadState();

  while (true) {
    printMenu(state);
    const answer = prompt(cyan("  Select an option: "));
    if (answer === null) {
      printSuccess("Goodbye!");
      return;
    }

    const option = answer.trim();
    if (option === "9") {
      printSuccess("Goodbye!");
      return;
    }

    try {
      switch (option) {
        case "1":
          await showDefaultWeather(state);
          break;
        case "2":
          await showAllWeather(state);
          break;
        case "3":
          await searchAndAddCity(state);
          break;
        case "4":
          await removeCity(state);
          break;
        case "5":
          await chooseDefaultCity(state);
          break;
        case "6":
          await showAllForecasts(state);
          break;
        case "8":
          await changeUnit(state);
          break;
        default:
          printError("Invalid option. Select 1, 2, 3, 4, 5, 6, 8, or 9.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      printError(`Error: ${message}`);
    }
  }
}
