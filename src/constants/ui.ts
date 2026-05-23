export const WEATHER_CARD_BG = "#161a28";
export const WEATHER_CARD_BORDER = "1px solid rgba(255, 255, 255, 0.06)";
export const OTHER_CITIES_COUNT = 4;

export const STRETCH_GRID_ITEM = { display: "flex", minWidth: 0 } as const;

export const EQUAL_HEIGHT_CARD = {
  flex: 1,
  width: "100%",
  minHeight: { xs: 132, sm: 140 },
  display: "flex",
  flexDirection: "column",
} as const;

export const HIGHLIGHT_CARD_FOOTER = {
  mt: "auto",
  minHeight: 40,
  display: "flex",
  alignItems: "flex-end",
} as const;
