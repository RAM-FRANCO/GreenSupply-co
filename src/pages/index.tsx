
import { useDashboardData } from "@/hooks/useDashboardData";
import { useRouter } from "next/router";
import { Box, Grid2, Button } from "@mui/material";
import StockBarChart from "@/components/dashboard/StockBarChart";
import ValueLineChart from "@/components/dashboard/ValueLineChart";
import DataTable from "@/components/common/DataTable";
import { useInventoryColumns } from "@/components/dashboard/columns";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import ErrorState from "@/components/common/ErrorState";
import LowStockAlertBanner from "@/components/common/LowStockAlertBanner";
import StatsList from "@/components/common/StatsList";
import CategoryIcon from "@mui/icons-material/Category";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { customPalette } from "@/theme/theme";
import PageHeader from "@/components/common/PageHeader";

export default function Home() {
  const {
    stats,
    chartData: barChartData,
    inventoryOverview,
    loading,
    error,
    refetch: fetchData,
  } = useDashboardData();

  const router = useRouter();

  const inventoryColumns = useInventoryColumns({
    onEdit: (id) => void router.push(`/products/${id}`), // Updated loop to detail view as Edit is gone 
  });

  // Early returns AFTER all hooks
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  // Determine if charts should be full width (stacked) or side-by-side
  const isLargeChart = barChartData.length > 8;

  return (
    <Box sx={{ p: 1 }}>
      {/* Header Section */}
      <PageHeader
        title="Dashboard"
        description="Overview of inventory performance and stock levels."
      />

      {/* Stats Grid */}
      <Box sx={{ mb: 4 }}>
        <StatsList
          stats={[
            {
              title: "Total Products",
              value: stats?.totalProducts || 0,
              Icon: CategoryIcon,
              iconColor: customPalette.stats.blue.icon,
              iconBgColor: customPalette.stats.blue.bg,
            },
            {
              title: "Warehouses",
              value: stats?.totalWarehouses || 0,
              Icon: WarehouseIcon,
              iconColor: customPalette.stats.purple.icon,
              iconBgColor: customPalette.stats.purple.bg,
            },
            {
              title: "Total Inventory Value",
              value: `$${(stats?.totalValue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              Icon: AttachMoneyIcon,
              iconColor: customPalette.stats.green.icon,
              iconBgColor: customPalette.stats.green.bg,
            },
            {
              title: "Low Stock Alerts",
              value: stats?.lowStockAlerts || 0,
              Icon: WarningAmberIcon,
              iconColor: customPalette.stats.red.icon,
              iconBgColor: customPalette.stats.red.bg,
            },
          ]}
        />
      </Box>

      {/* Critical Alerts Widget - Only show if there are critical items */}
      <LowStockAlertBanner
        count={stats?.lowStockAlerts || 0}
        action={
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => router.push("/alerts?severity=critical")}
            sx={{ flexShrink: 0, whiteSpace: "nowrap", ml: 2 }}
          >
            View Alerts
          </Button>
        }
      />

      {/* Charts Section */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, lg: isLargeChart ? 12 : 6 }}>
          <StockBarChart data={barChartData} />
        </Grid2>
        <Grid2 size={{ xs: 12, lg: isLargeChart ? 12 : 6 }}>
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
