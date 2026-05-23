import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageLayout from "../../components/layout/PageLayout";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TempUnitToggle from "../../components/weather/TempUnitToggle";
import {
  EmptyState,
  WeatherCard,
  WeatherErrorAlert,
} from "../../components/weather/WeatherStates";
import { useTempUnit } from "../../context/TempUnitContext";
import { useAsyncWeather } from "../../hooks/useAsyncWeather";
import { getCityForecast } from "../../services/weatherApi";
import { searchParamsToCityQuery } from "../../utils/cityQuery";
import {
  capitalize,
  convertTemp,
  formatCityLabel,
  formatTemp,
  getFiveDayOutlook,
  weatherIconUrl,
} from "../../utils/weatherUtils";

const Forecast = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const city = searchParamsToCityQuery(searchParams);
  const { unit } = useTempUnit();

  const { data: forecast, loading, error } = useAsyncWeather(
    (signal) => {
      if (!city) throw new Error("Invalid city");
      return getCityForecast(city, signal);
    },
    [city?.lat, city?.lon],
    Boolean(city),
  );

  const days = useMemo(
    () => (forecast ? getFiveDayOutlook(forecast.list) : []),
    [forecast],
  );

  const chartData = useMemo(
    () =>
      days.map((day) => ({
        name: day.label,
        high: convertTemp(day.high, unit),
        low: convertTemp(day.low, unit),
        avg: convertTemp(day.avgTemp, unit),
      })),
    [days, unit],
  );

  if (!city) {
    return (
      <PageLayout maxWidth={1000}>
        <EmptyState
          title="No city selected"
          description="Search for a city on the dashboard, then open its forecast from there."
        />
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link to="/">Back to dashboard</Link>
        </Box>
      </PageLayout>
    );
  }

  const title = formatCityLabel(city.name, city.country);

  return (
    <PageLayout maxWidth={1000}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
            mt: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              aria-label="Back to dashboard"
              onClick={() => navigate("/")}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              5-Day Forecast — {title}
            </Typography>
          </Box>
          <TempUnitToggle />
        </Box>

        {loading && !forecast && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && <WeatherErrorAlert error={error} />}

        {forecast && !loading && !error && (
          <>
            <WeatherCard sx={{ mb: 3, height: { xs: 280, md: 320 } }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Daily high & low ({unit === "C" ? "°C" : "°F"})
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="#B0B0B0" fontSize={12} />
                  <YAxis stroke="#B0B0B0" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e212a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="high"
                    name="High"
                    stroke="#7C4DFF"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    name="Low"
                    stroke="#FF4081"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </WeatherCard>

            <Grid container spacing={2}>
              {days.map((day) => (
                <Grid key={day.dateKey} size={{ xs: 12, sm: 6, md: 4 }}>
                  <WeatherCard
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {day.label}
                    </Typography>
                    <Box
                      component="img"
                      src={weatherIconUrl(day.icon)}
                      alt={day.description}
                      sx={{ width: 64, height: 64, my: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {capitalize(day.description)}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {formatTemp(day.high, unit)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTemp(day.low, unit)}
                    </Typography>
                  </WeatherCard>
                </Grid>
              ))}
            </Grid>
          </>
        )}
    </PageLayout>
  );
};

export default Forecast;
