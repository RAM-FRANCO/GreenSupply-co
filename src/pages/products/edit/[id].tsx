import { useState, useEffect, FormEvent, ChangeEvent } from "react";
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
import { Product } from "../../../types";
import FormSkeleton from "../../../components/common/FormSkeleton";
import ErrorState from "../../../components/common/ErrorState";
import { PRODUCT_CATEGORIES } from "../../../utils/constants";
import path from "path";
import fs from "fs/promises";

// Server-side data fetching for static generation
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), "data", "products.json");
  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    const products: Product[] = JSON.parse(jsonData);

    const paths = products.map((product) => ({
      params: { id: product.id.toString() },
    }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  // We can pass the ID, but we'll fetch the fresh data client-side or
  // read it here to pre-populate. for consistency with existing code
  // which does client-side fetching in useEffect, we'll keep the client fetch
  // but we MUST have getStaticPaths for dynamic routes in a static export
  // or simple build.
  return {
    props: {
      id: params.id,
    },
    revalidate: 10, // ISR: regenerate every 10 seconds
  };
}

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    sku: "",
    name: "",
    category: "",
    unitCost: 0,
    reorderPoint: 0,
  });

  // Client-side fetch to ensure data is fresh - implementation unchanged
  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component logic (useEffect, handlers, render) ...
  // Re-implementing useState/useEffect unchanged from original for brevity in this replace block,
  // but ensuring imports and main structure are preserved.

  // Note: For the replace_file_content to be safe given the complexity,
  // I will re-output the Component body accurately.

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

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
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        router.push("/products");
      } else {
        console.error("Failed to update product");
        setSaving(false);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <ErrorState message={error} onRetry={fetchProduct} />
        <Button
          onClick={() => router.push("/products")}
          sx={{ mt: 2, display: "block", mx: "auto" }}
        >
          Back to Products
        </Button>
      </Container>
    );
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
          Edit Product
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Update the details of the product.
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
                  saving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Product"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/products")}
                disabled={saving}
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
