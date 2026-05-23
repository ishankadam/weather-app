import ClearAllIcon from "@mui/icons-material/ClearAll";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CustomAutocomplete from "../../../components/autocomplete/Autocomplete";
import { WEATHER_CARD_BG, WEATHER_CARD_BORDER } from "../../../constants/ui";
import { CityQuery, GeocodingResult } from "../../../types";
import { geocodingToCityQuery } from "../../../utils/cityMappers";
import { formatCityLabel } from "../../../utils/weatherUtils";

interface CitySearchBarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  suggestions: GeocodingResult[];
  suggestionsLoading: boolean;
  onSelectCity: (city: CityQuery) => void;
  locating: boolean;
  onUseLocation: () => void;
  locationError: string | null;
  recent: CityQuery[];
  onClearRecent: () => void;
  selectedCity: CityQuery | null;
}

const CitySearchBar = ({
  inputValue,
  onInputChange,
  suggestions,
  suggestionsLoading,
  onSelectCity,
  locating,
  onUseLocation,
  locationError,
  recent,
  onClearRecent,
  selectedCity,
}: CitySearchBarProps) => (
  <>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
        alignItems: { xs: "stretch", sm: "flex-end" },
        mb: 2,
        mt: 3,
      }}
    >
      <CustomAutocomplete
        label="Search for cities"
        options={suggestions}
        loading={suggestionsLoading}
        filterOptions={(options) => options}
        getOptionLabel={(option) =>
          formatCityLabel(option.name, option.country, option.state)
        }
        isOptionEqualToValue={(a, b) => a.lat === b.lat && a.lon === b.lon}
        inputValue={inputValue}
        onInputChange={(_event, value) => onInputChange(value)}
        onChange={(result) => {
          if (result) onSelectCity(geocodingToCityQuery(result));
        }}
        noOptionsText={
          inputValue.trim().length < 2
            ? "Type at least 2 characters"
            : "No cities found"
        }
        sx={{ flex: 1 }}
      />
      <Tooltip title="Use my location">
        <span>
          <IconButton
            onClick={onUseLocation}
            disabled={locating}
            aria-label="Use my location"
            sx={{
              bgcolor: WEATHER_CARD_BG,
              border: WEATHER_CARD_BORDER,
              width: 48,
              height: 48,
              flexShrink: 0,
            }}
          >
            {locating ? <CircularProgress size={22} /> : <MyLocationIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>

    {locationError && (
      <Typography color="error" variant="caption" sx={{ mb: 2, display: "block" }}>
        {locationError}
      </Typography>
    )}

    {recent.length > 0 && (
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Recent searches
          </Typography>
          <Tooltip title="Clear recent searches">
            <IconButton size="small" onClick={onClearRecent} aria-label="Clear recent">
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {recent.map((city) => (
            <Chip
              key={`${city.lat}-${city.lon}`}
              label={formatCityLabel(city.name, city.country)}
              onClick={() => onSelectCity(city)}
              variant={
                selectedCity?.lat === city.lat && selectedCity?.lon === city.lon
                  ? "filled"
                  : "outlined"
              }
              color="primary"
              size="small"
            />
          ))}
        </Box>
      </Box>
    )}
  </>
);

export default CitySearchBar;
