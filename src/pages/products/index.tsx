import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import ErrorState from "../../components/common/ErrorState";
import DataTable from "../../components/common/DataTable";
import { useInventory } from "../../hooks/useInventory";
import { useProductFiltering } from "../../hooks/useProductFiltering";
import { useProductColumns } from "../../hooks/columns/useProductColumns";

export default function Products() {
  const router = useRouter();
  const { products, stocks, loading, error, refresh } = useInventory();

  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    processedProducts,
  } = useProductFiltering({ products, stocks });

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  const handleDelete = async () => {
    if (selectedProductId) {
      try {
        const res = await fetch(`/api/products/${selectedProductId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await refresh(); // Refresh data after delete
          setDeleteOpen(false);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedProductId(id);
    setDeleteOpen(true);
  };

  const uniqueCategories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const productColumns = useProductColumns({
    onEdit: (id) => void router.push(`/products/edit/${id}`),
    onDelete: confirmDelete,
  });

  if (loading) {
    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between" }}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              All Products
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loading inventory data...
            </Typography>
          </Stack>
        </Box>
        <DataTable data={[]} columns={productColumns} isLoading />
      </Box>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "text.primary" }}
          >
            All Products
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage and track your entire sustainable inventory.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: "background.paper",
              color: "text.primary",
              borderColor: "divider",
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/products/add")}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Add Product
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
        >
          <TextField
            placeholder="Search by name, SKU, or category"
            size="small"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, maxWidth: 500 }}
          />
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                displayEmpty
                MenuProps={{ disableScrollLock: true }}
              >
                {/* Dynamic Categories from Data for Filtering */}
                {uniqueCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === "All" ? "Category: All" : cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                MenuProps={{ disableScrollLock: true }}
              >
                <MenuItem value="All">Status: All</MenuItem>
                <MenuItem value="In Stock">In Stock</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {/* Table Component */}
      <DataTable data={processedProducts} columns={productColumns} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
