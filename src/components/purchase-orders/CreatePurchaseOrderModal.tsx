import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import type { Product, Warehouse } from '@/types/inventory';

interface CreatePurchaseOrderModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (productId: number, warehouseId: number, quantity: number) => Promise<void>;
  readonly products: Product[];
  readonly warehouses: Warehouse[];
  readonly loading?: boolean;
}

export default function CreatePurchaseOrderModal({
  open,
  onClose,
  onConfirm,
  products,
  warehouses,
  loading = false,
}: CreatePurchaseOrderModalProps) {
  const [productId, setProductId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!productId || !warehouseId || !quantity) {
      setError('All fields are required.');
      return;
    }
    if (Number(quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    try {
      await onConfirm(Number(productId), Number(warehouseId), Number(quantity));
      handleClose();
    } catch (err) {
      setError('Failed to create purchase order.');
      console.error(err);
    }
  };

  const handleClose = () => {
    setProductId('');
    setWarehouseId('');
    setQuantity('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Purchase Order</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <FormControl fullWidth size="small">
              <InputLabel>Product</InputLabel>
              <Select
                value={productId}
                label="Product"
                onChange={(e) => setProductId(Number(e.target.value))}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Warehouse</InputLabel>
              <Select
                value={warehouseId}
                label="Warehouse"
                onChange={(e) => setWarehouseId(Number(e.target.value))}
              >
                {warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              size="small"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 1 } }}
            />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
