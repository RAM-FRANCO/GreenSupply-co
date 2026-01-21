import { useMemo } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { Chip, Typography, Box } from "@mui/material";
import type { InventoryItem } from "../../types/inventory";
import { customPalette } from "../../theme/theme";

const columnHelper = createColumnHelper<InventoryItem>();

interface UseInventoryColumnsOptions {
  readonly onEdit: (id: number) => void;
}

/**
 * Returns column definitions for the Inventory Overview table.
 * Used on the Dashboard page.
 */
export const useInventoryColumns = ({
  onEdit,
}: UseInventoryColumnsOptions): ColumnDef<InventoryItem, any>[] => {
  return useMemo(
    () => [
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <Typography variant="body2" fontWeight={500}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Product Name",
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor("totalQuantity", {
        header: "Total Stock",
        meta: { align: "right" },
        cell: (info) => {
          const row = info.row.original;
          return (
            <Typography
              variant="body2"
              fontWeight={row.isLowStock ? 600 : 400}
              color={row.isLowStock ? "error.main" : "text.secondary"}
            >
              {info.getValue()}
            </Typography>
          );
        },
      }),
      columnHelper.accessor("reorderPoint", {
        header: "Reorder Point",
        meta: { align: "right" },
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const isLow = row.original.isLowStock;
          return (
            <Chip
              label={isLow ? "Low Stock" : "In Stock"}
              size="small"
              sx={{
                fontWeight: 500,
                bgcolor: isLow
                  ? customPalette.status.lowStock.bg
                  : customPalette.status.inStock.bg,
                color: isLow
                  ? customPalette.status.lowStock.text
                  : customPalette.status.inStock.text,
                borderRadius: "16px",
                height: "22px",
              }}
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        enableSorting: false,
        cell: ({ row }) => (
          <Box
            component="button"
            type="button"
            onClick={() => onEdit(row.original.id)}
            sx={{
              color: "primary.main",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Edit
          </Box>
        ),
      }),
    ],
    [onEdit],
  );
};
