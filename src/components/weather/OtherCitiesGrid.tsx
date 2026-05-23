import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import {
  EQUAL_HEIGHT_CARD,
  STRETCH_GRID_ITEM,
} from "../../constants/ui";
import { CityQuery, CurrentWeatherResponse } from "../../types";
import { weatherToCityQuery } from "../../utils/cityMappers";
import {
  TempUnit,
  convertTemp,
  formatTemp,
  getCountryName,
  weatherIconUrl,
} from "../../utils/weatherUtils";
import { WeatherCard } from "./WeatherStates";

interface OtherCitiesGridProps {
  loading: boolean;
  cities: CurrentWeatherResponse[];
  unit: TempUnit;
  onSelect: (city: CityQuery) => void;
}

const OtherCitiesGrid = ({
  loading,
  cities,
  unit,
  onSelect,
}: OtherCitiesGridProps) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!cities.length) {
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
      {cities.map((weather) => {
        const country = getCountryName(weather.sys.country) ?? weather.sys.country;
        return (
          <Grid key={weather.id} size={{ xs: 6 }} sx={STRETCH_GRID_ITEM}>
            <Box
              component="button"
              type="button"
              onClick={() => onSelect(weatherToCityQuery(weather))}
              sx={{
                all: "unset",
                cursor: "pointer",
                display: "block",
                width: "100%",
              }}
            >
              <WeatherCard
                sx={{
                  ...EQUAL_HEIGHT_CARD,
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
                      {formatTemp(weather.main.temp, unit)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      H{convertTemp(weather.main.temp_max, unit)}° L
                      {convertTemp(weather.main.temp_min, unit)}°
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
                      {weather.name} - {country}
                    </Typography>
                  </Box>
                  <Box
                    component="img"
                    src={weatherIconUrl(weather.weather[0].icon)}
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
};

export default OtherCitiesGrid;
