import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Box, MenuItem } from "@mui/material";
import FormPageLayout from "../../components/layout/FormPageLayout";
import {
  StockFormSchema,
  type StockFormData,
} from "../../schemas/inventorySchema";
import type { Product, Warehouse } from "../../types";
import { isIntegerKey } from "../../utils/validation";

export default function AddStock() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<StockFormData>({
    resolver: zodResolver(StockFormSchema),
    defaultValues: {
      productId: undefined,
      warehouseId: undefined,
      quantity: undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/warehouses").then((res) => res.json()),
    ]).then(([productsData, warehousesData]) => {
      setProducts(productsData);
      setWarehouses(warehousesData);
    });
  }, []);

  const onSubmit = async (data: StockFormData) => {
    setSubmitting(true);
    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/stock");
    } else {
      setSubmitting(false);
    }
  };

  return (
    <FormPageLayout title="Add Stock Record">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="productId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              select
              label="Product"
              error={!!errors.productId}
              helperText={errors.productId?.message}
              value={field.value ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value ? Number.parseInt(value, 10) : undefined);
              }}
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="warehouseId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              select
              label="Warehouse"
              error={!!errors.warehouseId}
              helperText={errors.warehouseId?.message}
              value={field.value ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value ? Number.parseInt(value, 10) : undefined);
              }}
              slotProps={{
                input: { sx: { borderRadius: 2 } },
              }}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              label="Quantity"
              type="number"
              slotProps={{
                htmlInput: { min: "0" },
                input: { sx: { borderRadius: 2 } },
              }}
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              onChange={(e) =>
                field.onChange(Number.parseInt(e.target.value, 10) || 0)
              }
              onKeyDown={(e) => {
                if (isIntegerKey(e)) {
                  e.preventDefault();
                }
              }}
            />
          )}
        />
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={submitting || !isValid}
            sx={{ borderRadius: 2, height: 48 }}
          >
            {submitting ? "Adding..." : "Add Stock"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            component={Link}
            href="/stock"
            disabled={submitting}
            sx={{ borderRadius: 2, height: 48 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </FormPageLayout>
  );
}
