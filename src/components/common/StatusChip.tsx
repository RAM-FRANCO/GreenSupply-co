/**
 * Reusable status chip component.
 * Maps status values to consistent colors across the app.
 */
import { Chip, type ChipProps, type SxProps, type Theme } from "@mui/material";
import { customPalette } from "@/theme/theme";
import { getStockStatus } from "@/utils/stockUtils";

export type StatusType =
  | "completed"
  | "pending"
  | "cancelled"
  | "in-transit"
  | "low"
  | "critical"
  | "adequate"
  | "overstocked"
  | "healthy"
  | "low-stock"
  | "critical-low";

interface StatusChipProps {
  readonly status?: StatusType;
  readonly quantity?: number;
  readonly reorderPoint?: number;
  readonly size?: ChipProps["size"];
  readonly sx?: SxProps<Theme>;
}

const statusConfig: Record<
  StatusType,
  {
    color: ChipProps["color"];
    label: string;
    customColors?: { bg: string; text: string };
  }
> = {
  completed: {
    color: "success",
    label: "Completed",
    customColors: customPalette.transfer.completed,
  },
  pending: {
    color: "warning",
    label: "Pending",
    customColors: customPalette.transfer.pending,
  },
  cancelled: {
    color: "error",
    label: "Cancelled",
    customColors: customPalette.transfer.cancelled,
  },
  "in-transit": {
    color: "info",
    label: "In Transit",
    customColors: customPalette.transfer.inTransit,
  },
  low: { color: "warning", label: "Low Stock" },
  critical: { color: "error", label: "Critical" },
  adequate: { color: "success", label: "Adequate" },
  overstocked: { color: "info", label: "Overstocked" },
  // Stock status types for table cells
  healthy: {
    color: "success",
    label: "Healthy",
    customColors: customPalette.status.inStock,
  },
  "low-stock": {
    color: "warning",
    label: "Low Stock",
    customColors: customPalette.status.warning,
  },
  "critical-low": {
    color: "error",
    label: "Critical Low",
    customColors: customPalette.status.lowStock,
  },
};

/**
 * Status badge with consistent color mapping.
 * Can derive status from quantity/reorderPoint if status is not provided.
 */
function StatusChip({
  status: initialStatus,
  quantity,
  reorderPoint,
  size = "small",
  sx,
}: StatusChipProps) {
  // Derive status if not provided directly
  let status = initialStatus;
  
  if (!status && typeof quantity === "number" && typeof reorderPoint === "number") {
    status = getStockStatus(quantity, reorderPoint);
  }

  // Fallback if still undefined (shouldn't happen with correct usage)
  if (!status) {
    if (process.env.NODE_ENV === "development") {
      console.warn("StatusChip: Missing status or invalid stock data");
    }
    return null;
  }

  if (process.env.NODE_ENV === "development" && !(status in statusConfig)) {
    console.warn(`StatusChip: Unexpected status "${status}"`);
  }
  
  const config = statusConfig[status] || { color: "default", label: status };

  // Use custom colors for transfer statuses, fallback to MUI color
  const baseSx = config.customColors
    ? {
        backgroundColor: config.customColors.bg,
        color: config.customColors.text,
        fontWeight: 500,
      }
    : { fontWeight: 500 };

  return (
    <Chip
      label={config.label}
      color={config.customColors ? undefined : config.color}
      size={size}
      sx={{ ...baseSx, ...sx }}
    />
  );
}

// Named export alias for backward compatibility with existing imports
export { StatusChip as StockStatusChip };

export default StatusChip;
