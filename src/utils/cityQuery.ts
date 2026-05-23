import { CityQuery } from "../types";
import { geocodingToCityQuery } from "./cityMappers";

/** @deprecated Use geocodingToCityQuery from cityMappers */
export const geocodingToQuery = geocodingToCityQuery;

export const cityQueryToSearchParams = (city: CityQuery) => {
  const params = new URLSearchParams({
    name: city.name,
    country: city.country,
    lat: String(city.lat),
    lon: String(city.lon),
  });
  return params.toString();
};

export const searchParamsToCityQuery = (
  params: URLSearchParams,
): CityQuery | null => {
  const name = params.get("name");
  const country = params.get("country");
  const lat = params.get("lat");
  const lon = params.get("lon");

  if (!name || !country || !lat || !lon) return null;

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) return null;

  return { name, country, lat: latNum, lon: lonNum };
};
