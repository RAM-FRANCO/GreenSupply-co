/**
 * Reusable status chip component.
 * Maps status values to consistent colors across the app.
 */
import { Chip, type ChipProps } from "@mui/material";
import { customPalette } from "@/theme/theme";

type StatusType =
  | "completed"
  | "pending"
  | "cancelled"
  | "in-transit"
  | "low"
  | "critical"
  | "adequate"
  | "overstocked";

interface StatusChipProps {
  readonly status: StatusType;
  readonly size?: ChipProps["size"];
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
};

/**
 * Status badge with consistent color mapping
 */
export default function StatusChip({
  status,
  size = "small",
}: StatusChipProps) {
  if (process.env.NODE_ENV === "development" && !(status in statusConfig)) {
    console.warn(`StatusChip: Unexpected status "${status}"`);
  }
  const config = statusConfig[status] || { color: "default", label: status };

  // Use custom colors for transfer statuses, fallback to MUI color
  const customSx = config.customColors
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
      sx={customSx}
    />
  );
}
