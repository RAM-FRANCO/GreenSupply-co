import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
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
import { Product } from "../../types";
import FormSkeleton from "../../components/common/FormSkeleton";
import { PRODUCT_CATEGORIES } from "../../utils/constants";

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    sku: "",
    name: "",
    category: "",
    unitCost: 0,
    reorderPoint: 0,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        name === "unitCost" || name === "reorderPoint"
          ? Number.parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        router.push("/products");
      } else {
        console.error("Failed to add product");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setLoading(false);
    }
  };

  if (loading) {
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

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              label="SKU"
              name="sku"
              value={product.sku}
              onChange={handleChange}
              helperText="Unique Stock Keeping Unit identifier"
            />
            <TextField
              required
              fullWidth
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
            />
            <TextField
              select
              required
              fullWidth
              label="Category"
              name="category"
              value={product.category}
              onChange={handleChange}
            >
              {PRODUCT_CATEGORIES.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                label="Unit Cost ($)"
                name="unitCost"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={product.unitCost}
                onChange={handleChange}
              />
              <TextField
                required
                fullWidth
                label="Reorder Point"
                name="reorderPoint"
                type="number"
                inputProps={{ min: "0" }}
                value={product.reorderPoint}
                onChange={handleChange}
                helperText="Minimum stock level before reordering"
              />
            </Stack>

            <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Product"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/products")}
                disabled={loading}
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
