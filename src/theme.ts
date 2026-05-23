import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7C4DFF", // violet accent
    },
    secondary: {
      main: "#FF4081", // pink accent
    },
    background: {
      default: "#0a0c10", // app background
      paper: "#1e212a", // floating sidebar
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0B0B0",
    },
    divider: "#2A2A2C",
    action: {
      hover: "rgba(124, 77, 255, 0.15)",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h6: {
      fontWeight: 600,
      letterSpacing: "0.5px",
    },
    body1: {
      fontSize: "0.95rem",
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "rgba(124, 77, 255, 0.1)",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "none",
        },
      },
    },
  },
});

export default theme;
