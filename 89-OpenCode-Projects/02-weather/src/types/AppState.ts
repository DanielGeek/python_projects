import type { City } from "./City";
import type { TemperatureUnit } from "./Weather";

export interface AppState {
  cities: City[];
  defaultCityId: number | null;
  unit: TemperatureUnit;
}
