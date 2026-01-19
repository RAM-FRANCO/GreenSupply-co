import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const StatCard = ({ title, value, icon, color, bgcolor }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexShrink: 0, mr: 2 }}>
          <Avatar
            sx={{ bgcolor: bgcolor, color: color, width: 48, height: 48 }}
          >
            {icon}
          </Avatar>
        </Box>
        <Box>
          <Typography variant='body2' color='text.secondary' noWrap>
            {title}
          </Typography>
          <Typography variant='h5' component='div' sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function StatsGrid({ stats }) {
  const { totalProducts, totalWarehouses, totalValue, lowStockAlerts } = stats;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title='Total Products'
          value={totalProducts}
          icon={<CategoryIcon />}
          color='#1976D2' // Blue 700
          bgcolor='#BBDEFB' // Blue 100
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title='Warehouses'
          value={totalWarehouses}
          icon={<WarehouseIcon />}
          color='#7B1FA2' // Purple 700
          bgcolor='#E1BEE7' // Purple 100
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title='Total Inventory Value'
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<AttachMoneyIcon />}
          color='#2E7D32' // Green 800 (Primary)
          bgcolor='#C8E6C9' // Green 100
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title='Low Stock Alerts'
          value={lowStockAlerts}
          icon={<WarningAmberIcon />}
          color='#D32F2F' // Red 700
          bgcolor='#FFCDD2' // Red 100
        />
      </Grid>
    </Grid>
  );
}
