/**
 * Transfer form component for initiating stock transfers.
 * Uses shared FormSelect component.
 */
import { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Grid2,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import FormSelect from "@/components/common/FormSelect";
import type { Product, Warehouse, Stock } from "@/types/inventory";
import type { CreateTransferRequest } from "@/types/transfers";

interface TransferFormProps {
  readonly onTransferComplete?: () => void;
}

interface FormState {
  productId: number | "";
  fromWarehouseId: number | "";
  toWarehouseId: number | "";
  quantity: string;
  notes: string;
}

const initialFormState: FormState = {
  productId: "",
  fromWarehouseId: "",
  toWarehouseId: "",
  quantity: "",
  notes: "",
};

export default function TransferForm({
  onTransferComplete,
}: TransferFormProps) {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);

  // Form state
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch reference data
  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/warehouses").then((r) => r.json()),
      fetch("/api/stock").then((r) => r.json()),
    ]).then(([productsData, warehousesData, stockData]) => {
      setProducts(productsData);
      setWarehouses(warehousesData);
      setStock(stockData);
    });
  }, []);

  // Dropdown options
  const productOptions = useMemo(
    () => products.map((p) => ({ id: p.id, label: `${p.name} (${p.sku})` })),
    [products],
  );

  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ id: w.id, label: `${w.name} (${w.code})` })),
    [warehouses],
  );

  // Filter destination warehouses to exclude source
  const destinationOptions = useMemo(
    () => warehouseOptions.filter((w) => w.id !== formState.fromWarehouseId),
    [warehouseOptions, formState.fromWarehouseId],
  );

  // Available stock at source warehouse
  const availableStock = useMemo(() => {
    if (!formState.productId || !formState.fromWarehouseId) return null;
    const stockEntry = stock.find(
      (s) =>
        s.productId === formState.productId &&
        s.warehouseId === formState.fromWarehouseId,
    );
    return stockEntry?.quantity ?? 0;
  }, [formState.productId, formState.fromWarehouseId, stock]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (
      !formState.productId ||
      !formState.fromWarehouseId ||
      !formState.toWarehouseId
    ) {
      setError("Please select product and warehouses");
      return;
    }

    const quantity = Number.parseInt(formState.quantity, 10);
    if (Number.isNaN(quantity) || quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (availableStock !== null && quantity > availableStock) {
      setError(`Insufficient stock. Available: ${availableStock}`);
      return;
    }

    setLoading(true);

    try {
      const request: CreateTransferRequest = {
        productId: formState.productId,
        fromWarehouseId: formState.fromWarehouseId,
        toWarehouseId: formState.toWarehouseId,
        quantity,
        ...(formState.notes && { notes: formState.notes }),
      };

      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Transfer failed");
      }

      setSuccess(`Transfer ${data.referenceNumber} completed successfully`);
      setFormState(initialFormState);

      // Refresh stock data
      const newStock = await fetch("/api/stock").then((r) => r.json());
      setStock(newStock);

      onTransferComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <SwapHorizIcon color="primary" />
        New Transfer
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12 }}>
            <FormSelect
              label="Product"
              value={formState.productId}
              options={productOptions}
              onChange={(v) => updateField("productId", v as number)}
              required
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormSelect
              label="From Warehouse"
              value={formState.fromWarehouseId}
              options={warehouseOptions}
              onChange={(v) => {
                updateField("fromWarehouseId", v as number);
                // Reset destination if same as new source
                if (formState.toWarehouseId === v) {
                  updateField("toWarehouseId", "");
                }
              }}
              required
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormSelect
              label="To Warehouse"
              value={formState.toWarehouseId}
              options={destinationOptions}
              onChange={(v) => updateField("toWarehouseId", v as number)}
              disabled={!formState.fromWarehouseId}
              required
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Quantity"
              type="number"
              value={formState.quantity}
              onChange={(e) => updateField("quantity", e.target.value)}
              fullWidth
              required
              slotProps={{
                input: { inputProps: { min: 1 } },
              }}
              helperText={
                availableStock !== null
                  ? `Available: ${availableStock}`
                  : "Select product and source warehouse"
              }
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Notes (optional)"
              value={formState.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              fullWidth
              multiline
              rows={1}
            />
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SwapHorizIcon />
                }
              >
                {loading ? "Processing..." : "Transfer Stock"}
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </form>
    </Paper>
  );
}
