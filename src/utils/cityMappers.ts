import { CityQuery, CurrentWeatherResponse, GeocodingResult } from "../types";

export const geocodingToCityQuery = (result: GeocodingResult): CityQuery => ({
  name: result.name,
  country: result.country,
  lat: result.lat,
  lon: result.lon,
});

export const weatherToCityQuery = (weather: CurrentWeatherResponse): CityQuery => ({
  name: weather.name,
  country: weather.sys.country,
  lat: weather.coord.lat,
  lon: weather.coord.lon,
});
