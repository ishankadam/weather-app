import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import {
  EmptyState,
  WeatherCard,
  WeatherErrorAlert,
} from "../../components/weather/WeatherStates";
import { toCityQuery, useFavorites } from "../../context/FavoritesContext";
import { cityQueryToSearchParams } from "../../utils/cityQuery";
import { useTempUnit } from "../../context/TempUnitContext";
import { getFavoritesWeather, parseApiError } from "../../services/weatherApi";
import { CurrentWeatherResponse, SavedCity } from "../../types";
import {
  capitalize,
  formatCityLabel,
  formatTemp,
  getCountryName,
  weatherIconUrl,
} from "../../utils/weatherUtils";

const Cities = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const { unit } = useTempUnit();

  const [weatherByCity, setWeatherByCity] = useState<
    Record<string, CurrentWeatherResponse>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReturnType<typeof parseApiError> | null>(
    null,
  );
  const [pendingRemove, setPendingRemove] = useState<SavedCity | null>(null);

  useEffect(() => {
    if (!favorites.length) {
      setWeatherByCity({});
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getFavoritesWeather(
      favorites.map(toCityQuery),
      controller.signal,
    )
      .then((results) => {
        if (controller.signal.aborted) return;
        const map: Record<string, CurrentWeatherResponse> = {};
        results.forEach((item) => {
          map[`${item.coord.lat},${item.coord.lon}`] = item;
        });
        setWeatherByCity(map);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (
          err instanceof DOMException &&
          (err.name === "AbortError" || err.message === "Aborted")
        ) {
          return;
        }
        if (!controller.signal.aborted) {
          setError(parseApiError(err));
          setWeatherByCity({});
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [favorites]);

  const handleConfirmRemove = () => {
    if (pendingRemove) {
      removeFavorite(pendingRemove);
      setPendingRemove(null);
    }
  };

  return (
    <PageLayout maxWidth={1200}>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
          Saved Locations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Star cities from the dashboard to add them here. Tap a card to view it
          on the dashboard, or use the delete icon to remove a saved location.
        </Typography>

        {favorites.length === 0 && (
          <EmptyState
            title="No saved locations yet"
            description='Search for a city on the dashboard and tap the star icon to save it.'
          />
        )}

        {favorites.length > 0 && loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {favorites.length > 0 && error && !loading && (
          <WeatherErrorAlert error={error} />
        )}

        {favorites.length > 0 && !loading && !error && (
          <Grid container spacing={2}>
            {favorites.map((city) => {
              const key = `${city.lat},${city.lon}`;
              const weather = weatherByCity[key];
              const countryLabel = getCountryName(city.country) ?? city.country;

              return (
                <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                  <WeatherCard
                    sx={{
                      position: "relative",
                      height: "100%",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                      "&:hover": {
                        borderColor: alpha("#fff", 0.15),
                      },
                    }}
                    onClick={() =>
                      navigate(`/?${cityQueryToSearchParams(toCityQuery(city))}`)
                    }
                  >
                    <IconButton
                      aria-label={`Remove ${city.name}`}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingRemove(city);
                      }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "text.secondary",
                        zIndex: 1,
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 2,
                        color: "text.secondary",
                      }}
                    >
                      <LocationOnIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {formatCityLabel(city.name, city.country)}
                      </Typography>
                    </Box>

                    {weather ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {formatTemp(weather.main.temp, unit)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {capitalize(weather.weather[0].description)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 1 }}
                          >
                            Humidity {weather.main.humidity}% · Wind{" "}
                            {weather.wind.speed.toFixed(1)} m/s
                          </Typography>
                        </Box>
                        <Box
                          component="img"
                          src={weatherIconUrl(weather.weather[0].icon)}
                          alt=""
                          sx={{ width: 72, height: 72, flexShrink: 0 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Weather unavailable for {city.name}, {countryLabel}
                      </Typography>
                    )}
                  </WeatherCard>
                </Grid>
              );
            })}
          </Grid>
        )}

      <Dialog
        open={Boolean(pendingRemove)}
        onClose={() => setPendingRemove(null)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "background.paper",
              backgroundImage: "none",
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle>Remove saved location?</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            {pendingRemove
              ? `Remove ${formatCityLabel(pendingRemove.name, pendingRemove.country)} from your saved locations?`
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingRemove(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default Cities;
