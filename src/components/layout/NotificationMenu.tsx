import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  ListItemButton,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { StockStatusChip } from "@/components/common/StatusChip";
import AlertDetailsModal from "@/components/alerts/AlertDetailsModal";
import type { EnrichedAlert } from "@/types/alerts";
import { formatRelativeTime } from "@/utils/formatters";
import { useAlerts } from "@/hooks/useAlerts";

export default function NotificationMenu() {
  const router = useRouter();
  const { stats, alerts, updateAlertStatus, reorderStock } = useAlerts();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAlert, setSelectedAlert] = useState<EnrichedAlert | null>(null);

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

  return (
    <>
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
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxHeight: 400,
              mt: 1,
            },
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
              (a) => a.severity === "critical" || a.severity === "warning"
            )
            .sort((a, b) => {
              if (a.severity !== b.severity) {
                return a.severity === "critical" ? -1 : 1;
              }
              return (
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
              );
            })
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
                    alignItems: "flex-start",
                    width: "100%",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      whiteSpace: "normal",
                      lineHeight: 1.2,
                    }}
                  >
                    {alert.product.name}
                  </Typography>
                  {alert.severity === "critical" && (
                    <StockStatusChip
                      quantity={alert.currentStock}
                      reorderPoint={alert.reorderPoint}
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                        borderRadius: 1,
                        textTransform: "uppercase",
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatRelativeTime(alert.timestamp)} • Stock:{" "}
                  {alert.currentStock} (Target: {alert.reorderPoint})
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
                selectedAlert.recommendedQuantity
              );
              setSelectedAlert(null);
            } catch (err) {
              console.error("Reorder failed", err);
            }
          }
        }}
      />
    </>
  );
}
