import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Typography, Box } from "@mui/material";
import type { InventoryItem } from "@/types/inventory";
import {
  ProductCell,
  CategoryCell,
} from "@/components/common/TableCells";
import StatusChip from "@/components/common/StatusChip";

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
}: UseInventoryColumnsOptions) => {
  return useMemo(
    () => [
      columnHelper.accessor("sku", {
        header: "Product",
        cell: (info) => (
          <ProductCell name={info.row.original.name} sku={info.getValue()} />
        ),
      }),
      // Previously name was separate, now merged into ProductCell above.
      // We can remove the separate Name column or keep it if SKU is separate.
      // The design shows Product (Name + SKU) as one column in Stock Page.
      // The Dashboard had SKU and Name separate.
      // Let's stick to the new standardized "Product" column which combines them.
      // Removing the separate Name column for consistency.

      // @ts-expect-error category is not a valid accessor
      columnHelper.accessor("category", {
        header: "Category",
        // @ts-expect-error category is not a valid accessor
        cell: (info) => <CategoryCell category={info.getValue()} />,
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
        cell: ({ row }) => (
          <StatusChip
            quantity={row.original.totalQuantity}
            reorderPoint={row.original.reorderPoint}
          />
        ),
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
