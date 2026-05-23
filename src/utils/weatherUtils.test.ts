import { convertTemp, formatTemp, getFiveDayOutlook } from "./weatherUtils";
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
