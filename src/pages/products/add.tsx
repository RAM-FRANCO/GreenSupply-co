import { useState } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Stack,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import FormSkeleton from "../../components/common/FormSkeleton";
import { PRODUCT_CATEGORIES } from "../../utils/constants";
import {
  ProductFormSchema,
  type ProductFormData,
} from "../../schemas/inventorySchema";

export default function AddProduct() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      sku: "",
      name: "",
      category: "",
      unitCost: undefined,
      reorderPoint: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/products");
      } else {
        console.error("Failed to add product");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <FormSkeleton />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Paper
        elevation={0}
        sx={{ p: 4, border: 1, borderColor: "divider", borderRadius: 2 }}
      >
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          Add New Product
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Enter the details of the new sustainable product to add to the
          inventory.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="SKU"
                  error={!!errors.sku}
                  helperText={
                    errors.sku?.message ||
                    "Unique Stock Keeping Unit identifier"
                  }
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  label="Product Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  required
                  fullWidth
                  label="Category"
                  error={!!errors.category}
                  helperText={errors.category?.message}
                >
                  {PRODUCT_CATEGORIES.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="unitCost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label="Unit Cost ($)"
                    type="number"
                    slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                    error={!!errors.unitCost}
                    helperText={errors.unitCost?.message}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value) || 0)
                    }
                  />
                )}
              />
              <Controller
                name="reorderPoint"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    label="Reorder Point"
                    type="number"
                    slotProps={{ htmlInput: { min: "0" } }}
                    error={!!errors.reorderPoint}
                    helperText={
                      errors.reorderPoint?.message ||
                      "Minimum stock level before reordering"
                    }
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value, 10) || 0)
                    }
                  />
                )}
              />
            </Stack>

            <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  submitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={submitting || !isValid}
              >
                {submitting ? "Saving..." : "Save Product"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/products")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
