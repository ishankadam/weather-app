import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CityQuery, SavedCity } from "../types";

const FAVORITES_KEY = "weather-app-favorites";

const loadFavorites = (): SavedCity[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedCity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toCityQuery = (city: SavedCity): CityQuery => ({
  name: city.name,
  country: city.country,
  lat: city.lat,
  lon: city.lon,
});

const cityKey = (city: Pick<SavedCity, "lat" | "lon">) =>
  `${city.lat.toFixed(4)},${city.lon.toFixed(4)}`;

interface FavoritesContextValue {
  favorites: SavedCity[];
  isFavorite: (city: CityQuery) => boolean;
  toggleFavorite: (city: CityQuery) => void;
  removeFavorite: (city: SavedCity) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<SavedCity[]>(loadFavorites);

  const persist = useCallback((next: SavedCity[]) => {
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, []);

  const isFavorite = useCallback(
    (city: CityQuery) =>
      favorites.some((fav) => cityKey(fav) === cityKey(city)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (city: CityQuery) => {
      const key = cityKey(city);
      const exists = favorites.some((fav) => cityKey(fav) === key);
      if (exists) {
        persist(favorites.filter((fav) => cityKey(fav) !== key));
      } else {
        persist([
          ...favorites,
          {
            name: city.name,
            country: city.country,
            lat: city.lat,
            lon: city.lon,
          },
        ]);
      }
    },
    [favorites, persist],
  );

  const removeFavorite = useCallback(
    (city: SavedCity) => {
      persist(favorites.filter((fav) => cityKey(fav) !== cityKey(city)));
    },
    [favorites, persist],
  );

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, isFavorite, toggleFavorite, removeFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
};

export { toCityQuery, cityKey };
