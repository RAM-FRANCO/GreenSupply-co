import {
  Grid2,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { customPalette } from "@/theme/theme";
import type { DashboardStats } from "@/types/inventory";

interface StatCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ReactNode;
  readonly color: string;
  readonly bgcolor: string;
}

const StatCard = ({ title, value, icon, color, bgcolor }: StatCardProps) => (
  <Card sx={{ height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ flexShrink: 0, mr: 2 }}>
          <Avatar
            sx={{ bgcolor: bgcolor, color: color, width: 48, height: 48 }}
          >
            {icon}
          </Avatar>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" noWrap>
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

interface StatsGridProps {
  readonly stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const { totalProducts, totalWarehouses, totalValue, lowStockAlerts } = stats;

  return (
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<CategoryIcon />}
          color={customPalette.stats.blue.icon}
          bgcolor={customPalette.stats.blue.bg}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Warehouses"
          value={totalWarehouses}
          icon={<WarehouseIcon />}
          color={customPalette.stats.purple.icon}
          bgcolor={customPalette.stats.purple.bg}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Total Inventory Value"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<AttachMoneyIcon />}
          color={customPalette.stats.green.icon}
          bgcolor={customPalette.stats.green.bg}
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title="Low Stock Alerts"
          value={lowStockAlerts}
          icon={<WarningAmberIcon />}
          color={customPalette.stats.red.icon}
          bgcolor={customPalette.stats.red.bg}
        />
      </Grid2>
    </Grid2>
  );
}
