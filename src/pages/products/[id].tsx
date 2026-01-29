// ... imports
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Grid2,
  Paper,
  Typography,
  Button,
  Chip,
  useTheme,
  Stack,
  alpha,
  TextField,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import {
  Edit,
  AddCircle,
  Inventory2,
  AttachMoney,
  Savings,
  ArrowBack,
  Search,
} from "@mui/icons-material";
import DataTable from "@/components/common/DataTable";
import StatCard from "@/components/common/StatCard";
import { useQueryModal } from "@/hooks/useQueryModal";
import ProductDialog from "@/components/products/ProductDialog";
import { ProductFormData } from "@/schemas/inventorySchema";
import { getCategoryColor } from "@/utils/themeUtils";
import { ColumnDef } from "@tanstack/react-table";
import { Stock, Warehouse } from "@/types/inventory";
import StockAdjustmentModal from "@/components/stock/StockAdjustmentModal";
import RecentActivity from "@/components/transfers/RecentActivity";
import RestockModal from "@/components/products/RestockModal";
import SuccessDialog from "@/components/common/SuccessDialog";

interface EnrichedStock extends Stock {
    warehouse?: Warehouse;
}

import useSWR, { mutate } from "swr";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error: Error & { info?: unknown; status?: number } = new Error('An error occurred while fetching the data.');
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query; // This is valid if route is /products/[id]
  const theme = useTheme();
  
  // Data Fetching
  const { data: product, error: productError, isLoading: productLoading } = useSWR(
      id ? `/api/products/${id}` : null,
      fetcher
  );
  
  const { data: allStock, isLoading: stockLoading } = useSWR('/api/stock', fetcher);
  const { data: warehouseData } = useSWR('/api/warehouses?limit=100', fetcher); 
  const warehouses = useMemo(() => Array.isArray(warehouseData) ? warehouseData : (warehouseData?.data || []), [warehouseData]);
  const { data: categories } = useSWR('/api/categories', fetcher);
  
  // Fetch Activity
  const { data: activityData, isLoading: activityLoading } = useSWR(
      product ? `/api/activity?productId=${product.id}&limit=5` : null,
      fetcher
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  
  // Restock Modal & Success State
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Modal Logic for Edit
  // Fix: Use 'targetId' instead of 'id' to avoid conflicting with route param 'id'
  const {
    isOpen: isEditOpen,
    open: openEdit,
    close: closeModal,
  } = useQueryModal({ action: "edit", paramKey: "action", lockedKeys: ["id"] }); // Lock 'id' route param

  const loading = productLoading || stockLoading;

  const initialData = useMemo(() => {
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
    return undefined;
  }, [product]);

  const productStock = useMemo(() => {
    if (!allStock || !product) return [];
    return allStock
        .filter((item: Stock) => item.productId === product.id)
        .map((item: Stock) => ({
            ...item,
            warehouse: warehouses?.find((w: Warehouse) => w.id === item.warehouseId)
        }));
  }, [allStock, product, warehouses]);

  const stats = useMemo(() => {
    if (!product || !productStock) return null;

    const totalStock = productStock.reduce((acc: number, item: Stock) => acc + item.quantity, 0);
    const totalValue = totalStock * product.unitCost;

    return {
      totalStock,
      unitCost: product.unitCost,
      totalValue,
    };
  }, [product, productStock]);

  const handleEditClick = () => {
    if (product) {
        // We don't need to pass ID to query if the modal knows context, 
        // BUT ProductDialog might expect it if it was designed to load by ID.
        // In this case, we pass current product initialData, so ID fetch in modal might be skipped if we provide data?
        // ProductDialog -> ProductForm.
        // It uses initialData.
        // BUT ProductDialog/State setup in index.tsx fetches by ID. 
        // HERE, we provide initialData heavily.
        // We just toggle "edit" action.
        openEdit("edit"); 
    }
  };

  const handleEditSubmit = async (data: ProductFormData) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Failed to update product");

      const updatedProduct = await res.json();
      
      console.log("[Debug] Update Response:", updatedProduct);
      console.log("[Debug] Current Route ID:", id);
      console.log("[Debug] New Slug:", updatedProduct.slug);
      console.log("[Debug] Condition check:", updatedProduct.slug && updatedProduct.slug !== id);

      // If slug changed, redirect to new URL to avoid 404 on SWR re-fetch
      // We check if the current 'id' param matches the new slug. 
      // If 'id' was a numeric ID, this redirect will move them to the slug URL, which is also fine/better.
      if (updatedProduct.slug && updatedProduct.slug !== id) {
          console.log("[Debug] Initiating Redirect to:", `/products/${updatedProduct.slug}`);

          // KEY FIX: Update the cache for the CURRENT (old) ID with the new data
          // and disable revalidation. This prevents SWR from fetching 404
          // while we are waiting for the redirect to happen.
          console.log("[Debug] Mutating old key:", `/api/products/${id}`);
          await mutate(`/api/products/${id}`, updatedProduct, false);
          
          // ALSO populate the cache for the NEW slug (destination) to prevent
          // immediate 404 fetch upon navigation.
          console.log("[Debug] Mutating new key:", `/api/products/${updatedProduct.slug}`);
          await mutate(`/api/products/${updatedProduct.slug}`, updatedProduct, false);

          await router.replace(`/products/${updatedProduct.slug}`);
          console.log("[Debug] Redirect called - Skipping closeModal to prevent router conflict");
      } else {
          console.log("[Debug] No redirect needed, refreshing in place");
          mutate(`/api/products/${id}`); // Refresh SWR if URL didn't change
          closeModal();
      }
    } catch (error) {
      console.error("Failed to update product", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStockAdjustment = async (
    pId: number,
    wId: number,
    qty: number,
    reason: string,
  ) => {
      setAdjustLoading(true);
      try {
           await fetch("/api/stock/adjust", {
                method: "POST",
                body: JSON.stringify({ productId: pId, warehouseId: wId, adjustmentQuantity: qty, reason }),
                headers: { "Content-Type": "application/json" }
           });
           mutate('/api/stock'); // Refresh stock
           setAdjustModalOpen(false);
      } catch (err) {
          console.error(err);
      } finally {
          setAdjustLoading(false);
      }
  };

  const handleRestock = async (wId: number, qty: number) => {
      if (!product) return;
      try {
           const res = await fetch("/api/stock/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, warehouseId: wId, quantity: qty })
           });
           
           if (!res.ok) throw new Error("Failed to restock");
           
           mutate('/api/stock'); 
           mutate(`/api/activity?productId=${product.id}&limit=5`); // Refresh activity too
           setSuccessModalOpen(true);
      } catch (err) {
           console.error(err);
           throw err; // Re-throw for modal to handle if needed, though modal handles error internal state mostly? 
           // actually RestockModal expects promise to catch error.
      }
  };

  const filteredStock = useMemo(() => {
    if (!searchTerm) return productStock;
    const lowerTerm = searchTerm.toLowerCase();
    return productStock.filter((item: EnrichedStock) =>
      item.warehouse?.name?.toLowerCase().includes(lowerTerm)
    );
  }, [productStock, searchTerm]);

  // Columns... (keeping same)
  const columns = useMemo<ColumnDef<EnrichedStock>[]>(
    () => [
      {
        accessorFn: (row) => row.warehouse?.name || "Unknown Warehouse",
        id: "warehouseName",
        header: "Warehouse Name",
        cell: (info) => (
          <Typography variant="body2" fontWeight={500}>
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Stock On Hand",
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {(info.getValue() as number).toLocaleString()}
          </Typography>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (info) => {
          const qty = info.row.original.quantity;
          const reorderPoint = product?.reorderPoint || 0;
          let color: "success" | "warning" | "error" = "success";
          let label = "Optimal";

          if (qty === 0) {
            color = "error";
            label = "Out of Stock";
          } else if (qty <= reorderPoint) {
            color = "warning";
            label = "Low Stock";
          }

          return (
            <Chip
              label={label}
              size="small"
              color={color}
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          );
        },
      },
    ],
    [product]
  );

  if (productError) {
      // ... error View
      return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Product not found or failed to load.</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/products")}>
          Back to Products
        </Button>
      </Container>
    );
  }

  if (loading) {
      // ... skeleton view
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} elevation={0}>
             <Skeleton variant="text" width={300} height={60} />
             <Skeleton variant="text" width={200} />
        </Paper>
        <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, lg: 8 }}>
                <Skeleton variant="rectangular" height={400} />
            </Grid2>
             <Grid2 size={{ xs: 12, lg: 4 }}>
                <Skeleton variant="rectangular" height={400} />
             </Grid2>
        </Grid2>
      </Container>
    );
  }

  if (!product) return null;

  const categoryColor = getCategoryColor(product.category);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
        elevation={0}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexDirection={{ xs: "column", md: "row" }}
          gap={2}
        >
          <Box display="flex" gap={2}>
            <Button
                variant="outlined"
                sx={{ 
                    minWidth: 40, width: 40, height: 40, p: 0, borderRadius: 2, borderColor: theme.palette.divider, 
                    color: 'text.secondary',
                    '&:hover': { bgcolor: theme.palette.action.hover }
                 }}
                onClick={() => router.push('/products')}
            >
                <ArrowBack />
            </Button>
            
            <Box>
              <Typography variant="h4" fontWeight={700} component="h1">
                {product.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <Chip
                  label={`SKU: ${product.sku}`}
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: theme.palette.action.selected,
                  }}
                />
                <Chip
                  label={product.category}
                  size="small"
                  sx={{
                    bgcolor: categoryColor[50],
                    color: categoryColor[800],
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEditClick}
              sx={{ borderColor: theme.palette.divider, color: "text.primary" }}
            >
              Edit
            </Button>
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                sx={{ bgcolor: theme.palette.primary.main }}
                onClick={() => setRestockModalOpen(true)}
              >
                Restock
              </Button>
          </Box>
        </Box>
      </Paper>

      <Grid2 container spacing={3}>
        {/* Left Column */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
            {/* Image & Description */}
            <Paper
                sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                overflow: "hidden",
                }}
                elevation={0}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: { xs: 200, md: 320 },
                        bgcolor: 'grey.100',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {/* Product Image */}
                    {product.image ? (
                        <Box
                            component="img"
                            src={product.image}
                            alt={product.name}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <Inventory2 sx={{ fontSize: 80, color: 'grey.300' }} />
                    )}
                    <Chip 
                        label="Active Product" 
                        color="success" 
                        size="small"
                        sx={{ position: 'absolute', top: 16, right: 16 }}
                    />
                </Box>
                <Box p={3} borderTop={`1px solid ${theme.palette.divider}`}>
                    <Typography
                        variant="overline"
                        color="text.secondary"
                        fontWeight={600}
                    >
                        Description
                    </Typography>
                    <Typography variant="body1" color="text.primary" mt={1} sx={{ whiteSpace: 'pre-wrap' }}>
                        {product.description || `${product.name} is a high-quality sustainable product in the ${product.category} category.`}
                    </Typography>
                </Box>
            </Paper>

            {/* Inventory Breakdown */}
             <DataTable
                title="Inventory Breakdown"
                data={filteredStock}
                columns={columns}
                isLoading={loading}
                emptyMessage="No stock recorded for this product."
                headerActions={
                   <Stack direction="row" spacing={2} alignItems="center">
                         <TextField
                            size="small"
                            placeholder="Search warehouse..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                       <Button 
                           size="small" 
                           variant="text" 
                           color="primary"
                           onClick={() => router.push('/warehouses')}
                        >
                           Manage Warehouses
                       </Button>
                   </Stack>
                }
            />
            </Stack>
        </Grid2>

        {/* Right Column */}
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
              elevation={0}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Quick Stats
              </Typography>
              <Stack spacing={2}>
                 <Box height={100}>
                    <StatCard 
                        title="Total Stock" 
                        value={`${stats?.totalStock.toLocaleString() || 0} units`} 
                        Icon={Inventory2}
                        iconColor={theme.palette.info.main}
                        iconBgColor={alpha(theme.palette.info.main, 0.1)}
                    />
                 </Box>
                 <Box height={100}>
                    <StatCard 
                        title="Unit Price" 
                        value={`$${stats?.unitCost.toFixed(2)}`} 
                        Icon={AttachMoney}
                        iconColor={theme.palette.success.main}
                        iconBgColor={alpha(theme.palette.success.main, 0.1)}
                    />
                 </Box>
                 <Box height={100}>
                    <StatCard 
                        title="Total Value" 
                        value={`$${stats?.totalValue.toLocaleString() || 0}`} 
                        Icon={Savings}
                        iconColor={theme.palette.secondary.main}
                        iconBgColor={alpha(theme.palette.secondary.main, 0.1)}
                    />
                 </Box>
              </Stack>
            </Paper>

    

            {/* Recent Activity */}
            <RecentActivity 
                events={activityData || []} 
                loading={activityLoading} 
                maxHeight={400}
            />

          </Stack>
        </Grid2>
      </Grid2>

      <ProductDialog
        open={isEditOpen}
        onClose={closeModal}
        mode="edit"
        initialData={initialData}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        categories={categories || []}
      />
      
      <StockAdjustmentModal
         open={adjustModalOpen}
         onClose={() => setAdjustModalOpen(false)}
         products={[product]} // Pass only current product
         warehouses={warehouses}
         onConfirm={handleStockAdjustment}
         loading={adjustLoading}
         initialProductId={product.id} // Pre-select product
       />
       
       <RestockModal
          open={restockModalOpen}
          onClose={() => setRestockModalOpen(false)}
          product={product}
          warehouses={warehouses}
          onRestock={handleRestock}
       />

       <SuccessDialog
          open={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          title="Order Placed"
          message="Purchase order created successfully. It will appear in pending orders."
       />
    </Container>
  );
}
