import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import { SIDEBAR_LEFT_OFFSET } from "../../context/SidebarContext";

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
  striped?: boolean;
}

const PageLayout = ({
  children,
  maxWidth = 1400,
  striped = false,
}: PageLayoutProps) => {
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        minWidth: 0,
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        minHeight: "100vh",
        pt: { xs: 9, lg: 2 },
        pb: { xs: 2, md: 3 },
        pr: { xs: 2, md: 3 },
        pl: { xs: 2, lg: `${SIDEBAR_LEFT_OFFSET}px` },
        boxSizing: "border-box",
        transition: theme.transitions.create(["padding"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        ...(striped && {
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 72px,
            ${alpha("#fff", 0.02)} 72px,
            ${alpha("#fff", 0.02)} 144px
          )`,
        }),
      }}
    >
      <Box sx={{ maxWidth, mx: "auto", width: "100%", minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout;
