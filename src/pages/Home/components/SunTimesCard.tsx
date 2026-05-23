import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { WeatherCard } from "../../../components/weather/WeatherStates";
import { CurrentWeatherResponse } from "../../../types";
import { formatUnixTime, getDayLength } from "../../../utils/weatherUtils";

interface SunTimesCardProps {
  weather: CurrentWeatherResponse;
}

const SunTimesCard = ({ weather }: SunTimesCardProps) => (
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
);

export default SunTimesCard;
