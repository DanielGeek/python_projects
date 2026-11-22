import { describe, expect, test } from "bun:test";
import type { Fetcher } from "../../src/api/client";
import { getCurrentWeather, getDailyForecast } from "../../src/api/weather";
import type { City } from "../../src/types/City";
import { environment } from "../../src/utils/environment";

const ottawa: City = {
  id: 6094817,
  name: "Ottawa",
  admin1: "Ontario",
  country: "Canada",
  latitude: 45.41117,
  longitude: -75.69812,
};

describe("Open-Meteo weather", () => {
  test("gets current weather using the configured forecast endpoint", async () => {
    const requests: URL[] = [];
    const fetcher: Fetcher = async (input) => {
      requests.push(new URL(String(input)));
      return Response.json({
        current: { temperature_2m: 52.3, weather_code: 2 },
      });
    };

    const weather = await getCurrentWeather(ottawa, "fahrenheit", fetcher);

    expect(weather).toEqual({ temperature: 52.3, weatherCode: 2 });
    const url = requests[0]!;
    expect(url.origin + url.pathname).toBe(environment.openMeteoForecastUrl);
    expect(url.searchParams.get("latitude")).toBe(String(ottawa.latitude));
    expect(url.searchParams.get("longitude")).toBe(String(ottawa.longitude));
    expect(url.searchParams.get("current")).toBe("temperature_2m,weather_code");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });

  test("rejects a weather response without a weather code", async () => {
    const fetcher: Fetcher = async () =>
      Response.json({ current: { temperature_2m: 52.3 } });

    await expect(
      getCurrentWeather(ottawa, "fahrenheit", fetcher),
    ).rejects.toThrow("Open-Meteo returned an invalid weather response.");
  });

  test("gets the 7 day forecast using the configured forecast endpoint", async () => {
    const requests: URL[] = [];
    const fetcher: Fetcher = async (input) => {
      requests.push(new URL(String(input)));
      return Response.json({
        daily: {
          time: ["2026-11-21", "2026-11-22"],
          temperature_2m_max: [30.1, 28.4],
          temperature_2m_min: [15.2, 14.8],
        },
      });
    };

    const forecast = await getDailyForecast(ottawa, "fahrenheit", fetcher);

    expect(forecast).toEqual([
      { date: "2026-11-21", maxTemperature: 30.1, minTemperature: 15.2 },
      { date: "2026-11-22", maxTemperature: 28.4, minTemperature: 14.8 },
    ]);
    const url = requests[0]!;
    expect(url.origin + url.pathname).toBe(environment.openMeteoForecastUrl);
    expect(url.searchParams.get("latitude")).toBe(String(ottawa.latitude));
    expect(url.searchParams.get("longitude")).toBe(String(ottawa.longitude));
    expect(url.searchParams.get("daily")).toBe(
      "temperature_2m_max,temperature_2m_min",
    );
    expect(url.searchParams.get("forecast_days")).toBe("7");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(url.searchParams.get("timezone")).toBe("auto");
  });

  test("rejects a forecast response with mismatched daily arrays", async () => {
    const fetcher: Fetcher = async () =>
      Response.json({
        daily: {
          time: ["2026-11-21"],
          temperature_2m_max: [30.1, 28.4],
          temperature_2m_min: [15.2],
        },
      });

    await expect(getDailyForecast(ottawa, "celsius", fetcher)).rejects.toThrow(
      "Open-Meteo returned an invalid forecast response.",
    );
  });

  test("rejects a forecast response without daily data", async () => {
    const fetcher: Fetcher = async () => Response.json({});

    await expect(getDailyForecast(ottawa, "celsius", fetcher)).rejects.toThrow(
      "Open-Meteo returned an invalid forecast response.",
    );
  });
});
