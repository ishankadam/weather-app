import AirIcon from "@mui/icons-material/Air";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { STRETCH_GRID_ITEM } from "../../constants/ui";
import { CurrentWeatherResponse } from "../../types";
import HighlightStatCard from "./HighlightStatCard";

interface TodayHighlightsProps {
  weather: CurrentWeatherResponse;
  rainChancePercent: number;
  uvIndex: number;
}

const TodayHighlights = ({
  weather,
  rainChancePercent,
  uvIndex,
}: TodayHighlightsProps) => {
  const theme = useTheme();

  return (
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
        <Grid size={{ xs: 6 }} sx={STRETCH_GRID_ITEM}>
          <HighlightStatCard
            label="Chance of Rain"
            value={
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {rainChancePercent}%
              </Typography>
            }
            icon={
              <WaterDropIcon sx={{ color: theme.palette.info.main, fontSize: 28 }} />
            }
          />
        </Grid>
        <Grid size={{ xs: 6 }} sx={STRETCH_GRID_ITEM}>
          <HighlightStatCard
            label="UV Index"
            value={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WbSunnyIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {uvIndex}
                </Typography>
              </Box>
            }
          />
        </Grid>
        <Grid size={{ xs: 6 }} sx={STRETCH_GRID_ITEM}>
          <HighlightStatCard
            label="Wind Status"
            value={
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {weather.wind.speed.toFixed(1)} m/s
              </Typography>
            }
            icon={
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "flex-end", width: "100%" }}>
                {[0.4, 0.7, 1, 0.6, 0.9].map((height, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      maxWidth: 10,
                      height: 24 * height,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.info.main, 0.7),
                    }}
                  />
                ))}
              </Box>
            }
          />
        </Grid>
        <Grid size={{ xs: 6 }} sx={STRETCH_GRID_ITEM}>
          <HighlightStatCard
            label="Humidity"
            value={
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {weather.main.humidity}%
              </Typography>
            }
            icon={<AirIcon sx={{ color: "text.secondary", fontSize: 28 }} />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TodayHighlights;
