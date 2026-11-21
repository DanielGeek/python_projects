import { describe, expect, test } from "bun:test";
import { environment } from "../src/config";
import {
  findCity,
  getCurrentTemperature,
  type Fetcher,
} from "../src/open-meteo";
import type { City } from "../src/types";

const ottawa: City = {
  id: 6094817,
  name: "Ottawa",
  admin1: "Ontario",
  country: "Canada",
  latitude: 45.41117,
  longitude: -75.69812,
};

describe("Open-Meteo client", () => {
  test("finds a city using the configured geocoding endpoint", async () => {
    const requests: URL[] = [];
    const fetcher: Fetcher = async (input) => {
      requests.push(new URL(String(input)));
      return Response.json({ results: [ottawa] });
    };

    const city = await findCity("Ottawa", fetcher);

    expect(city).toEqual(ottawa);
    expect(requests).toHaveLength(1);
    const url = requests[0]!;
    expect(url.origin + url.pathname).toBe(environment.openMeteoGeocodingUrl);
    expect(url.searchParams.get("name")).toBe("Ottawa");
    expect(url.searchParams.get("count")).toBe("1");
    expect(url.searchParams.get("language")).toBe("en");
    expect(url.searchParams.get("format")).toBe("json");
  });

  test("returns null when no city matches", async () => {
    const fetcher: Fetcher = async () => Response.json({ results: [] });
    expect(await findCity("Nowhere", fetcher)).toBeNull();
  });

  test("gets weather using the configured forecast endpoint", async () => {
    const requests: URL[] = [];
    const fetcher: Fetcher = async (input) => {
      requests.push(new URL(String(input)));
      return Response.json({ current: { temperature_2m: 52.3 } });
    };

    const temperature = await getCurrentTemperature(ottawa, "fahrenheit", fetcher);

    expect(temperature).toBe(52.3);
    const url = requests[0]!;
    expect(url.origin + url.pathname).toBe(environment.openMeteoForecastUrl);
    expect(url.searchParams.get("latitude")).toBe(String(ottawa.latitude));
    expect(url.searchParams.get("longitude")).toBe(String(ottawa.longitude));
    expect(url.searchParams.get("current")).toBe("temperature_2m");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });

  test("reports HTTP errors", async () => {
    const fetcher: Fetcher = async () => new Response("Unavailable", { status: 503 });
    await expect(findCity("Ottawa", fetcher)).rejects.toThrow(
      "Open-Meteo request failed with status 503.",
    );
  });
});
