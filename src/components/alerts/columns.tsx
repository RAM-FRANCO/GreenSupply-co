import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Typography, Button, Chip } from "@mui/material";
import {
  ProductCell,
//   CategoryCell,
} from "@/components/common/TableCells";
import { StockStatusChip } from "@/components/common/StatusChip";
import AlertActionMenu from "@/components/alerts/AlertActionMenu";
import type { AlertStatusUpdate } from "@/schemas/alertSchema";
import type { EnrichedStock } from "@/hooks/useInventoryData";
import { getStockStatus } from "@/utils/stockUtils";

interface UseAlertsColumnsOptions {
    updateAlertStatus: (id: number, status: AlertStatusUpdate) => Promise<void>;
    setSelectedForReorder: (item: EnrichedStock) => void;
}

export const useAlertsColumns = ({
    updateAlertStatus,
    setSelectedForReorder
}: UseAlertsColumnsOptions) => {
    return useMemo<ColumnDef<EnrichedStock>[]>(
        () => [
            {
                header: "Product",
                accessorFn: (row) => row.product?.name,
                cell: ({ row }) => (
                    <ProductCell
                        name={row.original.product?.name}
                        sku={row.original.product?.sku}
                    />
                ),
            },
            // {
            //     header: "Category",
            //     accessorFn: (row) => row.product?.categoryName,
            //     cell: ({ row }) => (
            //         <CategoryCell category={row.original.product?.categoryName} />
            //     ),
            // },
            {
                header: "Current Stock",
                accessorKey: "quantity",
                meta: { align: "right" },
                cell: ({ row }) => (
                    <Typography variant="body2" fontWeight="bold">
                        {row.original.quantity}
                    </Typography>
                ),
            },
            {
                header: "Reorder Point",
                accessorFn: (row) => row.product?.reorderPoint,
                meta: { align: "right" },
            },
            {
                header: "Shortage/Surplus",
                id: "shortage",
                meta: { align: "right" },
                cell: ({ row }) => {
                    if (!row.original.product) return null;
                    const diff =
                        row.original.quantity - row.original.product.reorderPoint;
                    const isCritical = diff < 0;
                    return (
                        <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={isCritical ? "error.main" : "success.main"}
                        >
                            {diff > 0 ? "+" : ""}
                            {diff}
                        </Typography>
                    );
                },
            },
            {
                header: "Status",
                id: "status",
                meta: { align: "center" },
                cell: ({ row }) => {
                    if (!row.original.product) return null;
                    return (
                        <StockStatusChip
                            quantity={row.original.quantity}
                            reorderPoint={row.original.product.reorderPoint}
                        />
                    );
                },
            },
            {
                header: "Alert Status",
                id: "alertStatus",
                meta: { align: "center" },
                cell: ({ row }) => {
                    if (!row.original.alertStatus) {
                        return (
                            <Typography variant="caption" color="text.disabled">
                                -
                            </Typography>
                        );
                    }
                    const statusColors: Record<
                        string,
                        "default" | "primary" | "secondary" | "warning" | "success"
                    > = {
                        active: "warning",
                        acknowledged: "secondary",
                        snoozed: "default",
                        resolved: "success",
                    };
                    return (
                        <Chip
                            label={row.original.alertStatus}
                            size="small"
                            color={statusColors[row.original.alertStatus] || "default"}
                            variant={
                                row.original.alertStatus === "active" ? "filled" : "outlined"
                            }
                        />
                    );
                },
            },
            {
                id: "actions",
                meta: { align: "right" },
                cell: ({ row }) => {
                    const isLow =
                        row.original.product &&
                        getStockStatus(
                            row.original.quantity,
                            row.original.product.reorderPoint,
                        ) === "critical-low";
                    if (isLow && row.original.product) {

                        return (
                            <Button
                                size="small"
                                variant="contained"
                                color="error"
                                sx={{ textTransform: "none", fontSize: "0.75rem" }}
                                onClick={() => setSelectedForReorder(row.original)}
                            >
                                Quick Reorder
                            </Button>
                        );
                    }
                    return (
                        <AlertActionMenu
                            onUpdate={(update) => updateAlertStatus(row.original.id, update)}
                        />
                    );
                },
            },
        ],
        [updateAlertStatus, setSelectedForReorder],
    );
};
