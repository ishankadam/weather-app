import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../components/button/Button";
import PageLayout from "../../components/layout/PageLayout";
import OtherCitiesGrid from "../../components/weather/OtherCitiesGrid";
import TodayHighlights from "../../components/weather/TodayHighlights";
import {
  CurrentWeatherSkeleton,
  WeatherErrorAlert,
} from "../../components/weather/WeatherStates";
import { CITIES } from "../../common";
import { OTHER_CITIES_COUNT } from "../../constants/ui";
import { useFavorites } from "../../context/FavoritesContext";
import { useTempUnit } from "../../context/TempUnitContext";
import { useAsyncWeather } from "../../hooks/useAsyncWeather";
import { useCitySuggestions } from "../../hooks/useCitySuggestions";
import { useInitialCity } from "../../hooks/useInitialCity";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import {
  getCityForecast,
  getCurrentWeather,
  getWeatherByCityIds,
} from "../../services/weatherApi";
import { CityQuery } from "../../types";
import { cityQueryToSearchParams } from "../../utils/cityQuery";
import {
  capitalize,
  formatCityLabel,
  formatDayDateFromUnix,
  formatTemp,
  getCountryName,
  getMaxPopToday,
  getTodayHighLow,
  getTodayItems,
  getTomorrowOutlook,
} from "../../utils/weatherUtils";
import CitySearchBar from "./components/CitySearchBar";
import CurrentWeatherHero from "./components/CurrentWeatherHero";
import HourlyTomorrowSection from "./components/HourlyTomorrowSection";
import SunTimesCard from "./components/SunTimesCard";

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { unit } = useTempUnit();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recent, addRecent, clearRecent } = useRecentSearches();

  const [selectedCity, setSelectedCity] = useState<CityQuery | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleCitySelected = useCallback(
    (city: CityQuery, addToRecent: boolean) => {
      setSelectedCity(city);
      if (addToRecent) addRecent(city);
      setInputValue(formatCityLabel(city.name, city.country));
    },
    [addRecent],
  );

  const { initializing, locationError, locating, requestCurrentLocation } =
    useInitialCity({ onCitySelected: handleCitySelected });

  const { suggestions, loading: suggestionsLoading } =
    useCitySuggestions(inputValue);

  const cityDeps = [
    selectedCity?.lat,
    selectedCity?.lon,
    selectedCity?.name,
    refreshKey,
  ];

  const { data: weather, loading, error } = useAsyncWeather(
    (signal) => {
      if (!selectedCity) return Promise.reject(new Error("No city"));
      return getCurrentWeather(selectedCity, signal);
    },
    cityDeps,
    Boolean(selectedCity),
  );

  const { data: forecast, loading: forecastLoading } = useAsyncWeather(
    (signal) => {
      if (!selectedCity) return Promise.reject(new Error("No city"));
      return getCityForecast(selectedCity, signal);
    },
    cityDeps,
    Boolean(selectedCity),
  );

  const otherCityIds = useMemo(
    () =>
      CITIES.map((c) => c.id)
        .filter((id) => id !== weather?.id)
        .slice(0, OTHER_CITIES_COUNT),
    [weather?.id],
  );

  const { data: otherCitiesWeather, loading: otherCitiesLoading } = useAsyncWeather(
    (signal) => getWeatherByCityIds(otherCityIds, signal),
    [otherCityIds.join(","), refreshKey],
    otherCityIds.length > 0,
  );

  const selectCity = useCallback(
    (city: CityQuery) => handleCitySelected(city, true),
    [handleCitySelected],
  );

  const handleShare = async () => {
    if (!weather) return;
    const text = `${weather.name}: ${formatTemp(weather.main.temp, unit)}, ${capitalize(weather.weather[0].description)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${weather.name} Weather`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setSnackbar("Weather copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  };

  const todayItems = useMemo(
    () => (forecast ? getTodayItems(forecast.list) : []),
    [forecast],
  );
  const { high, low } = useMemo(() => getTodayHighLow(todayItems), [todayItems]);
  const hourlySlots = forecast?.list.slice(0, 7) ?? [];
  const tomorrow = useMemo(
    () => (forecast ? getTomorrowOutlook(forecast.list) : null),
    [forecast],
  );
  const rainChance = Math.round(getMaxPopToday(todayItems) * 100);
  const uvIndex = weather
    ? Math.min(11, Math.round((100 - weather.clouds.all) / 8))
    : 0;

  const countryLabel = weather
    ? getCountryName(weather.sys.country) ?? weather.sys.country
    : "";

  const { day, formatted } = weather
    ? formatDayDateFromUnix(weather.dt, weather.timezone)
    : { day: "", formatted: "" };

  const showDashboard = selectedCity && weather && !loading && !error && !initializing;
  const showSkeleton = initializing || (selectedCity && loading && !weather);

  return (
    <PageLayout striped>
      <CitySearchBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        onSelectCity={selectCity}
        locating={locating}
        onUseLocation={() => void requestCurrentLocation()}
        locationError={locationError}
        recent={recent}
        onClearRecent={clearRecent}
        selectedCity={selectedCity}
      />

      {showSkeleton && <CurrentWeatherSkeleton />}

      {selectedCity && error && !loading && !initializing && (
        <WeatherErrorAlert error={error} />
      )}

      {showDashboard && selectedCity && weather && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <CurrentWeatherHero
                weather={weather}
                countryLabel={countryLabel}
                unit={unit}
                day={day}
                formattedDate={formatted}
                todayHigh={high}
                todayLow={low}
                isFavorite={isFavorite(selectedCity)}
                onToggleFavorite={() => toggleFavorite(selectedCity)}
                onRefresh={() => setRefreshKey((k) => k + 1)}
                onShare={() => void handleShare()}
              />
              <HourlyTomorrowSection
                loading={forecastLoading}
                hourlySlots={hourlySlots}
                tomorrow={tomorrow}
                unit={unit}
              />
              <SunTimesCard weather={weather} />
              <CustomButton
                fullWidth={false}
                onClick={() =>
                  navigate(`/forecast?${cityQueryToSearchParams(selectedCity)}`)
                }
              >
                View 5-Day Forecast
              </CustomButton>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TodayHighlights
                weather={weather}
                rainChancePercent={rainChance}
                uvIndex={uvIndex}
              />
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Other Cities
                  </Typography>
                  <CustomButton
                    variant="text"
                    fullWidth={false}
                    onClick={() => navigate("/cities")}
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: "0.875rem",
                      p: 0,
                      minWidth: "auto",
                      "&:hover": {
                        bgcolor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Show All
                  </CustomButton>
                </Box>
                <OtherCitiesGrid
                  loading={otherCitiesLoading}
                  cities={otherCitiesWeather ?? []}
                  unit={unit}
                  onSelect={selectCity}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </PageLayout>
  );
};

export default Home;
