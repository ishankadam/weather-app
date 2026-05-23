import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import TempUnitToggle from "../../../components/weather/TempUnitToggle";
import { WeatherCard } from "../../../components/weather/WeatherStates";
import { CurrentWeatherResponse } from "../../../types";
import { TempUnit, capitalize, convertTemp, formatTemp, weatherIconUrl } from "../../../utils/weatherUtils";

interface CurrentWeatherHeroProps {
  weather: CurrentWeatherResponse;
  countryLabel: string;
  unit: TempUnit;
  day: string;
  formattedDate: string;
  todayHigh: number;
  todayLow: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  onShare: () => void;
}

const CurrentWeatherHero = ({
  weather,
  countryLabel,
  unit,
  day,
  formattedDate,
  todayHigh,
  todayLow,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  onShare,
}: CurrentWeatherHeroProps) => {
  const theme = useTheme();

  return (
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
            <IconButton size="small" onClick={onRefresh} aria-label="Refresh">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton size="small" onClick={onShare} aria-label="Share">
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            aria-label={isFavorite ? "Remove from favorites" : "Save city"}
            onClick={onToggleFavorite}
            color={isFavorite ? "primary" : "default"}
          >
            {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
          </IconButton>
          <TempUnitToggle />
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 1, position: "relative", zIndex: 1 }}>
        <Grid size={{ xs: 7, sm: 8 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {day}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {formattedDate}
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
            High: {convertTemp(todayHigh || weather.main.temp_max, unit)} Low:{" "}
            {convertTemp(todayLow || weather.main.temp_min, unit)}
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
  );
};

export default CurrentWeatherHero;
