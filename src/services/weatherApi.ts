import axios, { AxiosError, isAxiosError } from "axios";
import {
  CityQuery,
  CurrentWeatherResponse,
  ForecastResponse,
  GeocodingResult,
  WeatherError,
  WeatherErrorKind,
} from "../types";

const API_KEY = process.env.REACT_APP_API_KEY;
const API_URL = process.env.REACT_APP_API_URL;
const GEO_URL =
  process.env.REACT_APP_GEO_URL ?? "https://api.openweathermap.org/geo/1.0";

if (!API_KEY || !API_URL) {
  throw new Error(
    "Missing REACT_APP_API_KEY or REACT_APP_API_URL in .env — restart the dev server after changing .env",
  );
}

const weatherClient = axios.create({
  baseURL: API_URL,
  params: { appid: API_KEY, units: "metric" },
});

const geoClient = axios.create({
  baseURL: GEO_URL,
  params: { appid: API_KEY },
});

export class WeatherApiError extends Error {
  kind: WeatherErrorKind;

  constructor(kind: WeatherErrorKind, message: string) {
    super(message);
    this.name = "WeatherApiError";
    this.kind = kind;
  }

  toWeatherError(): WeatherError {
    return { kind: this.kind, message: this.message };
  }
}

export const parseApiError = (error: unknown): WeatherError => {
  if (error instanceof WeatherApiError) {
    return error.toWeatherError();
  }

  if (axios.isCancel(error)) {
    return { kind: "unknown", message: "Request cancelled" };
  }

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; cod?: string }>;

    if (!axiosError.response) {
      return {
        kind: "network",
        message: "Network error — check your connection and try again.",
      };
    }

    const status = axiosError.response.status;
    const apiMessage = axiosError.response.data?.message;

    if (status === 404) {
      return {
        kind: "not_found",
        message: "City not found. Try a different spelling or location.",
      };
    }

    if (status === 429) {
      return {
        kind: "rate_limit",
        message: "API rate limit reached. Please wait a moment and try again.",
      };
    }

    return {
      kind: "unknown",
      message: apiMessage ?? `Request failed (${status})`,
    };
  }

  if (error instanceof Error) {
    return { kind: "unknown", message: error.message };
  }

  return { kind: "unknown", message: "Something went wrong" };
};

const withSignal = <T>(
  request: Promise<T>,
  signal?: AbortSignal,
): Promise<T> => {
  if (!signal) return request;

  if (signal.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    request
      .then(resolve)
      .catch(reject)
      .finally(() => signal.removeEventListener("abort", onAbort));
  });
};

const handleAxios = async <T>(
  promise: Promise<T>,
  signal?: AbortSignal,
): Promise<T> => {
  try {
    return await withSignal(promise, signal);
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "AbortError" || error.message === "Aborted")
    ) {
      throw error;
    }
    const parsed = parseApiError(error);
    throw new WeatherApiError(parsed.kind, parsed.message);
  }
};

export const reverseGeocode = async (
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> => {
  const response = await handleAxios(
    geoClient.get<GeocodingResult[]>("/reverse", {
      params: { lat, lon, limit: 1 },
      signal,
    }),
    signal,
  );

  return response.data;
};

export const searchCities = async (
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const response = await handleAxios(
    geoClient.get<GeocodingResult[]>("/direct", {
      params: { q: trimmed, limit: 5 },
      signal,
    }),
    signal,
  );

  return response.data;
};

export const getCurrentWeather = async (
  query: CityQuery,
  signal?: AbortSignal,
): Promise<CurrentWeatherResponse> => {
  const response = await handleAxios(
    weatherClient.get<CurrentWeatherResponse>("/weather", {
      params: { lat: query.lat, lon: query.lon },
      signal,
    }),
    signal,
  );

  return response.data;
};

export const getCityForecast = async (
  query: CityQuery,
  signal?: AbortSignal,
): Promise<ForecastResponse> => {
  const response = await handleAxios(
    weatherClient.get<ForecastResponse>("/forecast", {
      params: { lat: query.lat, lon: query.lon },
      signal,
    }),
    signal,
  );

  return response.data;
};

export const getFavoritesWeather = async (
  cities: CityQuery[],
  signal?: AbortSignal,
): Promise<CurrentWeatherResponse[]> => {
  if (!cities.length) return [];

  const results = await Promise.all(
    cities.map((city) => getCurrentWeather(city, signal)),
  );

  return results;
};

export const getWeatherByCityIds = async (
  cityIds: number[],
  signal?: AbortSignal,
): Promise<CurrentWeatherResponse[]> => {
  if (!cityIds.length) return [];

  const results = await Promise.all(
    cityIds.map((id) =>
      handleAxios(
        weatherClient.get<CurrentWeatherResponse>("/weather", {
          params: { id },
          signal,
        }),
        signal,
      ).then((res) => res.data),
    ),
  );

  return results;
};
