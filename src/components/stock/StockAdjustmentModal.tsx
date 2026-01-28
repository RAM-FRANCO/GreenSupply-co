import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,

  MenuItem,
  Autocomplete,
  Stack,
  Alert,
} from "@mui/material";
import { Product, Warehouse } from "@/types/inventory";

interface StockAdjustmentModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly products: readonly Product[];
  readonly warehouses: readonly Warehouse[];
  readonly onConfirm: (
    productId: number,
    warehouseId: number,
    quantity: number,
    reason: string,
  ) => Promise<void>;
  readonly loading?: boolean;
  readonly initialProductId?: number;
}

export default function StockAdjustmentModal({
  open,
  onClose,
  products,
  warehouses,
  onConfirm,
  loading = false,
  initialProductId,
}: StockAdjustmentModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<
    number | string
  >("");
  const [quantity, setQuantity] = useState<number | string>("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Reset form on open
      if (initialProductId && products.length > 0) {
          const preSelected = products.find(p => p.id === initialProductId);
          setSelectedProduct(preSelected || null);
      } else {
          setSelectedProduct(null);
      }
      setSelectedWarehouseId("");
      setQuantity("");
      setReason("");
      setError(null);
    }
  }, [open, initialProductId, products]);

  const handleSubmit = async () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }
    if (!selectedWarehouseId) {
      setError("Please select a warehouse");
      return;
    }
    if (!quantity || Number(quantity) === 0) {
      setError("Please enter a valid quantity adjustment (non-zero)");
      return;
    }

    try {
      if (typeof selectedWarehouseId === "string") return;

      await onConfirm(
        selectedProduct.id,
        Number(selectedWarehouseId),
        Number(quantity),
        reason,
      );
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to adjust stock. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust Stock Level</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Autocomplete
            options={products}
            getOptionLabel={(option) => `${option.name} (${option.sku})`}
            value={selectedProduct}
            onChange={(_, newValue) => setSelectedProduct(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Product"
                placeholder="Search by name or SKU"
              />
            )}
          />

          <TextField
            select
            label="Warehouse"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            fullWidth
          >
            {warehouses.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Adjustment Quantity"
            type="number"
            placeholder="e.g. +10 or -5"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            helperText="Positive value adds stock, negative removes stock"
            fullWidth
          />

          <TextField
            label="Reason / Notes"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Initial inventory, Damaged goods, Audit correction"
            multiline
            rows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Saving..." : "Adjust Stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
