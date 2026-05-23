import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { HIGHLIGHT_CARD_FOOTER } from "../../constants/ui";
import { WeatherCard } from "./WeatherStates";

interface HighlightStatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

const HighlightStatCard = ({ label, value, icon }: HighlightStatCardProps) => (
  <WeatherCard
    sx={{
      flex: 1,
      width: "100%",
      minHeight: { xs: 132, sm: 140 },
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ mt: 1 }}>{value}</Box>
    <Box sx={HIGHLIGHT_CARD_FOOTER}>{icon}</Box>
  </WeatherCard>
);

export default HighlightStatCard;
