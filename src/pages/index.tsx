import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Grid2, Typography } from "@mui/material";
import StatsGrid from "@/components/dashboard/StatsGrid";
import StockBarChart from "@/components/dashboard/StockBarChart";
import ValueLineChart from "@/components/dashboard/ValueLineChart";
import DataTable from "@/components/common/DataTable";
import { useInventoryColumns } from "@/hooks/columns/useInventoryColumns";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import ErrorState from "@/components/common/ErrorState";
import type {
  Product,
  Warehouse,
  Stock,
  InventoryItem,
  DashboardStats,
  CategoryChartData,
} from "@/types/inventory";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsRes, warehousesRes, stockRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/warehouses"),
        fetch("/api/stock"),
      ]);

      if (!productsRes.ok || !warehousesRes.ok || !stockRes.ok) {
        throw new Error("Failed to fetch data from one or more endpoints");
      }

      const [productsData, warehousesData, stockData] = await Promise.all([
        productsRes.json() as Promise<Product[]>,
        warehousesRes.json() as Promise<Warehouse[]>,
        stockRes.json() as Promise<Stock[]>,
      ]);

      setProducts(productsData);
      setWarehouses(warehousesData);
      setStock(stockData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate metrics with useMemo for future-proofing
  // All hooks must be called before any early returns
  const { inventoryOverview, lowStockCount, totalValue } = useMemo(() => {
    let lowStock = 0;
    let totalVal = 0;

    const overview: InventoryItem[] = products.map((product) => {
      const productStock = stock.filter((s) => s.productId === product.id);
      const totalQuantity = productStock.reduce(
        (sum, s) => sum + s.quantity,
        0,
      );
      const isLowStock = totalQuantity <= product.reorderPoint;
      if (isLowStock) lowStock++;

      const productValue = product.unitCost * totalQuantity;
      totalVal += productValue;

      return {
        ...product,
        totalQuantity,
        isLowStock,
      };
    });

    return {
      inventoryOverview: overview,
      lowStockCount: lowStock,
      totalValue: totalVal,
    };
  }, [products, stock]);

  const barChartData = useMemo<CategoryChartData[]>(() => {
    const stockByCategory: Record<string, number> = {};
    inventoryOverview.forEach((item) => {
      stockByCategory[item.category] =
        (stockByCategory[item.category] || 0) + item.totalQuantity;
    });
    return Object.entries(stockByCategory).map(([category, value]) => ({
      category,
      value,
    }));
  }, [inventoryOverview]);

  const stats = useMemo<DashboardStats>(
    () => ({
      totalProducts: products.length,
      totalWarehouses: warehouses.length,
      totalValue,
      lowStockAlerts: lowStockCount,
    }),
    [products.length, warehouses.length, totalValue, lowStockCount],
  );

  const router = useRouter();

  const inventoryColumns = useInventoryColumns({
    onEdit: (id) => void router.push(`/products/edit/${id}`),
  });

  // Early returns AFTER all hooks
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of inventory performance and stock levels.
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box sx={{ mb: 4 }}>
        <StatsGrid stats={stats} />
      </Box>

      {/* Charts Section */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <StockBarChart data={barChartData} />
        </Grid2>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <ValueLineChart />
        </Grid2>
      </Grid2>

      {/* Detailed Table */}
      <DataTable
        data={inventoryOverview}
        columns={inventoryColumns}
        title="Inventory Overview"
      />
    </Box>
  );
}
