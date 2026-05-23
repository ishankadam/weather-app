import { useCallback, useState } from "react";
import { reverseGeocode } from "../services/weatherApi";
import { CityQuery } from "../types";
import { geocodingToCityQuery } from "../utils/cityMappers";

interface GeolocationOptions {
  timeoutMs?: number;
}

export const useGeolocation = ({ timeoutMs = 10000 }: GeolocationOptions = {}) => {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveCoordinates = useCallback(
    async (lat: number, lon: number): Promise<CityQuery | null> => {
      const results = await reverseGeocode(lat, lon);
      return results[0] ? geocodingToCityQuery(results[0]) : null;
    },
    [],
  );

  const requestCity = useCallback((): Promise<CityQuery | null> => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return Promise.resolve(null);
    }

    setLocating(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const city = await resolveCoordinates(
              position.coords.latitude,
              position.coords.longitude,
            );
            if (!city) {
              setError("Could not resolve your location to a city.");
            }
            resolve(city);
          } catch {
            setError("Failed to look up your location.");
            resolve(null);
          } finally {
            setLocating(false);
          }
        },
        () => {
          setError("Location permission denied or unavailable.");
          setLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: timeoutMs },
      );
    });
  }, [resolveCoordinates, timeoutMs]);

  const clearError = useCallback(() => setError(null), []);

  return { locating, error, requestCity, clearError, setError };
};
