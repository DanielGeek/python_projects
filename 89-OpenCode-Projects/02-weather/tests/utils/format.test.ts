import { describe, expect, test } from "bun:test";
import type { City } from "../../src/types/City";
import {
  formatCity,
  formatForecastDate,
  formatTemperature,
  unitSymbol,
} from "../../src/utils/format";

const ottawa: City = {
  id: 1,
  name: "Ottawa",
  admin1: "Ontario",
  country: "Canada",
  latitude: 45.41117,
  longitude: -75.69812,
};

describe("formatters", () => {
  test("formats a city with its region and country", () => {
    expect(formatCity(ottawa)).toBe("Ottawa, Ontario, Canada");
  });

  test("skips missing city details", () => {
    const city: City = { ...ottawa, admin1: undefined, country: undefined };
    expect(formatCity(city)).toBe("Ottawa");
  });

  test("maps units to symbols", () => {
    expect(unitSymbol("celsius")).toBe("°C");
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });

  test("formats a temperature with its unit", () => {
    expect(formatTemperature(5.2, "celsius")).toBe("5.2 °C");
    expect(formatTemperature(-2.1, "fahrenheit")).toBe("-2.1 °F");
  });

  test("formats a forecast date with its weekday", () => {
    expect(formatForecastDate("2026-11-21")).toBe("Sat, Nov 21");
  });
});
