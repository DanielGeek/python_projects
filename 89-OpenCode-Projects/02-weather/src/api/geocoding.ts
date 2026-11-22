import { parseCity, type City } from "../types/City";
import { environment } from "../utils/environment";
import { asRecord, requestJson, type Fetcher } from "./client";

export async function findCity(
  query: string,
  fetcher: Fetcher = fetch,
): Promise<City | null> {
  const url = new URL(environment.openMeteoGeocodingUrl);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const payload = asRecord(await requestJson(url, fetcher));
  const results = payload?.results;

  if (!Array.isArray(results)) {
    throw new Error("Open-Meteo returned an invalid city search response.");
  }

  if (results.length === 0) {
    return null;
  }

  const city = parseCity(results[0]);
  if (!city) {
    throw new Error("Open-Meteo returned invalid city coordinates.");
  }

  return city;
}
