import { useState } from "react";
import {
  MoreVert as MoreVertIcon,
  Place as PlaceIcon,
  Storefront as StorefrontIcon,
  Warehouse as WarehouseIcon,
  LocalShipping as LocalShippingIcon,
  AcUnit as AcUnitIcon,
  Inventory as InventoryIcon,
  SwapHoriz as SwapHorizIcon,
  Block as BlockIcon,
} from "@mui/icons-material";
import { 
  Card,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  useTheme,
  alpha,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { blue, purple, cyan, orange } from "@mui/material/colors";
import { Warehouse } from "@/types/inventory";
import { customPalette } from "@/theme/theme";

// Helper to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper to map warehouse type to icon and color
const getWarehouseMetadata = (type: string = "Distribution Center") => {
    switch (type) {
        case "Fulfillment Center":
            return { Icon: LocalShippingIcon, color: purple[600], bg: purple[50] };
        case "Cold Storage":
            return { Icon: AcUnitIcon, color: cyan[600], bg: cyan[50] };
        case "Retail Store":
            return { Icon: StorefrontIcon, color: orange[600], bg: orange[50] };
        default: // Distribution Center
            return { Icon: WarehouseIcon, color: blue[600], bg: blue[50] };
    }
};

interface WarehouseCardProps {
  readonly warehouse: Warehouse;
  readonly skuCount: number;
  readonly capacityUsed: number;
  readonly onDelete: (id: number) => void;
  readonly onEdit?: (id: number) => void;
  readonly onView?: (id: number) => void;
}

export default function WarehouseCard({ warehouse, skuCount, capacityUsed, onDelete, onEdit, onView }: WarehouseCardProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Real Data Logic
  const meta = getWarehouseMetadata(warehouse.type);
  const Icon = meta.Icon;
  const maxSlots = warehouse.maxSlots || 500; // Default to 500 if not set
  const capacity = Math.min(Math.round((capacityUsed / maxSlots) * 100), 100);
  
  let status = "Operational";
  let statusColor = "green";

  if (capacity >= 90) {
      status = "Full Capacity";
      statusColor = "red";
  } else if (capacity >= 75) {
      status = "High Capacity";
      statusColor = "yellow";
  } else if (capacity < 10) {
      status = "Low Usage";
      statusColor = "blue";
  }

  const managerInitials = warehouse.managerName ? getInitials(warehouse.managerName) : "NA";
  const managerName = warehouse.managerName || "Unassigned";

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleClose();
    onDelete(warehouse.id);
  };

  // Safe color access
  const getSafeColor = (colorName: string, shade: string = "main") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colorGroup = (theme.palette as any)[colorName] || theme.palette.primary;
    return shade === "main" ? colorGroup.main : colorGroup[shade];
  };

  // Helper for status badge colors
  const getStatusColors = (color: string) => {
    switch(color) {
        case 'green': return { bg: customPalette.status.inStock.bg, text: customPalette.status.inStock.text, dot: customPalette.status.inStock.chart };
        case 'red': return { bg: customPalette.status.lowStock.bg, text: customPalette.status.lowStock.text, dot: customPalette.status.lowStock.chart };
        case 'blue': return { bg: customPalette.stats.blue.bg, text: customPalette.stats.blue.icon, dot: customPalette.stats.blue.icon };
        case 'yellow': return { bg: customPalette.status.warning.bg, text: customPalette.status.warning.text, dot: customPalette.status.warning.chart };
        case 'purple': return { bg: alpha(theme.palette.secondary.main, 0.1), text: theme.palette.secondary.main, dot: theme.palette.secondary.main };
        default: return { bg: theme.palette.grey[100], text: theme.palette.grey[800], dot: theme.palette.grey[500] };
    }
  }
  const statusColors = getStatusColors(statusColor);

  // SVG Gauge Calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (capacity / 100) * circumference;

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        transition: "all 0.2s",
        cursor: "pointer",
        "&:hover": {
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.main,
          "& .warehouse-title": {
            color: theme.palette.primary.main,
          }
        },
      }}
      onClick={() => {
        if (onView) onView(warehouse.id);
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box display="flex" gap={2} alignItems="start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: meta.bg,
              color: meta.color,
            }}
          >
            <Icon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" className="warehouse-title" sx={{ transition: "color 0.2s" }}>
              {warehouse.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <PlaceIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="caption" color="text.secondary">
                {warehouse.location}
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            handleMenuClick(e);
        }}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" flexDirection="column" gap={3}>
          <Box>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" letterSpacing={0.5} display="block" mb={0.5}>
              Manager
            </Typography>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 12,
                  bgcolor: alpha(getSafeColor("primary"), 0.1),
                  color: "primary.main", // Standardize manager color or use logic if desired
                  fontWeight: "bold",
                }}
              >
                {managerInitials}
              </Avatar>
              <Typography variant="body1" fontWeight="medium">
                {managerName}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase" letterSpacing={0.5} display="block" mb={0.5}>
              Total SKUs
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {skuCount.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Custom Gauge */}
        <Box position="relative" width={100} height={100} display="flex" alignItems="center" justifyContent="center">
            <Box 
                component="svg"
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                sx={{ transform: "rotate(-90deg)" }}
            >
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]}
                    strokeWidth="8"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={statusColors.text} // Use text color for gauge to match theme
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </Box>
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="h6" fontWeight="bold" lineHeight={1}>
                    {capacity}%
                </Typography>
                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    Capacity
                </Typography>
            </Box>
        </Box>
      </Box>

      <Box pt={2} borderTop={`1px solid ${theme.palette.divider}`} display="flex" justifyContent="space-between" alignItems="center">
         <Chip 
            label={status}
            size="small"
            sx={{
                bgcolor: statusColors.bg,
                color: statusColors.text,
                fontWeight: 600,
                fontSize: 11,
                borderRadius: 100,
                "& .MuiChip-label": { px: 1.5, display: "flex", alignItems: "center", gap: 0.5 },
                "& .MuiChip-label::before": {
                    content: '""',
                    display: "block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: statusColors.dot,
                }
            }}
         />
         <Typography 
            component="button" 
            variant="body2" 
            color="primary" 
            fontWeight="bold"
            sx={{ 
                background: "none", 
                border: "none", 
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" } 
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(warehouse.id);
            }}
         >
            View Details
         </Typography>
      </Box>

      <Menu 
        anchorEl={anchorEl} 
        open={open} 
        onClose={handleClose}
        PaperProps={{
            sx: { minWidth: 220, mt: 1, boxShadow: theme.shadows[3], borderRadius: 2 }
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <MenuItem onClick={handleClose}>
            <ListItemIcon>
                <InventoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Inventory</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); onEdit?.(warehouse.id); }}>
             <ListItemIcon>
                <SwapHorizIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
             <ListItemIcon>
                <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Deactivate Warehouse</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}
