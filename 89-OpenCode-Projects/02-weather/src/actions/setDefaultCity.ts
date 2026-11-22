import { selectCity } from "../presentation/input";
import { printError, printSuccess } from "../presentation/output";
import { saveCities, setDefaultCity as setDefaultCityInState } from "../storage/citiesStorage";
import type { AppState } from "../types/AppState";
import { formatCity } from "../utils/format";

export async function chooseDefaultCity(state: AppState): Promise<void> {
  if (state.cities.length === 0) {
    printError("No cities saved. Add a city with option 3.");
    return;
  }

  const city = selectCity(state, "set as default");
  if (!city) {
    printError("Invalid city selection.");
    return;
  }

  setDefaultCityInState(state, city.id);
  await saveCities(state);
  printSuccess(`Default city set to ${formatCity(city)}.`);
}
