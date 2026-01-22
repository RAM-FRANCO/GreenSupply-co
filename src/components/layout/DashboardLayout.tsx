import { useState, ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SpaIcon from "@mui/icons-material/Spa";
import { alpha } from "@mui/material/styles";
import { customPalette } from "@/theme/theme";
import { useAlerts } from "@/hooks/useAlerts";
import AlertDetailsModal from "@/components/alerts/AlertDetailsModal";
import type { EnrichedAlert } from "@/types/alerts";

const DRAWER_WIDTH = 256;

interface MenuItem {
  type?: "header";
  text: string;
  icon?: ReactNode;
  href?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { text: "Dashboard", icon: <DashboardIcon />, href: "/" },
  { type: "header", text: "Inventory" },
  { text: "All Products", icon: <Inventory2Icon />, href: "/products" },
  { text: "Categories", icon: <CategoryIcon />, href: "/categories" },
  { text: "Warehouses", icon: <WarehouseIcon />, href: "/warehouses" },
  { type: "header", text: "Operations" },
  { text: "Stock Levels", icon: <BarChartIcon />, href: "/alerts" },
  { text: "Transfers", icon: <SwapHorizIcon />, href: "/transfers" },
  { type: "header", text: "Reports" },
  { text: "Sales Trends", icon: <TrendingUpIcon />, href: "/trends" },
];

interface DashboardLayoutProps {
  readonly children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { stats, alerts, updateAlertStatus, reorderStock } = useAlerts();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAlert, setSelectedAlert] = useState<EnrichedAlert | null>(
    null,
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAlertClick = async (alert: EnrichedAlert) => {
    setSelectedAlert(alert);
    handleMenuClose();

    // Mark as acknowledged (read) if it's currently active
    if (alert.status === "active") {
      try {
        await updateAlertStatus(alert.product.id, alert.warehouse.id, {
          status: "acknowledged",
        });
      } catch (error) {
        console.error("Failed to acknowledge alert", error);
      }
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              p: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SpaIcon sx={{ color: "primary.main" }} />
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              letterSpacing: "-0.025em",
            }}
          >
            GreenSupply{" "}
            <Box
              component="span"
              sx={{ color: "primary.main", fontWeight: "normal" }}
            >
              IMS
            </Box>
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        <List sx={{ px: 2, py: 3 }}>
          {MENU_ITEMS.map((item) => {
            if (item.type === "header") {
              return (
                <Typography
                  key={`header-${item.text}`}
                  variant="caption"
                  sx={{
                    px: 2,
                    pt: 2,
                    pb: 1,
                    display: "block",
                    color: customPalette.text.muted,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.text}
                </Typography>
              );
            }
            const active = router.pathname === item.href;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <Link href={item.href || "#"} passHref legacyBehavior>
                  <ListItemButton
                    selected={active}
                    sx={{
                      borderRadius: 1,
                      "&.Mui-selected": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                        },
                        "& .MuiListItemIcon-root": {
                          color: "primary.main",
                        },
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: active ? "inherit" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: {
                          sx: { fontSize: "0.875rem", fontWeight: 500 },
                        },
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <List sx={{ px: 2 }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "text.secondary",
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            sx={{ color: "text.secondary", mr: 2 }}
            onClick={handleMenuOpen}
          >
            <Badge
              badgeContent={stats.unread}
              color="error"
              invisible={stats.unread === 0}
            >
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            disableScrollLock={true}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 400,
                mt: 1,
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Notifications
              </Typography>
            </Box>
            {stats.critical + stats.warning === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No new alerts
                </Typography>
              </Box>
            ) : (
              alerts
                .filter(
                  (a) => a.severity === "critical" || a.severity === "warning",
                )
                .slice(0, 5)
                .map((alert) => (
                  <MenuItem
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 0.5,
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography variant="body2" fontWeight="600" noWrap>
                        {alert.product.name}
                      </Typography>
                      {alert.severity === "critical" && (
                        <Typography
                          variant="caption"
                          color="error.main"
                          fontWeight="bold"
                        >
                          CRITICAL
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Stock: {alert.currentStock} (Target: {alert.reorderPoint})
                    </Typography>
                  </MenuItem>
                ))
            )}
            <Box sx={{ p: 1 }}>
              <ListItemButton
                onClick={() => {
                  handleMenuClose();
                  router.push("/alerts");
                }}
                sx={{
                  justifyContent: "center",
                  borderRadius: 1,
                  color: "primary.main",
                  typography: "body2",
                  fontWeight: 600,
                }}
              >
                View All Alerts
              </ListItemButton>
            </Box>
          </Menu>
          <AlertDetailsModal
            open={Boolean(selectedAlert)}
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onReorder={async () => {
              if (selectedAlert) {
                try {
                  await reorderStock(
                    selectedAlert.product.id,
                    selectedAlert.warehouse.id,
                    selectedAlert.recommendedQuantity,
                  );
                  setSelectedAlert(null);
                } catch (err) {
                  console.error("Reorder failed", err);
                }
              }
            }}
          />

          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 32,
              height: 32,
              fontSize: "0.875rem",
            }}
          >
            JD
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              borderRight: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: "100vw",
          overflowX: "hidden",
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
