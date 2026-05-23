import { useEffect, useState } from "react";
import { searchCities } from "../services/weatherApi";
import { GeocodingResult } from "../types";
import { useDebounce } from "./useDebounce";

export const useCitySuggestions = (query: string) => {
  const debouncedQuery = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    searchCities(debouncedQuery, controller.signal)
      .then((results) => {
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          (error.name === "AbortError" || error.message === "Aborted")
        ) {
          return;
        }
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return { suggestions, loading };
};
