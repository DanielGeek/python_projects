import { searchAndAddCity } from "../actions/addCity";
import { changeUnit } from "../actions/changeUnit";
import { showAllCitiesForecast } from "../actions/getForecast";
import { showAllCitiesWeather, showDefaultCityWeather } from "../actions/getWeather";
import { listSavedCities } from "../actions/listCities";
import { removeCity } from "../actions/removeCity";
import { chooseDefaultCity } from "../actions/setDefaultCity";
import { loadAppState } from "../storage/index";
import type { AppState } from "../types/AppState";
import type { MenuOption } from "../types/MenuOption";
import { cyan } from "../utils/colors";
import { DIVIDER } from "../utils/constants";
import { unitSymbol } from "../utils/format";
import { askQuestion } from "./input";
import { printError, printSuccess } from "./output";

const OPTIONS_BY_KEY: Record<string, MenuOption> = {
  "1": "default-city-weather",
  "2": "all-cities-weather",
  "3": "add-city",
  "4": "remove-city",
  "5": "set-default-city",
  "6": "seven-day-forecast",
  "7": "list-cities",
  "8": "toggle-unit",
  "9": "exit",
};

export function parseMenuOption(input: string): MenuOption | null {
  return OPTIONS_BY_KEY[input] ?? null;
}

const OPTION_HANDLERS: Record<
  Exclude<MenuOption, "exit">,
  (state: AppState) => Promise<void>
> = {
  "default-city-weather": showDefaultCityWeather,
  "all-cities-weather": showAllCitiesWeather,
  "add-city": searchAndAddCity,
  "remove-city": removeCity,
  "set-default-city": chooseDefaultCity,
  "seven-day-forecast": showAllCitiesForecast,
  "list-cities": listSavedCities,
  "toggle-unit": changeUnit,
};

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
    "  7. List saved cities",
    `  8. Settings (${unitSymbol(state.unit)})`,
    "  9. Exit",
    DIVIDER,
  ].join("\n");

  console.log(cyan(menu));
}

export async function runMenu(): Promise<void> {
  const state = await loadAppState();

  while (true) {
    printMenu(state);
    const input = askQuestion("Select an option:");
    if (input === null) {
      printSuccess("Goodbye!");
      return;
    }

    const option = parseMenuOption(input);
    if (option === "exit") {
      printSuccess("Goodbye!");
      return;
    }

    if (!option) {
      printError("Invalid option. Select 1, 2, 3, 4, 5, 6, 7, 8, or 9.");
      continue;
    }

    try {
      await OPTION_HANDLERS[option](state);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      printError(`Error: ${message}`);
    }
  }
}
