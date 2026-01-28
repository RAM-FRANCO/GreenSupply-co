import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid2,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  Alert
} from "@mui/material";
import { Product, Warehouse } from "@/types/inventory";

interface RestockModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly product: Product | null;
  readonly warehouses: readonly Warehouse[];
  readonly onRestock: (warehouseId: number, quantity: number) => Promise<void>;
}

export default function RestockModal({
  open,
  onClose,
  product,
  warehouses,
  onRestock,
}: RestockModalProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | string>("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedWarehouseId("");
      setQuantity("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedWarehouseId) {
      setError("Please select a warehouse.");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Please enter a valid positive quantity.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onRestock(Number(selectedWarehouseId), qty);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create purchase order.");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Restock Product
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Box>
                <Typography variant="overline" color="text.secondary">
                  Product Information
                </Typography>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  SKU: {product.sku}
                </Typography>
            </Box>

            <TextField
                select
                label="Select Warehouse"
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                fullWidth
                helperText="Where should this stock be delivered?"
            >
                {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                        {w.name}
                    </MenuItem>
                ))}
            </TextField>

            <Grid2 container spacing={2}>
                 <Grid2 size={12}>
                    <TextField
                      label="Order Quantity"
                      type="number"
                      fullWidth
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">units</InputAdornment>
                          ),
                        },
                      }}
                      placeholder="e.g. 50"
                    />
                 </Grid2>
            </Grid2>
            
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
              <Typography variant="caption" color="primary.main">
                This will create a pending Purchase Order.
              </Typography>
            </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Creating Order..." : "Create Purchase Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
