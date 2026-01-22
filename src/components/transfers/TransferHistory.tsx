/**
 * Transfer history table component.
 * Displays transfer records with filtering, pagination, and expandable details.
 */
import { useState, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Collapse,
  Box,
  Skeleton,
  Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import HistoryIcon from "@mui/icons-material/History";

import VisibilityIcon from "@mui/icons-material/Visibility";
import StatusChip from "@/components/common/StatusChip";
import { formatTableDate } from "@/utils/formatters";
import type { EnrichedTransfer, TransferStatus } from "@/types/transfers";

interface TransferHistoryProps {
  readonly transfers: readonly EnrichedTransfer[];
  readonly loading?: boolean;
  readonly total?: number;
  readonly hideHeader?: boolean;
  readonly maxHeight?: number | string;
  /** Controlled pagination props */
  readonly page?: number;
  readonly rowsPerPage?: number;
  readonly onPageChange?: (page: number) => void;
  readonly onRowsPerPageChange?: (rowsPerPage: number) => void;
}

interface TransferRowProps {
  readonly transfer: EnrichedTransfer;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25] as const;

/** Shared styles for table header cells */
const TABLE_HEADER_SX = {
  fontWeight: 600,
  textTransform: "uppercase",
  fontSize: "0.75rem",
  color: "text.secondary",
} as const;

function TransferRow({ transfer }: TransferRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          "&:hover": { backgroundColor: "action.hover" },
          transition: "background-color 0.15s ease-in-out",
        }}
      >
        <TableCell sx={{ width: 48 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="body2" fontWeight={500} color="primary.main">
            {transfer.referenceNumber}
          </Typography>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {transfer.fromWarehouse.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", fontSize: "0.65rem" }}
            >
              to {transfer.toWarehouse.name}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{transfer.quantity} items</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {formatTableDate(transfer.createdAt)}
          </Typography>
        </TableCell>
        <TableCell>
          <StatusChip status={transfer.status as TransferStatus} />
        </TableCell>
        <TableCell align="right">
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Transfer Details
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell
                      component="th"
                      sx={{ fontWeight: 500, width: 150 }}
                    >
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
                      {transfer.fromWarehouse.name} (
                      {transfer.fromWarehouse.code})
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
                      <TableCell>
                        {formatTableDate(transfer.completedAt)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton width={40} />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
            <Skeleton width={40} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/**
 * Transfer history table with filtering and pagination
 */
export default function TransferHistory({
  transfers,
  loading = false,
  total,
  hideHeader = false,
  maxHeight = 400,
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TransferHistoryProps) {
  // Internal state for uncontrolled mode
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10);

  // Determine if controlled or uncontrolled
  const isControlled =
    controlledPage !== undefined && onPageChange !== undefined;
  const page = isControlled ? controlledPage : internalPage;
  const rowsPerPage = controlledRowsPerPage ?? internalRowsPerPage;

  // Warn if props are partially controlled
  if (process.env.NODE_ENV === "development") {
    const hasPage = controlledPage !== undefined;
    const hasCallback = onPageChange !== undefined;
    if (hasPage !== hasCallback) {
      console.warn(
        "TransferHistory: `page` and `onPageChange` should be provided together for controlled mode",
      );
    }
  }

  const handleChangePage = useCallback(
    (_event: unknown, newPage: number) => {
      if (isControlled) {
        onPageChange(newPage);
      } else {
        setInternalPage(newPage);
      }
    },
    [isControlled, onPageChange],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = Number.parseInt(event.target.value, 10);
      if (onRowsPerPageChange) {
        onRowsPerPageChange(newRowsPerPage);
      } else {
        setInternalRowsPerPage(newRowsPerPage);
        setInternalPage(0);
      }
    },
    [onRowsPerPageChange],
  );

  // Only paginate client-side when uncontrolled (server handles pagination when controlled)
  const displayedTransfers = useMemo(() => {
    if (isControlled) return transfers; // Already paginated by server
    const start = page * rowsPerPage;
    return transfers.slice(start, start + rowsPerPage);
  }, [isControlled, transfers, page, rowsPerPage]);

  const displayTotal = total ?? transfers.length;

  return (
    <Paper
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      elevation={0}
    >
      {/* Header with controls */}
      {!hideHeader && (
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <HistoryIcon color="primary" fontSize="small" />
            Transfer History
          </Typography>
        </Box>
      )}

      <TableContainer sx={{ maxHeight, flex: 1 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell sx={{ width: 50 }} />
              <TableCell sx={TABLE_HEADER_SX}>ID</TableCell>
              <TableCell sx={TABLE_HEADER_SX}>Origin / Destination</TableCell>
              <TableCell sx={TABLE_HEADER_SX}>Items</TableCell>
              <TableCell sx={TABLE_HEADER_SX}>Date</TableCell>
              <TableCell sx={TABLE_HEADER_SX}>Status</TableCell>
              <TableCell sx={{ width: 50 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <LoadingSkeleton />
            ) : displayedTransfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No transfers found. Create your first transfer above.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedTransfers.map((transfer) => (
                <TransferRow key={transfer.id} transfer={transfer} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={displayTotal}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[...ROWS_PER_PAGE_OPTIONS]}
        sx={{
          mt: "auto",
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "grey.50",
        }}
      />
    </Paper>
  );
}
