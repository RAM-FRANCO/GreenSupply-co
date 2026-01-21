import { useMemo } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import {
  Chip,
  Typography,
  Stack,
  Avatar,
  Box,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { ProductWithStock } from "../../types";
import { getCategoryColor } from "../../utils/themeUtils";
import StatusChip from "../../components/common/StatusChip";

const columnHelper = createColumnHelper<ProductWithStock>();

interface UseProductColumnsOptions {
  readonly onEdit: (id: number) => void;
  readonly onDelete: (id: number) => void;
}

/**
 * Returns column definitions for the Products table.
 * Used on the Products listing page.
 */
export const useProductColumns = ({
  onEdit,
  onDelete,
}: UseProductColumnsOptions): ColumnDef<ProductWithStock, any>[] => {
  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Product",
        cell: (info) => {
          const product = info.row.original;
          return (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                variant="rounded"
                src={`/images/products/${product.sku}.jpg`}
                sx={{ bgcolor: "grey.200", width: 48, height: 48 }}
              >
                {product.name[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ref: {product.sku}
                </Typography>
              </Box>
            </Stack>
          );
        },
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <Typography
            variant="body2"
            fontFamily="monospace"
            color="text.secondary"
          >
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => {
          const catColor = getCategoryColor(info.getValue());
          return (
            <Chip
              label={info.getValue()}
              size="small"
              sx={{
                bgcolor: catColor[50] as string,
                color: catColor[800] as string,
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          );
        },
      }),
      columnHelper.accessor("currentStock", {
        header: "Stock Level",
        cell: (info) => {
          const product = info.row.original;
          let statusType: "adequate" | "low" | "critical" = "adequate";
          if (product.stockStatus === "Low Stock") statusType = "low";
          if (product.stockStatus === "Out of Stock") statusType = "critical";

          return (
            <Box sx={{ width: 200 }}>
              <Box
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {info.getValue()} units
                </Typography>
                <StatusChip status={statusType} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={product.stockHealth}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    bgcolor:
                      product.stockStatus === "Low Stock"
                        ? "error.main"
                        : "success.main",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          );
        },
      }),
      columnHelper.accessor("unitCost", {
        header: "Unit Price",
        meta: { align: "right" },
        cell: (info) => (
          <Typography variant="body2" fontWeight={600}>
            ${info.getValue().toFixed(2)}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "center" },
        enableSorting: false,
        cell: ({ row }) => (
          <Stack direction="row" justifyContent="center" spacing={1}>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "primary.main" }}
              onClick={() => onEdit(row.original.id)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "error.main" }}
              onClick={() => onDelete(row.original.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      }),
    ],
    [onEdit, onDelete],
  );
};
