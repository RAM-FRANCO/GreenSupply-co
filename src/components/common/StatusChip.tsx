/**
 * Reusable status chip component.
 * Maps status values to consistent colors across the app.
 */
import { Chip, type ChipProps } from "@mui/material";

type StatusType =
  | "completed"
  | "pending"
  | "cancelled"
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
  { color: ChipProps["color"]; label: string }
> = {
  completed: { color: "success", label: "Completed" },
  pending: { color: "warning", label: "Pending" },
  cancelled: { color: "error", label: "Cancelled" },
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
  const config = statusConfig[status] || { color: "default", label: status };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
}
