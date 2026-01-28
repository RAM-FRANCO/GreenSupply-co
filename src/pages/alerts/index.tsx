import { useState, useMemo } from "react";
import { useInventoryData, type EnrichedStock } from "@/hooks/useInventoryData";
import { customPalette } from "@/theme/theme";
import { getStockStatus } from "@/utils/stockUtils";
import {
  Container,
  Button,
  Box,
  Paper,
  InputAdornment,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  FileDownload as FileDownloadIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LowPriority as LowPriorityIcon,
  PriorityHigh as PriorityHighIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";

import { useAlertsColumns } from "@/components/alerts/columns";
import StatsList from "@/components/common/StatsList";
import type { StockStats } from "@/types/inventory";

import StockHealthChart from "@/components/dashboard/StockHealthChart";
import StockBarChart from "@/components/dashboard/StockBarChart";
import DataTable from "@/components/common/DataTable";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

import AlertDetailsModal from "@/components/alerts/AlertDetailsModal";
import SuccessDialog from "@/components/common/SuccessDialog";
import PurchaseOrdersModal from "@/components/alerts/PurchaseOrdersModal";
import ErrorState from "@/components/common/ErrorState";
import LowStockAlertBanner from "@/components/common/LowStockAlertBanner";
import PageHeader from "@/components/common/PageHeader";
import { useQueryModal } from "@/hooks/useQueryModal";

/** @todo Replace with real data from API */
const PLACEHOLDER_HEALTHY_TREND = 2.5;

export default function AlertsPage() {
  const {
    enrichedStock,
    categoryChartData,
    loading,
    error,
    refetch,
    reorderStock,
    updateAlertStatus,
    pendingReordersCount,
    purchaseOrders,
    receiveOrder,
  } = useInventoryData();

  const [poModalOpen, setPoModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  // Reorder Modal State (URL-driven)
  const { 
    isOpen: isReorderOpen, 
    close: closeReorder, 
    open: openReorder,
    params: reorderParams
  } = useQueryModal({ action: "reorder" });

  const selectedForReorder = useMemo(() => {
    if (!isReorderOpen || !reorderParams.stockId) return null;
    return enrichedStock.find(item => item.id === Number(reorderParams.stockId)) || null;
  }, [isReorderOpen, reorderParams.stockId, enrichedStock]);

  const handleOpenReorder = (stockId: number) => {
    openReorder("reorder", { stockId });
  };

  // Calculations for Stats
  const stats: StockStats = useMemo(() => {
    const totalItems = enrichedStock.length;
    if (totalItems === 0) {
      return {
        healthyPercentage: 0,
        healthyTrend: 0,
        approachingReorder: 0,
        belowThreshold: 0,
        pendingReorders: 0,
      };
    }

    const belowThreshold = enrichedStock.filter(
      (item) =>
        item.product &&
        getStockStatus(item.quantity, item.product.reorderPoint) ===
          "critical-low",
    ).length;

    const approachingReorder = enrichedStock.filter(
      (item) =>
        item.product &&
        getStockStatus(item.quantity, item.product.reorderPoint) ===
          "low-stock",
    ).length;

    const healthy = totalItems - belowThreshold - approachingReorder;
    const healthyPercentage = Math.round((healthy / totalItems) * 100);

    return {
      healthyPercentage,
      healthyTrend: PLACEHOLDER_HEALTHY_TREND,
      approachingReorder,
      belowThreshold,
      pendingReorders: pendingReordersCount,
    };
  }, [enrichedStock, pendingReordersCount]);

  const healthChartData = useMemo(() => {
    const critical = stats.belowThreshold;
    const low = stats.approachingReorder;
    const healthy = enrichedStock.length - critical - low;

    return [
      {
        name: "Healthy",
        value: healthy,
        color: customPalette.status.inStock.chart,
      },
      {
        name: "Low Stock",
        value: low,
        color: customPalette.status.warning.chart,
      },
      {
        name: "Critical",
        value: critical,
        color: customPalette.status.lowStock.chart,
      },
    ].filter((d) => d.value > 0);
  }, [enrichedStock.length, stats]);

  const filteredData = useMemo(() => {
    let data = enrichedStock;

    // Filter by Status Tab
    if (filterStatus !== "all") {
      data = data.filter((item) => {
        if (!item.product) return false;
        const status = getStockStatus(item.quantity, item.product.reorderPoint);
        return status === filterStatus;
      });
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.product?.name.toLowerCase().includes(lower) ||
          item.product?.sku.toLowerCase().includes(lower) ||
          item.product?.category.toLowerCase().includes(lower),
      );
    }
    return data.sort((a, b) => {
      const getScore = (item: EnrichedStock) => {
        if (!item.product) return 0;
        const status = getStockStatus(item.quantity, item.product.reorderPoint);
        if (status === "critical-low") return 3;
        if (status === "low-stock") return 2;
        return 1;
      };
      return getScore(b) - getScore(a);
    });
  }, [enrichedStock, searchTerm, filterStatus]);

  const columns = useAlertsColumns({
    updateAlertStatus,
    setSelectedForReorder: (item) => handleOpenReorder(item.id),
  });

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <PageHeader
        title="Alerts & Stock Health"
        description="Monitor stock health, reorder points, and warehouse distribution."
      >
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderColor: "divider",
          }}
        >
          Export Report
        </Button>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          color="primary"
          onClick={() => setPoModalOpen(true)}
        >
          Pending Orders
        </Button>
      </PageHeader>

      {/* Alert */}
      <LowStockAlertBanner count={stats.belowThreshold} />

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <StatsList
          stats={[
            {
              title: "Healthy Stock",
              value: `${stats.healthyPercentage}%`,
              Icon: CheckCircleIcon,
              iconColor: customPalette.status.inStock.text,
              iconBgColor: customPalette.status.inStock.bg,
              darkIconBgColor: customPalette.stats.greenDark,
              trend:
                stats.healthyTrend > 0
                  ? `+${stats.healthyTrend}%`
                  : `${stats.healthyTrend}%`,
            },
            {
              title: "Approaching Reorder",
              value: stats.approachingReorder,
              Icon: LowPriorityIcon,
              iconColor: customPalette.stats.yellow.icon,
              iconBgColor: customPalette.stats.yellow.bg,
              darkIconBgColor: customPalette.stats.yellowDark,
            },
            {
              title: "Below Threshold",
              value: stats.belowThreshold,
              Icon: PriorityHighIcon,
              iconColor: customPalette.status.lowStock.text,
              iconBgColor: customPalette.status.lowStock.bg,
              darkIconBgColor: customPalette.stats.redDark,
            },
            {
              title: "Pending Reorders",
              value: stats.pendingReorders,
              Icon: LocalShippingIcon,
              iconColor: customPalette.stats.blue.icon,
              iconBgColor: customPalette.stats.blue.bg,
              darkIconBgColor: customPalette.stats.blueDark,
            },
          ]}
        />
      </Box>

      {/* Charts */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <StockBarChart data={categoryChartData} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <StockHealthChart data={healthChartData} />
        </Grid>
      </Grid>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tabs
            value={filterStatus}
            onChange={(_, v) => setFilterStatus(v)}
            sx={{ minHeight: 48 }}
          >
            <Tab label="All Items" value="all" />
            <Tab
              label="Critical"
              value="critical-low"
              icon={<WarningIcon fontSize="small" color="error" />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab label="Low Stock" value="low-stock" sx={{ minHeight: 48 }} />
            <Tab
              label="Overstocked"
              value="overstocked"
              sx={{ minHeight: 48 }}
            />
          </Tabs>

          <Box sx={{ display: "flex", gap: 2, py: 1 }}>
            <TextField
              size="small"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Box>
        <DataTable
          columns={columns}
          data={filteredData}
          enablePagination
          pageSize={10}
          title=""
        />
      </Paper>

      {/* Reorder Confirmation Modal */}
      <AlertDetailsModal
        open={Boolean(selectedForReorder)}
        alert={
          selectedForReorder &&
          selectedForReorder.product &&
          selectedForReorder.warehouse
            ? {
                id: 0, // Placeholder as we don't have alert ID here, but not needed for display
                product: selectedForReorder.product,
                warehouse: selectedForReorder.warehouse,
                currentStock: selectedForReorder.quantity,
                reorderPoint: selectedForReorder.product.reorderPoint,
                shortage:
                  selectedForReorder.quantity -
                  selectedForReorder.product.reorderPoint,
                severity: "critical", // Defaulting to critical for reorder view
                status: selectedForReorder.alertStatus || "active",
                recommendedQuantity: Math.max(
                  0,
                  selectedForReorder.product.reorderPoint * 2 -
                    selectedForReorder.quantity,
                ),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                timestamp: new Date().toISOString(),
              }
            : null
        }
        onClose={closeReorder}
        onReorder={async (quantity: number) => {
          if (selectedForReorder) {
            try {
              await reorderStock(
                selectedForReorder.productId,
                selectedForReorder.warehouseId,
                quantity,
              );
              closeReorder();
              setSuccessModalOpen(true);
            } catch (err) {
              console.error("Reorder failed", err);
            }
          }
        }}
      />

      {/* Success Modal */}
      <SuccessDialog
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Order Placed (Pending)"
        message="Purchase order has been successfully created. View it in the Purchase Orders menu."
        buttonText="Done"
      />

      {/* Purchase Orders Modal */}
      <PurchaseOrdersModal
        open={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        orders={purchaseOrders}
        onReceive={receiveOrder}
      />
    </Container>
  );
}
