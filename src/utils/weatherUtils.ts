import { DayForecast, ForecastItem } from "../types";

export type TempUnit = "C" | "F";

const TEMP_UNIT_KEY = "weather-app-temp-unit";

export const convertTemp = (celsius: number, unit: TempUnit): number =>
  unit === "C" ? Math.round(celsius) : Math.round((celsius * 9) / 5 + 32);

export const formatTemp = (celsius: number, unit: TempUnit): string =>
  `${convertTemp(celsius, unit)}°${unit === "C" ? "C" : "F"}`;

export const weatherIconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`;

export const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

export const getCountryName = (countryCode: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode);
  } catch {
    return countryCode;
  }
};

export const formatCityLabel = (name: string, country: string, state?: string) => {
  const region = getCountryName(country) ?? country;
  if (state) return `${name}, ${state}, ${region}`;
  return `${name}, ${region}`;
};

export const getStoredTempUnit = (): TempUnit => {
  const stored = localStorage.getItem(TEMP_UNIT_KEY);
  return stored === "F" ? "F" : "C";
};

export const setStoredTempUnit = (unit: TempUnit) => {
  localStorage.setItem(TEMP_UNIT_KEY, unit);
};

export const formatUnixTime = (
  unixSeconds: number,
  timezoneOffsetSeconds: number,
  options: Intl.DateTimeFormatOptions,
) => {
  const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  return date.toLocaleTimeString("en-US", { ...options, timeZone: "UTC" });
};

export const formatHourLabel = (dtTxt: string) => {
  const date = new Date(dtTxt.replace(" ", "T"));
  return date
    .toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
    .replace(" ", "")
    .toUpperCase();
};

export const getTodayItems = (list: ForecastItem[]) => {
  if (!list.length) return [];
  const today = list[0].dt_txt.split(" ")[0];
  return list.filter((item) => item.dt_txt.startsWith(today));
};

export const formatDayDate = (dtTxt: string) => {
  const date = new Date(dtTxt.replace(" ", "T"));
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const formatted = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return { day, formatted };
};

export const formatDayDateFromUnix = (
  unixSeconds: number,
  timezoneOffsetSeconds: number,
) => {
  const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  const day = date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const formatted = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return { day, formatted };
};

export const getTomorrowOutlook = (list: ForecastItem[]) => {
  if (!list.length) return null;
  const today = list[0].dt_txt.split(" ")[0];
  const tomorrowItems = list.filter((item) => !item.dt_txt.startsWith(today));
  if (!tomorrowItems.length) return null;

  const tomorrowDate = tomorrowItems[0].dt_txt.split(" ")[0];
  const sameDayItems = tomorrowItems.filter((item) =>
    item.dt_txt.startsWith(tomorrowDate),
  );
  return sameDayItems[Math.floor(sameDayItems.length / 2)] ?? tomorrowItems[0];
};

export const getMaxPopToday = (items: ForecastItem[]) => {
  if (!items.length) return 0;
  return Math.max(...items.map((i) => i.pop ?? 0));
};

export const getDayLength = (sunrise: number, sunset: number) => {
  const totalMinutes = Math.floor((sunset - sunrise) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const getTodayHighLow = (items: ForecastItem[]) => {
  if (!items.length) return { high: 0, low: 0 };
  return {
    high: Math.max(...items.map((i) => i.main.temp_max)),
    low: Math.min(...items.map((i) => i.main.temp_min)),
  };
};

export const windDirectionLabel = (deg: number) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

export const getWeatherHeroGradient = (icon: string) => {
  const isNight = icon.endsWith("n");
  if (icon.startsWith("09") || icon.startsWith("10") || icon.startsWith("11")) {
    return isNight
      ? "linear-gradient(135deg, #1a1f3c 0%, #2d3561 50%, #4a5568 100%)"
      : "linear-gradient(135deg, #37474f 0%, #546e7a 50%, #78909c 100%)";
  }
  if (icon.startsWith("13")) {
    return isNight
      ? "linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #4a6fa5 100%)"
      : "linear-gradient(135deg, #90caf9 0%, #64b5f6 50%, #42a5f5 100%)";
  }
  if (icon.startsWith("50")) {
    return "linear-gradient(135deg, #455a64 0%, #607d8b 50%, #78909c 100%)";
  }
  if (icon.startsWith("02") || icon.startsWith("03") || icon.startsWith("04")) {
    return isNight
      ? "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)"
      : "linear-gradient(135deg, #5c6bc0 0%, #7986cb 50%, #9fa8da 100%)";
  }
  return isNight
    ? "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)"
    : "linear-gradient(135deg, #1565c0 0%, #42a5f5 50%, #90caf9 100%)";
};

export const getFiveDayOutlook = (list: ForecastItem[]): DayForecast[] => {
  const byDay = new Map<string, ForecastItem[]>();

  for (const item of list) {
    const day = item.dt_txt.split(" ")[0];
    const bucket = byDay.get(day) ?? [];
    bucket.push(item);
    byDay.set(day, bucket);
  }

  return Array.from(byDay.entries())
    .slice(0, 5)
    .map(([dateKey, items], index) => {
      const high = Math.max(...items.map((i) => i.main.temp_max));
      const low = Math.min(...items.map((i) => i.main.temp_min));
      const avgTemp =
        items.reduce((sum, i) => sum + i.main.temp, 0) / items.length;
      const midday = items[Math.floor(items.length / 2)] ?? items[0];
      const date = new Date(`${dateKey}T12:00:00`);
      const label =
        index === 0
          ? "Today"
          : date.toLocaleDateString("en-US", { weekday: "short" });

      return {
        dateKey,
        label,
        high,
        low,
        avgTemp,
        icon: midday.weather[0].icon,
        description: midday.weather[0].description,
      };
    });
};
