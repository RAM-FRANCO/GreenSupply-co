import Link from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Toolbar,
  Divider,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import SpaIcon from "@mui/icons-material/Spa";
import { customPalette } from "@/theme/theme";
import { ReactNode } from "react";

const DRAWER_WIDTH = 256;

interface MenuItem {
  type?: "header";
  text: string;
  icon?: ReactNode;
  href?: string;
}

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

export default function Sidebar({ mobileOpen, onDrawerToggle }: SidebarProps) {
  const theme = useTheme();
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { text: "Dashboard", icon: <DashboardIcon />, href: "/" },
    { type: "header", text: "Inventory" },
    { text: "All Products", icon: <Inventory2Icon />, href: "/products" },
    { text: "Categories", icon: <CategoryIcon />, href: "/categories" },
    { text: "Warehouses", icon: <WarehouseIcon />, href: "/warehouses" },
    { type: "header", text: "Operations" },
    { text: "Stock Levels", icon: <BarChartIcon />, href: "/alerts" },
    { text: "Transfers", icon: <SwapHorizIcon />, href: "/transfers" },
    // { type: "header", text: "Reports" },
    // { text: "Sales Trends", icon: <TrendingUpIcon />, href: "/trends" },
  ];

  const drawerContent = (
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
          {menuItems.map((item) => {
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
            const active =
              item.href === "/"
                ? router.pathname === "/"
                : router.pathname.startsWith(item.href || "");
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
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
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
        {drawerContent}
      </Drawer>
    </Box>
  );
}
