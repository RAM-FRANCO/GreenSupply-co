import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  Button,
  Stack,
} from "@mui/material";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import DataTable from "../../components/common/DataTable";
import SearchInput from "../../components/common/SearchInput";


import { useProductColumns } from "@/components/products/columns";
import StockAdjustmentModal from "../../components/stock/StockAdjustmentModal";
import PageHeader from "../../components/common/PageHeader";
import ProductDialog from "@/components/products/ProductDialog";
import PurchaseOrdersModal from "@/components/alerts/PurchaseOrdersModal";
import type { ProductFormData } from "@/schemas/inventorySchema";
import { useQueryModal } from "@/hooks/useQueryModal";
import { useInventoryData } from "@/hooks/useInventoryData";

import { useRouter } from "next/router";

import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useUrlParams } from "@/hooks/useUrlParams";
import type { ProductWithStock } from "@/types/index"; 
import { exportToPdf } from "@/utils/exportUtils";
import ProductExportDialog from "@/components/products/ProductExportDialog"; 

export default function Products() {
  const router = useRouter();
  
  // URL State Management
  const { params, setSearch, setPage, setLimit, setFilter } = useUrlParams();

  // Local state for search input to prevent typing lag
  const [localSearch, setLocalSearch] = useState(params.search || "");
  const [isFocused, setIsFocused] = useState(false);

  // Sync local state if URL param changes externally (and not focused)
  useEffect(() => {
      if (!isFocused && (params.search || "") !== localSearch) {
          setLocalSearch(params.search || "");
      }
  }, [params.search, isFocused, localSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      setSearch(val); 
  };
  
  // Server-Side Data Fetching
  const { 
      data: products, 
      meta, 
      loading, 
      error, 
      refetch: refresh 
  } = usePaginatedData<ProductWithStock>("/api/products");

  // Legacy hook for actions ONLY (adjustStock etc) - we still need access to these methods
  // We need to import the actions separately or keep using the hook but ignore the data.
  // Ideally, we'd refactor useInventoryData to separate actions. 
  // We need categories for the filter and the dialog
  // useInventoryData provides enriched categories
  const { categories, adjustStock, warehouses, purchaseOrders, receiveOrder } = useInventoryData();
  
  // We need adjustStock method. It was in useInventoryData.
  // I need to implement `adjustStock` locally or extracting it.
  // Let's implement it here or import it.
  
  // adjustStock is now imported from useInventoryData

  const {
      categoryFilter,
      statusFilter,
  } = {
      categoryFilter: params.filter?.category || "",
      statusFilter: params.filter?.status || "all"
  };

  const processedProducts = products; // Already processed server-side

  // Delete Dialog State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  // Stock Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Product Dialog State (Derived from URL via hook)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    isOpen: isAddOpen, 
    open: openAdd 
  } = useQueryModal({ action: "add" });
  
  const { 
    isOpen: isEditOpen, 
    close: closeDialog,
    params: modalParams
  } = useQueryModal({ action: "edit" });

  const dialogMode = isEditOpen ? "edit" : "add";
  // Determine if *any* dialog is open
  const dialogOpen = isAddOpen || isEditOpen;
  
  const editId = modalParams.id ? Number(modalParams.id) : null;

  const initialData: Partial<ProductFormData> | undefined = useMemo(() => {
    if (dialogMode === "edit" && editId !== null) {
      const product = products.find((p) => p.id === editId);
      if (product) {
        return {
          sku: product.sku,
          name: product.name,
          categoryId: product.categoryId,
          unitCost: product.unitCost,
          reorderPoint: product.reorderPoint,
          description: product.description,
          image: product.image,
        };
      }
    }
    return undefined;
  }, [dialogMode, editId, products]);



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

  const handleStockAdjustment = async (
    productId: number,
    warehouseId: number,
    quantity: number,
    reason: string,
  ) => {
    setAdjustLoading(true);
    try {
      await adjustStock(productId, warehouseId, quantity, reason);
    } catch (e) {
      console.error(e);
      alert("Failed to adjust stock");
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleProductSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const url =
        dialogMode === "edit" && editId
          ? `/api/products/${editId}`
          : "/api/products";
      const method = dialogMode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await refresh();
        closeDialog();
      } else {
        console.error("Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleExportPDF = async (type: 'all' | 'category', categoryId?: string) => {
    setExportLoading(true);
    try {
      let url = '/api/products?limit=10000'; // Fetch all
      if (type === 'category' && categoryId) {
        url += `&category=${categoryId}`;
      }

      const res = await fetch(url);
      const { data } = await res.json();

      const exportData = data.map((p: ProductWithStock) => ({
        SKU: p.sku,
        Name: p.name,
        Category: categories.find((c) => c.id === p.categoryId)?.name || 'N/A',
        Stock: p.currentStock,
        'Unit Cost': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.unitCost),
        'Total Value': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.currentStock * p.unitCost),
        Status: p.stockStatus
      }));

      exportToPdf({
        title: type === 'category' 
          ? `Product Inventory - ${categories.find(c => c.id === categoryId)?.name || 'Category'}` 
          : 'Product Inventory Report',
        columns: [
          { header: 'SKU', dataKey: 'SKU' },
          { header: 'Name', dataKey: 'Name' },
          { header: 'Category', dataKey: 'Category' },
          { header: 'Stock', dataKey: 'Stock' },
          { header: 'Unit Cost', dataKey: 'Unit Cost' },
          { header: 'Total Value', dataKey: 'Total Value' },
          { header: 'Status', dataKey: 'Status' },
        ],
        data: exportData,
      });

    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };
  const columns = useProductColumns({
    onDelete: confirmDelete,
    categories,
  });

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <PageHeader
        title="All Products"
        description="Manage and track your entire sustainable inventory."
      >
        <Stack direction="row" spacing={2}>
{/* Clear Filters Button Removed from Header */}
          <Button
            variant="outlined"
            startIcon={<InventoryIcon />}
            sx={{ bgcolor: "background.paper", borderColor: "divider" }}
            onClick={() => setPoModalOpen(true)}
          >
            Pending Orders
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ bgcolor: "background.paper", borderColor: "divider" }}
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openAdd()}
          >
            Add Product
          </Button>
        </Stack>
      </PageHeader>

      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 2,
          border: 1,
          borderColor: "divider",
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <SearchInput
          placeholder="Search items..."
          value={localSearch}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          sx={{ flexGrow: 1, minWidth: 240 }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={categoryFilter}
            onChange={(e) => setFilter("category", e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setFilter("status", e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="in-stock">In Stock</MenuItem>
            <MenuItem value="low-stock">Low Stock</MenuItem>
            <MenuItem value="out-of-stock">Out of Stock</MenuItem>
          </Select>
        </FormControl>


         {(params.search || 
            (params.filter?.category && params.filter.category !== "") || 
            (params.filter?.status && params.filter.status !== "all")) && (
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={() => {
                // Hard reset: remove all query params except maybe keeping default limit if we wanted
                // But generally "Clear Filters" implies resetting everything to default state (page 1, no search, no filter)
                router.push({
                   pathname: router.pathname,
                   query: {} 
                });
                setLocalSearch("");
              }}
            >
              Clear Filters
            </Button>
          )}
      </Paper>

      {/* Products Table */}
      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}>
          {error && (
            <Box p={2} bgcolor="error.light" color="error.contrastText">
                <Typography>Error loading products: {error}</Typography>
                <Button variant="outlined" onClick={() => refresh()} sx={{ mt: 1, color: 'inherit', borderColor: 'inherit' }}>Retry</Button>
            </Box>
          )}
          <DataTable
            columns={columns}
            data={processedProducts}
            enablePagination
            title="Overview" 
            isLoading={loading}
            pageSize={params.limit}
            rowCount={meta.total}
            paginationState={{
                pageIndex: params.page - 1, 
                pageSize: params.limit
            }}
            onPaginationChange={(newState) => {
                setPage(newState.pageIndex + 1); 
                setLimit(newState.pageSize);
            }}
            onRowClick={(row) => router.push(`/products/${row.slug || row.id}`)}
            emptyState={
               <Box sx={{ textAlign: 'center', py: 8 }}>
                <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No products found</Typography>
                <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => openAdd()}>
                   Add Your First Product
                </Button>
               </Box>
            }
          />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will remove all stock history associated with this item."
      />

       <ProductDialog
        open={dialogOpen}
        onClose={closeDialog}
        mode={dialogMode}
        initialData={initialData}
        onSubmit={handleProductSubmit}
        isSubmitting={isSubmitting}
        categories={categories}
      />
      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        products={products}
        warehouses={warehouses}
        onConfirm={handleStockAdjustment}
        loading={adjustLoading}
      />
      
      {/* Purchase Orders Modal */}
      <PurchaseOrdersModal
        open={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        orders={purchaseOrders || []}
        onReceive={receiveOrder}

      />

      <ProductExportDialog 
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        categories={categories}
        onExport={handleExportPDF}
        loading={exportLoading}
      />
    </Box>
   );
 }
