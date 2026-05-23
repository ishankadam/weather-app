import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CustomSidebar from "./components/sidebar/CustomSidebar";
import { FavoritesProvider } from "./context/FavoritesContext";
import { SidebarProvider } from "./context/SidebarContext";
import { TempUnitProvider } from "./context/TempUnitContext";
import Cities from "./pages/Cities/Cities";
import Forecast from "./pages/Forecast/Forecast";
import Home from "./pages/Home/Home";
import theme from "./theme";

function AppLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        bgcolor: "background.default",
      }}
    >
      <CustomSidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/cities" element={<Cities />} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <TempUnitProvider>
          <FavoritesProvider>
            <SidebarProvider>
              <AppLayout />
            </SidebarProvider>
          </FavoritesProvider>
        </TempUnitProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
