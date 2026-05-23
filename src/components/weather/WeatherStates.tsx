import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import SignalWifiOffIcon from "@mui/icons-material/SignalWifiOff";
import SpeedIcon from "@mui/icons-material/Speed";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { WeatherError } from "../../types";
import { getWeatherErrorTitle } from "../../utils/weatherError";

const CARD_BG = "#161a28";
const CARD_BORDER = "1px solid rgba(255, 255, 255, 0.06)";

export const WeatherCard = ({
  children,
  sx,
  onClick,
}: {
  children: React.ReactNode;
  sx?: object;
  onClick?: () => void;
}) => (
  <Box
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
    sx={{
      bgcolor: CARD_BG,
      borderRadius: 3,
      border: CARD_BORDER,
      p: { xs: 2, md: 2.5 },
      ...sx,
    }}
  >
    {children}
  </Box>
);

export const CurrentWeatherSkeleton = () => (
  <Grid container spacing={2.5}>
    <Grid size={{ xs: 12, lg: 7 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <WeatherCard sx={{ minHeight: 260 }}>
          <Skeleton variant="rounded" width={160} height={28} sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="30%" height={64} sx={{ mt: 2 }} />
            </Box>
            <Skeleton variant="circular" width={100} height={100} />
          </Box>
        </WeatherCard>
        <WeatherCard>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ flex: 1 }} />
            ))}
          </Box>
        </WeatherCard>
        <Skeleton variant="rounded" height={72} />
      </Box>
    </Grid>
    <Grid size={{ xs: 12, lg: 5 }}>
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          p: 2,
        }}
      >
        <Skeleton variant="text" width={140} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={6}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  </Grid>
);

const errorIcons = {
  not_found: LocationOffIcon,
  rate_limit: SpeedIcon,
  network: SignalWifiOffIcon,
  unknown: ErrorOutlinedIcon,
};

export const WeatherErrorAlert = ({ error }: { error: WeatherError }) => {
  const Icon = errorIcons[error.kind] ?? ErrorOutlinedIcon;

  return (
    <WeatherCard
      sx={{
        textAlign: "center",
        py: 4,
        borderColor: alpha("#f44336", 0.35),
        bgcolor: alpha("#f44336", 0.08),
      }}
    >
      <Icon sx={{ fontSize: 48, color: "error.main", mb: 1 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        {getWeatherErrorTitle(error)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error.message}
      </Typography>
    </WeatherCard>
  );
};

export const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <WeatherCard sx={{ textAlign: "center", py: 5 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </WeatherCard>
);
