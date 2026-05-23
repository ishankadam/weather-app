import BoltIcon from "@mui/icons-material/Bolt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { CSSObject, styled, Theme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_LEFT_OFFSET,
  useSidebar,
} from "../../context/SidebarContext";

const SIDEBAR_OFFSET = { top: 10, bottom: 10, left: SIDEBAR_LEFT_OFFSET };

const navItems: {
  icon: typeof DashboardIcon;
  label: string;
  path: string;
}[] = [
  { icon: DashboardIcon, label: "Search", path: "/" },
  { icon: BookmarkIcon, label: "Saved", path: "/cities" },
];

const floatingPaperStyles = (theme: Theme): CSSObject => ({
  top: SIDEBAR_OFFSET.top,
  left: SIDEBAR_OFFSET.left,
  height: `calc(100% - ${SIDEBAR_OFFSET.top + SIDEBAR_OFFSET.bottom}px)`,
  borderRadius: 16,
  border: "none",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45)",
  overflowX: "hidden",
});

const openedMixin = (theme: Theme): CSSObject => ({
  width: SIDEBAR_EXPANDED_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: SIDEBAR_COLLAPSED_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
});

const PermanentDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  display: "none",
  [theme.breakpoints.up("lg")]: {
    display: "block",
  },
  ...(open ? openedMixin(theme) : closedMixin(theme)),
  "& .MuiDrawer-paper": {
    ...(open ? openedMixin(theme) : closedMixin(theme)),
    ...floatingPaperStyles(theme),
    position: "relative",
  },
}));

type SidebarContentProps = {
  expanded: boolean;
  onNavigate?: () => void;
};

const SidebarContent = ({ expanded, onNavigate }: SidebarContentProps) => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        py: 2.5,
        px: expanded ? 1.5 : 1,
      }}
    >
      <Box
        component={NavLink}
        to="/"
        end
        aria-label="WeatherApp home"
        onClick={onNavigate}
        sx={{
          display: "flex",
          flexDirection: expanded ? "row" : "column",
          alignItems: "center",
          justifyContent: expanded ? "flex-start" : "center",
          gap: expanded ? 1.5 : 0.75,
          mb: 3,
          px: expanded ? 0.5 : 0,
          minHeight: 48,
          textDecoration: "none",
          color: "inherit",
          borderRadius: "10px",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <BoltIcon
          sx={{
            fontSize: 28,
            color: theme.palette.primary.main,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: expanded ? "0.85rem" : "0.7rem",
            letterSpacing: "0.04em",
            color: theme.palette.text.primary,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
          }}
        >
          WeatherApp
        </Typography>
      </Box>

      <List sx={{ flex: 1, width: "100%", py: 0 }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive =
            path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(path);

          return (
            <ListItem
              key={label}
              disablePadding
              sx={{ mb: 0.5, display: "block" }}
            >
              <ListItemButton
                component={NavLink}
                to={path}
                end={path === "/"}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
                sx={{
                  minHeight: 44,
                  py: 1,
                  px: expanded ? 1.5 : 0.5,
                  borderRadius: "10px",
                  justifyContent: expanded ? "initial" : "center",
                  color: isActive
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                  bgcolor: isActive
                    ? theme.palette.action.hover
                    : "transparent",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: expanded ? 2 : 0,
                    mx: expanded ? 0 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </ListItemIcon>
                {expanded && (
                  <ListItemText
                    primary={label}
                    sx={{
                      m: 0,
                      "& .MuiTypography-root": {
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      },
                      ml: 2,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

const CustomSidebar = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { open, setOpen } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <IconButton
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
        sx={{
          display: { xs: "flex", lg: "none" },
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
          width: 44,
          height: 44,
          "&:hover": {
            bgcolor: "background.paper",
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            ...floatingPaperStyles(theme),
            width: SIDEBAR_EXPANDED_WIDTH,
          },
        }}
      >
        <SidebarContent expanded onNavigate={closeMobile} />
      </MuiDrawer>

      <PermanentDrawer
        variant="permanent"
        open={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <SidebarContent expanded={open} />
      </PermanentDrawer>
    </>
  );
};

export default CustomSidebar;
