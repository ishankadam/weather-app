import AirIcon from "@mui/icons-material/Air";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CITIES } from "../../common";
import { useNavigate, useSearchParams } from "react-router-dom";
import CustomAutocomplete from "../../components/autocomplete/Autocomplete";
import CustomButton from "../../components/button/Button";
import TempUnitToggle from "../../components/weather/TempUnitToggle";
import {
  CurrentWeatherSkeleton,
  WeatherCard,
  WeatherErrorAlert,
} from "../../components/weather/WeatherStates";
import { useFavorites } from "../../context/FavoritesContext";
import { SIDEBAR_LEFT_OFFSET } from "../../context/SidebarContext";
import { useTempUnit } from "../../context/TempUnitContext";
import { useAsyncWeather } from "../../hooks/useAsyncWeather";
import { useCitySuggestions } from "../../hooks/useCitySuggestions";
import { useRecentSearches } from "../../hooks/useRecentSearches";
import {
  getCityForecast,
  getCurrentWeather,
  getWeatherByCityIds,
  reverseGeocode,
} from "../../services/weatherApi";
import { CityQuery, CurrentWeatherResponse, GeocodingResult } from "../../types";
import {
  cityQueryToSearchParams,
  geocodingToQuery,
  searchParamsToCityQuery,
} from "../../utils/cityQuery";
import {
  capitalize,
  convertTemp,
  formatCityLabel,
  formatDayDateFromUnix,
  formatHourLabel,
  formatTemp,
  formatUnixTime,
  getCountryName,
  getDayLength,
  getMaxPopToday,
  getTodayHighLow,
  getTodayItems,
  getTomorrowOutlook,
  weatherIconUrl,
} from "../../utils/weatherUtils";

const CARD_BG = "#161a28";
const CARD_BORDER = "1px solid rgba(255, 255, 255, 0.06)";

const STRETCH_GRID = { display: "flex", minWidth: 0 } as const;

const EQUAL_HEIGHT = {
  flex: 1,
  width: "100%",
  minHeight: { xs: 132, sm: 140 },
  display: "flex",
  flexDirection: "column",
} as const;

const HIGHLIGHT_FOOTER = {
  mt: "auto",
  minHeight: 40,
  display: "flex",
  alignItems: "flex-end",
} as const;

const OTHER_CITIES_COUNT = 4;

const weatherToCityQuery = (w: CurrentWeatherResponse): CityQuery => ({
  name: w.name,
  country: w.sys.country,
  lat: w.coord.lat,
  lon: w.coord.lon,
});

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { unit } = useTempUnit();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recent, addRecent, clearRecent } = useRecentSearches();

  const [inputValue, setInputValue] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityQuery | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [locating, setLocating] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const initStarted = useRef(false);

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

  const otherCityIds = useMemo(() => {
    const excludeId = weather?.id;
    return CITIES.map((c) => c.id)
      .filter((id) => id !== excludeId)
      .slice(0, OTHER_CITIES_COUNT);
  }, [weather?.id]);

  const { data: otherCitiesWeather, loading: otherCitiesLoading } = useAsyncWeather(
    (signal) => getWeatherByCityIds(otherCityIds, signal),
    [otherCityIds.join(","), refreshKey],
    otherCityIds.length > 0,
  );

  const selectCity = useCallback(
    (city: CityQuery, addToRecent = true) => {
      setSelectedCity(city);
      if (addToRecent) addRecent(city);
      setInputValue(formatCityLabel(city.name, city.country));
      setLocationError(null);
    },
    [addRecent],
  );

  const resolveLocation = useCallback(
    async (lat: number, lon: number): Promise<boolean> => {
      const results = await reverseGeocode(lat, lon);
      if (results[0]) {
        selectCity(geocodingToQuery(results[0]), false);
        return true;
      }
      return false;
    },
    [selectCity],
  );

  const loadFallbackCity = useCallback(async () => {
    try {
      const fallback = await getWeatherByCityIds([CITIES[0].id]);
      if (fallback[0]) {
        selectCity(weatherToCityQuery(fallback[0]), false);
        setLocationError("Using default city — location unavailable.");
      }
    } catch {
      setLocationError("Could not load weather. Try searching for a city.");
    }
  }, [selectCity]);

  useEffect(() => {
    const cityFromUrl = searchParamsToCityQuery(searchParams);
    if (!cityFromUrl) return;

    selectCity(cityFromUrl);
    setInitializing(false);
    setSearchParams({}, { replace: true });
  }, [searchParams, selectCity, setSearchParams]);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    if (searchParamsToCityQuery(searchParams)) {
      setInitializing(false);
      return;
    }

    const init = async () => {
      if (!navigator.geolocation) {
        await loadFallbackCity();
        setInitializing(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const ok = await resolveLocation(
              position.coords.latitude,
              position.coords.longitude,
            );
            if (!ok) await loadFallbackCity();
          } catch {
            await loadFallbackCity();
          } finally {
            setInitializing(false);
          }
        },
        async () => {
          setLocationError("Location permission denied — showing default city.");
          await loadFallbackCity();
          setInitializing(false);
        },
        { enableHighAccuracy: false, timeout: 10000 },
      );
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGeocodingSelect = (result: GeocodingResult | null) => {
    if (!result) return;
    selectCity(geocodingToQuery(result));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const ok = await resolveLocation(
            position.coords.latitude,
            position.coords.longitude,
          );
          if (!ok) setLocationError("Could not resolve your location to a city.");
        } catch {
          setLocationError("Failed to look up your location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationError("Location permission denied or unavailable.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

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
      /* cancelled */
    }
  };

  const todayItems = useMemo(
    () => (forecast ? getTodayItems(forecast.list) : []),
    [forecast],
  );
  const { high, low } = useMemo(
    () => getTodayHighLow(todayItems),
    [todayItems],
  );
  const hourlySlots = forecast?.list.slice(0, 7) ?? [];
  const tomorrow = useMemo(
    () => (forecast ? getTomorrowOutlook(forecast.list) : null),
    [forecast],
  );
  const rainChance = Math.round(getMaxPopToday(todayItems) * 100);

  const countryLabel = weather
    ? getCountryName(weather.sys.country) ?? weather.sys.country
    : "";

  const { day, formatted } = weather
    ? formatDayDateFromUnix(weather.dt, weather.timezone)
    : { day: "", formatted: "" };

  const uvIndex = weather
    ? Math.min(11, Math.round((100 - weather.clouds.all) / 8))
    : 0;

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        minWidth: 0,
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        minHeight: "100vh",
        pt: { xs: 9, lg: 2 },
        pb: { xs: 2, md: 3 },
        pr: { xs: 2, md: 3 },
        pl: { xs: 2, lg: `${SIDEBAR_LEFT_OFFSET}px` },
        boxSizing: "border-box",
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 72px,
          ${alpha("#fff", 0.02)} 72px,
          ${alpha("#fff", 0.02)} 144px
        )`,
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%", minWidth: 0 }}>
        {/* Search header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: { xs: "stretch", sm: "flex-end" },
            mb: 2,
            mt: 3,
          }}
        >
          <CustomAutocomplete
            label="Search for cities"
            options={suggestions}
            loading={suggestionsLoading}
            filterOptions={(x) => x}
            getOptionLabel={(option) =>
              formatCityLabel(option.name, option.country, option.state)
            }
            isOptionEqualToValue={(a, b) => a.lat === b.lat && a.lon === b.lon}
            inputValue={inputValue}
            onInputChange={(_event, value) => setInputValue(value)}
            onChange={handleGeocodingSelect}
            noOptionsText={
              inputValue.trim().length < 2
                ? "Type at least 2 characters"
                : "No cities found"
            }
            sx={{ flex: 1 }}
          />
          <Tooltip title="Use my location">
            <span>
              <IconButton
                onClick={handleUseMyLocation}
                disabled={locating}
                aria-label="Use my location"
                sx={{
                  bgcolor: CARD_BG,
                  border: CARD_BORDER,
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                }}
              >
                {locating ? (
                  <CircularProgress size={22} />
                ) : (
                  <MyLocationIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {locationError && (
          <Typography color="error" variant="caption" sx={{ mb: 2, display: "block" }}>
            {locationError}
          </Typography>
        )}

        {recent.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Recent searches
              </Typography>
              <Tooltip title="Clear recent searches">
                <IconButton size="small" onClick={clearRecent} aria-label="Clear recent">
                  <ClearAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {recent.map((city) => (
                <Chip
                  key={`${city.lat}-${city.lon}`}
                  label={formatCityLabel(city.name, city.country)}
                  onClick={() => selectCity(city)}
                  variant={
                    selectedCity?.lat === city.lat && selectedCity?.lon === city.lon
                      ? "filled"
                      : "outlined"
                  }
                  color="primary"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {(initializing || (selectedCity && loading && !weather)) && (
          <CurrentWeatherSkeleton />
        )}

        {selectedCity && error && !loading && !initializing && (
          <WeatherErrorAlert error={error} />
        )}

        {selectedCity && weather && !loading && !error && !initializing && (
          <Grid container spacing={2.5}>
            {/* Left column */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Main weather card */}
                <WeatherCard
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    minHeight: { xs: 220, md: 260 },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.06,
                      backgroundImage: `url(${weatherIconUrl("02d")})`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10% center",
                      backgroundSize: 180,
                      pointerEvents: "none",
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: alpha(theme.palette.primary.main, 0.25),
                        color: theme.palette.primary.light,
                      }}
                    >
                      <LocationOnIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {weather.name}, {countryLabel}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Tooltip title="Refresh">
                        <IconButton
                          size="small"
                          onClick={() => setRefreshKey((k) => k + 1)}
                          aria-label="Refresh"
                        >
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share">
                        <IconButton size="small" onClick={handleShare} aria-label="Share">
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        aria-label={isFavorite(selectedCity) ? "Unsave" : "Save"}
                        onClick={() => toggleFavorite(selectedCity)}
                        color={isFavorite(selectedCity) ? "primary" : "default"}
                      >
                        {isFavorite(selectedCity) ? (
                          <StarIcon fontSize="small" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                      <TempUnitToggle />
                    </Box>
                  </Box>

                  <Grid
                    container
                    spacing={2}
                    sx={{ mt: 1, position: "relative", zIndex: 1 }}
                  >
                    <Grid size={{ xs: 7, sm: 8 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {day}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {formatted}
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "2.75rem", md: "3.5rem" },
                          lineHeight: 1,
                        }}
                      >
                        {formatTemp(weather.main.temp, unit)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        High: {convertTemp(high || weather.main.temp_max, unit)} Low:{" "}
                        {convertTemp(low || weather.main.temp_min, unit)}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{ xs: 5, sm: 4 }}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={weatherIconUrl(weather.weather[0].icon)}
                        alt={weather.weather[0].description}
                        sx={{ width: { xs: 80, md: 110 }, height: "auto" }}
                      />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {capitalize(weather.weather[0].description)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Feels Like {formatTemp(weather.main.feels_like, unit)}
                      </Typography>
                    </Grid>
                  </Grid>
                </WeatherCard>

                {/* Hourly + tomorrow */}
                <WeatherCard>
                  {forecastLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "grid",
                          width: "100%",
                          gap: { xs: 0.5, sm: 1 },
                          mb: 2,
                          gridTemplateColumns: {
                            xs: "repeat(3, minmax(0, 1fr))",
                            sm: "repeat(4, minmax(0, 1fr))",
                            md: "repeat(7, minmax(0, 1fr))",
                          },
                        }}
                      >
                        {hourlySlots.map((slot) => (
                          <Box
                            key={slot.dt}
                            sx={{
                              minWidth: 0,
                              textAlign: "center",
                              py: { xs: 1, sm: 1.5 },
                              px: { xs: 0.25, sm: 0.5 },
                              borderRadius: 2,
                              bgcolor: alpha("#fff", 0.04),
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                fontSize: { xs: "0.65rem", md: "0.75rem" },
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {formatHourLabel(slot.dt_txt)}
                            </Typography>
                            <Box
                              component="img"
                              src={weatherIconUrl(slot.weather[0].icon)}
                              alt=""
                              sx={{
                                width: { xs: 28, md: 40 },
                                height: { xs: 28, md: 40 },
                                my: 0.5,
                                mx: "auto",
                                display: "block",
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                              {formatTemp(slot.main.temp, unit)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {tomorrow && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                          }}
                        >
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Tomorrow
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {capitalize(tomorrow.weather[0].description)}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                              {formatTemp(tomorrow.main.temp, unit)}
                            </Typography>
                          </Box>
                          <Box
                            component="img"
                            src={weatherIconUrl(tomorrow.weather[0].icon)}
                            alt=""
                            sx={{ width: 72, height: 72 }}
                          />
                        </Box>
                      )}
                    </>
                  )}
                </WeatherCard>

                {/* Sunrise / sunset */}
                <WeatherCard>
                  <Grid container spacing={2}>
                    <Grid size={4}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {formatUnixTime(weather.sys.sunrise, weather.timezone, {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sunrise
                      </Typography>
                    </Grid>
                    <Grid size={4}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {formatUnixTime(weather.sys.sunset, weather.timezone, {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sunset
                      </Typography>
                    </Grid>
                    <Grid size={4} sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        Length of day
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {getDayLength(weather.sys.sunrise, weather.sys.sunset)}
                      </Typography>
                    </Grid>
                  </Grid>
                </WeatherCard>

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

            {/* Right column */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Today highlights */}
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: { xs: 3, md: 5 },
                    p: { xs: 2, sm: 3 },
                    overflow: "hidden",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Today Highlight
                  </Typography>
                  <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
                    <Grid size={{ xs: 6 }} sx={STRETCH_GRID}>
                      <WeatherCard sx={EQUAL_HEIGHT}>
                        <Typography variant="caption" color="text.secondary">
                          Chance of Rain
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                          {rainChance}%
                        </Typography>
                        <Box sx={HIGHLIGHT_FOOTER}>
                          <WaterDropIcon sx={{ color: theme.palette.info.main, fontSize: 28 }} />
                        </Box>
                      </WeatherCard>
                    </Grid>
                    <Grid size={{ xs: 6 }} sx={STRETCH_GRID}>
                      <WeatherCard sx={EQUAL_HEIGHT}>
                        <Typography variant="caption" color="text.secondary">
                          UV Index
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                          <WbSunnyIcon sx={{ color: theme.palette.primary.main }} />
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {uvIndex}
                          </Typography>
                        </Box>
                        <Box sx={HIGHLIGHT_FOOTER} />
                      </WeatherCard>
                    </Grid>
                    <Grid size={{ xs: 6 }} sx={STRETCH_GRID}>
                      <WeatherCard sx={EQUAL_HEIGHT}>
                        <Typography variant="caption" color="text.secondary">
                          Wind Status
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                          {weather.wind.speed.toFixed(1)} m/s
                        </Typography>
                        <Box sx={HIGHLIGHT_FOOTER}>
                          <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-end", width: "100%" }}>
                            {[0.4, 0.7, 1, 0.6, 0.9].map((h, i) => (
                              <Box
                                key={i}
                                sx={{
                                  flex: 1,
                                  maxWidth: 10,
                                  height: 24 * h,
                                  borderRadius: 1,
                                  bgcolor: alpha(theme.palette.info.main, 0.7),
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </WeatherCard>
                    </Grid>
                    <Grid size={{ xs: 6 }} sx={STRETCH_GRID}>
                      <WeatherCard sx={EQUAL_HEIGHT}>
                        <Typography variant="caption" color="text.secondary">
                          Humidity
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                          {weather.main.humidity}%
                        </Typography>
                        <Box sx={HIGHLIGHT_FOOTER}>
                          <AirIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                        </Box>
                      </WeatherCard>
                    </Grid>
                  </Grid>
                </Box>

                {/* Other cities / saved */}
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
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                      }}
                    >
                      Show All
                    </CustomButton>
                  </Box>

                  {otherCitiesGrid(
                    otherCitiesLoading,
                    otherCitiesWeather ?? [],
                    unit,
                    selectCity,
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

function otherCitiesGrid(
  loading: boolean,
  weatherList: CurrentWeatherResponse[],
  unit: "C" | "F",
  onSelect: (city: CityQuery) => void,
) {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!weatherList.length) {
    return (
      <WeatherCard sx={{ textAlign: "center", py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Other cities unavailable
        </Typography>
      </WeatherCard>
    );
  }

  return (
    <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
      {weatherList.map((w) => {
        const country = getCountryName(w.sys.country) ?? w.sys.country;
        return (
          <Grid key={w.id} size={{ xs: 6 }} sx={STRETCH_GRID}>
            <Box
              component="button"
              type="button"
              onClick={() => onSelect(weatherToCityQuery(w))}
              sx={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                width: "100%",
              }}
            >
              <WeatherCard
                sx={{
                  ...EQUAL_HEIGHT,
                  minHeight: { xs: 120, sm: 132 },
                  "&:hover": { borderColor: alpha("#fff", 0.15) },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                    flex: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatTemp(w.main.temp, unit)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      H{convertTemp(w.main.temp_max, unit)}° L{convertTemp(w.main.temp_min, unit)}°
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.3,
                      }}
                    >
                      {w.name} - {country}
                    </Typography>
                  </Box>
                  <Box
                    component="img"
                    src={weatherIconUrl(w.weather[0].icon)}
                    alt=""
                    sx={{ width: 48, height: 48, flexShrink: 0 }}
                  />
                </Box>
              </WeatherCard>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default Home;
