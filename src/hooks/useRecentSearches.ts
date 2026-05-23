import { useCallback, useState } from "react";
import { CityQuery } from "../types";
import { cityKey } from "../context/FavoritesContext";

const RECENT_KEY = "weather-app-recent-searches";
const MAX_RECENT = 5;

const loadRecent = (): CityQuery[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CityQuery[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};

export const useRecentSearches = () => {
  const [recent, setRecent] = useState<CityQuery[]>(loadRecent);

  const addRecent = useCallback((city: CityQuery) => {
    setRecent((prev) => {
      const key = cityKey(city);
      const without = prev.filter((item) => cityKey(item) !== key);
      const next = [city, ...without].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  return { recent, addRecent, clearRecent };
};
