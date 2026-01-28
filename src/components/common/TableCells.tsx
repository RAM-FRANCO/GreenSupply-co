import { Box, Typography, Chip } from "@mui/material";
import { getCategoryColor } from "@/utils/themeUtils";

interface ProductCellProps {
  readonly name?: string;
  readonly sku?: string;
}

export const ProductCell = ({ name, sku }: ProductCellProps) => {
  if (!name) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          bgcolor: "action.hover",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 2,
        }}
      >
        <Box
          component="span"
          className="material-icons-round"
          sx={{ color: "text.secondary" }}
        >
          category
        </Box>
      </Box>
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {name}
        </Typography>
        {sku && (
          <Typography variant="caption" color="text.secondary">
            SKU: {sku}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

interface CategoryCellProps {
  readonly category?: string;
}

/**
 * Renders a category as a styled Chip with consistent colors.
 * Uses getCategoryColor() for dynamic color assignment.
 */
export const CategoryCell = ({ category }: CategoryCellProps) => {
  if (!category) return null;
  const catColor = getCategoryColor(category);

  return (
    <Chip
      label={category}
      size="small"
      sx={{
        bgcolor: catColor[50] as string,
        color: catColor[800] as string,
        fontWeight: 600,
        fontSize: "0.75rem",
      }}
    />
  );
};



import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import type { StatusType } from "./StatusChip";

interface SeverityCellProps {
  readonly severity: "critical" | "warning" | "info";
}

/**
 * Renders a severity badge with icon for alert tables.
 */
export const SeverityCell = ({ severity }: SeverityCellProps) => {
  const config = {
    critical: {
      icon: ErrorIcon,
      color: "error.main",
      status: "critical" as StatusType,
    },
    warning: {
      icon: WarningIcon,
      color: "warning.main",
      status: "low" as StatusType,
    },
    info: {
      icon: InfoIcon,
      color: "info.main",
      status: "adequate" as StatusType,
    }, // Fallback to adequate/info
  };

  const { icon: Icon, color } = config[severity];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Icon sx={{ color, fontSize: 18 }} />
    </Box>
  );
};


