import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTempUnit } from "../../context/TempUnitContext";

const TempUnitToggle = () => {
  const { unit, toggleUnit } = useTempUnit();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        variant="caption"
        color={unit === "F" ? "text.primary" : "text.secondary"}
      >
        °F
      </Typography>
      <Switch
        size="small"
        checked={unit === "C"}
        onChange={toggleUnit}
        slotProps={{
          input: { "aria-label": "Toggle Celsius and Fahrenheit" },
        }}
      />
      <Typography
        variant="caption"
        color={unit === "C" ? "text.primary" : "text.secondary"}
      >
        °C
      </Typography>
    </Box>
  );
};

export default TempUnitToggle;
