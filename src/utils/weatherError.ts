import { WeatherError, WeatherErrorKind } from "../types";

export const WEATHER_ERROR_TITLES: Record<WeatherErrorKind, string> = {
  not_found: "City not found",
  rate_limit: "Rate limit reached",
  network: "Connection problem",
  unknown: "Something went wrong",
};

export const isWeatherErrorKind = (kind: string): kind is WeatherErrorKind =>
  kind === "not_found" ||
  kind === "rate_limit" ||
  kind === "network" ||
  kind === "unknown";

export const getWeatherErrorTitle = (error: WeatherError): string =>
  WEATHER_ERROR_TITLES[error.kind];
