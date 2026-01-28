import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid2,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Warning as WarningIcon, Info as InfoIcon } from "@mui/icons-material";
import type { EnrichedAlert } from "@/types/alerts";

interface AlertDetailsModalProps {
  readonly open: boolean;
  readonly alert: EnrichedAlert | null;
  readonly onClose: () => void;
  readonly onReorder: (quantity: number) => void;
}

export default function AlertDetailsModal({
  open,
  alert,
  onClose,
  onReorder,
}: AlertDetailsModalProps) {
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    if (alert) {
      setQuantity(alert.recommendedQuantity);
    }
  }, [alert]);

  if (!alert) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Alert Details
          </Typography>
          {alert.severity === "critical" && (
            <Chip
              icon={<WarningIcon style={{ fontSize: 16 }} />}
              label="Critical Low Stock"
              color="error"
              size="small"
            />
          )}
          {alert.severity === "warning" && (
            <Chip
              icon={<InfoIcon style={{ fontSize: 16 }} />}
              label="Low Stock Warning"
              color="warning"
              size="small"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <Typography variant="overline" color="text.secondary">
              Product Information
            </Typography>
            <Typography variant="h6">{alert.product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              SKU: {alert.product.sku} • Category: {alert.product.category}
            </Typography>
          </Grid2>

          <Grid2 size={6}>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Current Stock
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {alert.currentStock}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Target: {alert.reorderPoint}
              </Typography>
            </Box>
          </Grid2>

          <Grid2 size={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.lighter",
                border: 1,
                borderColor: "primary.main",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                fontWeight="medium"
                color="primary.main"
              >
                Recommended Order
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                +{alert.recommendedQuantity}
              </Typography>
              <Typography variant="caption" color="primary.main">
                To reach safety stock
              </Typography>
            </Box>
          </Grid2>

          <Grid2 size={12} sx={{ mt: 2 }}>
            <TextField
              label="Order Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">units</InputAdornment>
                  ),
                },
              }}
              helperText={`Suggested: ${alert.recommendedQuantity}`}
            />
          </Grid2>

          <Grid2 size={12}>
            <Typography variant="overline" color="text.secondary">
              Warehouse Location
            </Typography>
            <Typography variant="body1">
              {alert.warehouse.name} ({alert.warehouse.code})
            </Typography>
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          onClick={() => onReorder(quantity)}
          variant="contained"
          color="primary"
          disabled={quantity <= 0}
        >
          Create Purchase Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
