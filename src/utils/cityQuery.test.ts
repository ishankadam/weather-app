import { cityQueryToSearchParams, searchParamsToCityQuery } from "./cityQuery";

describe("searchParamsToCityQuery", () => {
  it("parses valid search params", () => {
    const params = new URLSearchParams({
      name: "London",
      country: "GB",
      lat: "51.5074",
      lon: "-0.1278",
    });
    expect(searchParamsToCityQuery(params)).toEqual({
      name: "London",
      country: "GB",
      lat: 51.5074,
      lon: -0.1278,
    });
  });

  it("returns null when params are incomplete", () => {
    expect(searchParamsToCityQuery(new URLSearchParams({ name: "London" }))).toBeNull();
  });

  it("returns null for invalid coordinates", () => {
    const params = new URLSearchParams({
      name: "X",
      country: "GB",
      lat: "abc",
      lon: "1",
    });
    expect(searchParamsToCityQuery(params)).toBeNull();
  });
});

describe("cityQueryToSearchParams", () => {
  it("round-trips with searchParamsToCityQuery", () => {
    const city = {
      name: "Tokyo",
      country: "JP",
      lat: 35.6762,
      lon: 139.6503,
    };
    const query = cityQueryToSearchParams(city);
    const parsed = searchParamsToCityQuery(new URLSearchParams(query));
    expect(parsed).toEqual(city);
  });
});
