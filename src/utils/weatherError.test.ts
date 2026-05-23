import {
  getWeatherErrorTitle,
  isWeatherErrorKind,
  WEATHER_ERROR_TITLES,
} from "./weatherError";

describe("isWeatherErrorKind", () => {
  it("narrows valid error kinds", () => {
    expect(isWeatherErrorKind("not_found")).toBe(true);
    expect(isWeatherErrorKind("rate_limit")).toBe(true);
    expect(isWeatherErrorKind("invalid")).toBe(false);
  });
});

describe("getWeatherErrorTitle", () => {
  it("returns a title for each known kind", () => {
    (Object.keys(WEATHER_ERROR_TITLES) as Array<keyof typeof WEATHER_ERROR_TITLES>).forEach(
      (kind) => {
        expect(getWeatherErrorTitle({ kind, message: "test" })).toBe(
          WEATHER_ERROR_TITLES[kind],
        );
      },
    );
  });
});
