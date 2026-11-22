import { printError } from "../presentation/output";
import type { AppState } from "../types/AppState";
import type { City } from "../types/City";
import { formatCity } from "../utils/format";

export async function runForEachCity(
  state: AppState,
  action: (city: City, state: AppState) => Promise<void>,
): Promise<void> {
  if (state.cities.length === 0) {
    printError("No cities saved. Add a city with option 3.");
    return;
  }

  for (const city of state.cities) {
    try {
      await action(city, state);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      printError(`${formatCity(city)}: ${message}`);
    }
  }
}
