import { describe, expect, test } from "bun:test";
import { describeWeatherCode } from "../src/weather-codes";

describe("Weather codes", () => {
  test("describes known weather codes", () => {
    expect(describeWeatherCode(0)).toBe("Clear sky");
    expect(describeWeatherCode(2)).toBe("Partly cloudy");
    expect(describeWeatherCode(61)).toBe("Slight rain");
    expect(describeWeatherCode(95)).toBe("Thunderstorm");
  });

  test("returns Unknown for codes outside the table", () => {
    expect(describeWeatherCode(-1)).toBe("Unknown");
    expect(describeWeatherCode(4)).toBe("Unknown");
  });
});
