import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { WeatherCard } from "../../../components/weather/WeatherStates";
import { ForecastItem } from "../../../types";
import { TempUnit, capitalize, formatHourLabel, formatTemp, weatherIconUrl } from "../../../utils/weatherUtils";

interface HourlyTomorrowSectionProps {
  loading: boolean;
  hourlySlots: ForecastItem[];
  tomorrow: ForecastItem | null;
  unit: TempUnit;
}

const HourlyTomorrowSection = ({
  loading,
  hourlySlots,
  tomorrow,
  unit,
}: HourlyTomorrowSectionProps) => {
  const theme = useTheme();

  return (
    <WeatherCard>
      {loading ? (
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
  );
};

export default HourlyTomorrowSection;
