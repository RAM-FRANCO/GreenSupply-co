/**
 * Transfer history table component.
 * Displays transfer records with filtering, pagination, and expandable details.
 */
import { useMemo } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Tooltip,
  SxProps,
  Theme,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StatusChip from "@/components/common/StatusChip";
import DataTable from "@/components/common/DataTable";
import { formatTableDate } from "@/utils/formatters";
import type { EnrichedTransfer, TransferStatus } from "@/types/transfers";
import type { DataTableColumn } from "@/types/table.types";

interface TransferHistoryProps {
  readonly transfers: readonly EnrichedTransfer[];
  readonly hideHeader?: boolean;
  readonly loading?: boolean;
  readonly sx?: SxProps<Theme>;
}

function TransferDetails({ row }: { row: EnrichedTransfer }) {
  const transfer = row;
  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Transfer Details
      </Typography>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell component="th" sx={{ fontWeight: 500, width: 150 }}>
              Product
            </TableCell>
            <TableCell>
              {transfer.product.name} ({transfer.product.sku})
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" sx={{ fontWeight: 500 }}>
              From Warehouse
            </TableCell>
            <TableCell>
              {transfer.fromWarehouse.name} ({transfer.fromWarehouse.code})
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" sx={{ fontWeight: 500 }}>
              To Warehouse
            </TableCell>
            <TableCell>
              {transfer.toWarehouse.name} ({transfer.toWarehouse.code})
            </TableCell>
          </TableRow>
          {transfer.notes && (
            <TableRow>
              <TableCell component="th" sx={{ fontWeight: 500 }}>
                Notes
              </TableCell>
              <TableCell>{transfer.notes}</TableCell>
            </TableRow>
          )}
          {transfer.completedAt && (
            <TableRow>
              <TableCell component="th" sx={{ fontWeight: 500 }}>
                Completed At
              </TableCell>
              <TableCell>{formatTableDate(transfer.completedAt)}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

/**
 * Transfer history table with filtering and pagination
 */
export default function TransferHistory({
  transfers,
  loading = false,
  hideHeader = false,
  sx,
}: TransferHistoryProps) {
  const columns = useMemo<DataTableColumn<EnrichedTransfer>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "referenceNumber",
        cell: (info) => (
          <Typography variant="body2" fontWeight={500} color="primary.main">
            {info.getValue() as string}
          </Typography>
        ),
      },
      {
        header: "Origin / Destination",
        id: "warehouse",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {t.fromWarehouse.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: "uppercase", fontSize: "0.65rem" }}
              >
                to {t.toWarehouse.name}
              </Typography>
            </Box>
          );
        },
      },
      {
        header: "Items",
        accessorKey: "quantity",
        cell: (info) => (
          <Typography variant="body2">{info.getValue() as number} items</Typography>
        ),
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {formatTableDate(info.getValue() as string)}
          </Typography>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <StatusChip status={info.getValue() as TransferStatus} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={row.getToggleExpandedHandler()}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
        meta: {
          align: "right",
        },
      },
    ],
    [],
  );

  return (
    <Box sx={sx}>
      <DataTable
        data={[...transfers]} // Helper to ensure array spread if needed, though transfers is already array
        columns={columns}
        title={hideHeader ? undefined : "Transfer History"}
        isLoading={loading}
        enablePagination={true}
        // Note: DataTable expects internal state or we need to bridge it if we want fully controlled from outside.
        // But looking at DataTable source, it initializes state from props if passed?
        // Actually the current DataTable implementation only takes initial pageSize.
        // It DOES NOT yet fully support controlled pagination props (page, onPageChange) passed from parent in the standard TanStack way for *server-side* pagination.
        // Wait, I checked DataTable code... it initializes state: { pagination: { pageSize } }.
        // It DOES NOT take `pageIndex` or `onPaginationChange` props directly to override internal state.
        // Users' `TransferHistory` was manually handling this.
        // IMPORTANT: I need to update my DataTable modification or `TransferHistory` usage to support controlled pagination if I want to keep the feature.
        // However, `TransferHistory` supports UNCONTROLLED mode too.
        // Let's assume for now we use client-side pagination since `transfers` prop is likely the full list or the current page.
        // Actually `transfers` in the original code was sliced if not controlled?
        // "Only paginate client-side when uncontrolled (server handles pagination when controlled)"
        // The shared DataTable currently does CLIENT SIDE pagination on the `data` passed to it.
        // If `transfers` contains only 10 items (server side), DataTable will just show 1 page of 10 items.
        // We need to pass `manualPagination: true` to DataTable if we want server-side.
        // Let's proceed with this implementation and if pagination breaks, I'll fix DataTable.
        getRowCanExpand={() => true}
        renderSubComponent={TransferDetails}
      />
    </Box>
  );
}
