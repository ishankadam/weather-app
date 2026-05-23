import axios from "axios";
import { parseApiError } from "./weatherApi";

describe("parseApiError", () => {
  it("maps 404 responses to not_found", () => {
    const error = {
      isAxiosError: true,
      response: { status: 404, data: { message: "city not found" } },
    };
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = parseApiError(error);
    expect(result.kind).toBe("not_found");
    expect(result.message).toMatch(/not found/i);
  });

  it("maps 429 responses to rate_limit", () => {
    const error = {
      isAxiosError: true,
      response: { status: 429, data: {} },
    };
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = parseApiError(error);
    expect(result.kind).toBe("rate_limit");
    expect(result.message).toMatch(/rate limit/i);
  });

  it("maps missing responses to network errors", () => {
    const error = {
      isAxiosError: true,
      response: undefined,
    };
    jest.spyOn(axios, "isAxiosError").mockReturnValue(true);

    const result = parseApiError(error);
    expect(result.kind).toBe("network");
    expect(result.message).toMatch(/network/i);
  });
});
