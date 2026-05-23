import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CITIES } from "../common";
import { getWeatherByCityIds } from "../services/weatherApi";
import { CityQuery } from "../types";
import { weatherToCityQuery } from "../utils/cityMappers";
import { searchParamsToCityQuery } from "../utils/cityQuery";
import { useGeolocation } from "./useGeolocation";

interface UseInitialCityOptions {
  onCitySelected: (city: CityQuery, addToRecent: boolean) => void;
}

export const useInitialCity = ({ onCitySelected }: UseInitialCityOptions) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initializing, setInitializing] = useState(true);
  const initStarted = useRef(false);
  const { requestCity, error: locationError, locating, setError } = useGeolocation();

  const loadFallbackCity = useCallback(async () => {
    try {
      const fallback = await getWeatherByCityIds([CITIES[0].id]);
      if (fallback[0]) {
        onCitySelected(weatherToCityQuery(fallback[0]), false);
        setError("Using default city — location unavailable.");
      }
    } catch {
      setError("Could not load weather. Try searching for a city.");
    }
  }, [onCitySelected, setError]);

  useEffect(() => {
    const cityFromUrl = searchParamsToCityQuery(searchParams);
    if (!cityFromUrl) return;

    onCitySelected(cityFromUrl, true);
    setInitializing(false);
    setSearchParams({}, { replace: true });
  }, [searchParams, onCitySelected, setSearchParams]);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    if (searchParamsToCityQuery(searchParams)) {
      setInitializing(false);
      return;
    }

    const init = async () => {
      const city = await requestCity();
      if (city) {
        onCitySelected(city, false);
      } else {
        await loadFallbackCity();
      }
      setInitializing(false);
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    const city = await requestCity();
    if (city) {
      onCitySelected(city, true);
    }
  }, [requestCity, onCitySelected]);

  return { initializing, locationError, locating, requestCurrentLocation };
};
