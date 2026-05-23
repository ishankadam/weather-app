import {
  convertTemp,
  formatTemp,
  getFiveDayOutlook,
  getTodayHighLow,
  getTomorrowOutlook,
} from "./weatherUtils";
import { ForecastItem } from "../types";

describe("convertTemp", () => {
  it("returns rounded Celsius when unit is C", () => {
    expect(convertTemp(20.4, "C")).toBe(20);
    expect(convertTemp(-3.6, "C")).toBe(-4);
  });

  it("converts to Fahrenheit when unit is F", () => {
    expect(convertTemp(0, "F")).toBe(32);
    expect(convertTemp(100, "F")).toBe(212);
  });
});

describe("formatTemp", () => {
  it("formats with the correct unit suffix", () => {
    expect(formatTemp(25, "C")).toBe("25°C");
    expect(formatTemp(25, "F")).toBe("77°F");
  });
});

describe("getFiveDayOutlook", () => {
  const makeItem = (date: string, temp: number): ForecastItem => ({
    dt: 0,
    dt_txt: `${date} 12:00:00`,
    main: {
      temp,
      feels_like: temp,
      temp_min: temp - 2,
      temp_max: temp + 2,
      humidity: 50,
      pressure: 1010,
    },
    weather: [
      {
        id: 800,
        main: "Clear",
        description: "clear sky",
        icon: "01d",
      },
    ],
    clouds: { all: 0 },
    wind: { speed: 3, deg: 180 },
  });

  it("groups forecast items into at most five days", () => {
    const list = [
      makeItem("2026-05-23", 20),
      makeItem("2026-05-23", 22),
      makeItem("2026-05-24", 18),
      makeItem("2026-05-25", 16),
      makeItem("2026-05-26", 14),
      makeItem("2026-05-27", 12),
      makeItem("2026-05-28", 10),
    ];

    const outlook = getFiveDayOutlook(list);
    expect(outlook).toHaveLength(5);
    expect(outlook[0].label).toBe("Today");
    expect(outlook[0].high).toBe(24);
    expect(outlook[0].low).toBe(18);
  });
});

describe("getTodayHighLow", () => {
  const makeItem = (date: string, min: number, max: number) => ({
    dt: 0,
    dt_txt: `${date} 12:00:00`,
    main: {
      temp: (min + max) / 2,
      feels_like: 0,
      temp_min: min,
      temp_max: max,
      humidity: 50,
      pressure: 1010,
    },
    weather: [{ id: 800, main: "Clear", description: "clear", icon: "01d" }],
    clouds: { all: 0 },
    wind: { speed: 1, deg: 0 },
  });

  it("returns zeroes for empty input", () => {
    expect(getTodayHighLow([])).toEqual({ high: 0, low: 0 });
  });

  it("computes min and max across items", () => {
    const items = [
      makeItem("2026-05-23", 10, 22),
      makeItem("2026-05-23", 12, 26),
    ];
    expect(getTodayHighLow(items)).toEqual({ high: 26, low: 10 });
  });
});

describe("getTomorrowOutlook", () => {
  const makeItem = (date: string) => ({
    dt: 0,
    dt_txt: `${date} 15:00:00`,
    main: {
      temp: 20,
      feels_like: 20,
      temp_min: 18,
      temp_max: 22,
      humidity: 50,
      pressure: 1010,
    },
    weather: [{ id: 200, main: "Thunderstorm", description: "storm", icon: "11d" }],
    clouds: { all: 80 },
    wind: { speed: 5, deg: 180 },
  });

  it("returns null when only one day exists", () => {
    expect(getTomorrowOutlook([makeItem("2026-05-23")])).toBeNull();
  });

  it("returns a slot from the day after today", () => {
    const list = [
      makeItem("2026-05-23"),
      makeItem("2026-05-24"),
      makeItem("2026-05-24"),
    ];
    const tomorrow = getTomorrowOutlook(list);
    expect(tomorrow?.dt_txt.startsWith("2026-05-24")).toBe(true);
  });
});
