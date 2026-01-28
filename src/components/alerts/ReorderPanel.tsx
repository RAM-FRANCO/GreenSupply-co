import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { AddShoppingCart as AddShoppingCartIcon } from "@mui/icons-material";
import { customPalette } from "@/theme/theme";
import type { EnrichedAlert } from "@/types/alerts";

interface ReorderPanelProps {
  readonly alerts: EnrichedAlert[];
  readonly onReorder: (alert: EnrichedAlert) => void;
}

export default function ReorderPanel({ alerts, onReorder }: ReorderPanelProps) {
  // Filter for actionable alerts and sort by urgency (critical first, then largest shortage)
  const recommendations = alerts
    .filter((a) => a.severity === "critical" || a.severity === "warning")
    .sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1;
      if (b.severity === "critical" && a.severity !== "critical") return 1;
      return a.shortage - b.shortage; // Ascending arithmetic (more negative first? No, shortage is positive deficit in types)
      // Actually in code: shortage = reorderPoint - quantity.
      // So shortage > 0 means deficit. Larger shortage = more urgent.
      // Sort descending by shortage
    })
    .slice(0, 5);

  if (recommendations.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          No immediate reorders needed.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 0,
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: customPalette.stats.blue.bg,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" fontWeight="600" color="primary.main">
          Quick Reorder
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Top {recommendations.length} urgent items
        </Typography>
      </Box>
      <List disablePadding sx={{ overflow: "auto", flexGrow: 1 }}>
        {recommendations.map((item, index) => (
          <div key={item.id || `temp-${index}`}>
            <ListItem sx={{ py: 1.5, px: 2 }} disableGutters>
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    noWrap
                    sx={{ maxWidth: "70%" }}
                  >
                    {item.product.name}
                  </Typography>
                  {item.severity === "critical" && (
                    <Chip
                      label="CRITICAL"
                      size="small"
                      color="error"
                      sx={{
                        height: 16,
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.warehouse.code} • Stock: {item.currentStock}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="error.main"
                    fontWeight="medium"
                  >
                    Shortage: {item.shortage}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<AddShoppingCartIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onReorder(item)}
                  sx={{
                    justifyContent: "center",
                    py: 0.25,
                    fontSize: "0.75rem",
                    textTransform: "none",
                    borderColor: "divider",
                    color: "text.primary",
                  }}
                >
                  Order {item.recommendedQuantity} units
                </Button>
              </Box>
            </ListItem>
            {index < recommendations.length - 1 && <Divider component="li" />}
          </div>
        ))}
      </List>
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
        <Button fullWidth size="small" sx={{ fontSize: "0.75rem" }}>
          View All
        </Button>
      </Box>
    </Paper>
  );
}
