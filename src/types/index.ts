export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeatherResponse {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: WeatherCondition[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  pop?: number;
  dt_txt: string;
}

export interface ForecastCity {
  id: number;
  name: string;
  country: string;
  sunrise: number;
  sunset: number;
  timezone: number;
  coord: { lat: number; lon: number };
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: ForecastCity;
}

export interface SavedCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface CityQuery {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface DayForecast {
  dateKey: string;
  label: string;
  high: number;
  low: number;
  icon: string;
  description: string;
  avgTemp: number;
}

export type WeatherErrorKind =
  | "not_found"
  | "rate_limit"
  | "network"
  | "unknown";

export interface WeatherError {
  kind: WeatherErrorKind;
  message: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: WeatherError | null;
}
