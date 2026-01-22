/**
 * Transfers page - Stock transfer management
 * Features form, history table, and activity timeline
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Typography, Box, Button, Grid2, Tooltip } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DownloadIcon from "@mui/icons-material/Download";
import TransferForm from "@/components/transfers/TransferForm";
import TransferHistory from "@/components/transfers/TransferHistory";
import RecentActivity from "@/components/transfers/RecentActivity";
import type {
  EnrichedTransfer,
  PaginatedResponse,
  ActivityEvent,
  ActivityEventType,
} from "@/types/transfers";

/** Maximum activity events to display in sidebar timeline */
const MAX_ACTIVITY_EVENTS = 5;

/** Default pagination settings */
const DEFAULT_ROWS_PER_PAGE = 10;

/**
 * Convert transfers to activity events for timeline display
 */
function createActivityEvents(
  transfers: readonly EnrichedTransfer[],
): ActivityEvent[] {
  return transfers.slice(0, MAX_ACTIVITY_EVENTS).map((transfer) => {
    const getEventData = (): {
      type: ActivityEventType;
      description: string;
    } => {
      if (transfer.status === "completed") {
        return {
          type: "completed",
          description: `items verified and received in ${transfer.toWarehouse.name}.`,
        };
      }
      if (transfer.status === "pending") {
        return {
          type: "pending",
          description: `awaiting approval for ${transfer.product.name}.`,
        };
      }
      return {
        type: "dispatched",
        description: `left ${transfer.fromWarehouse.name}.`,
      };
    };

    const { type, description } = getEventData();

    return {
      id: transfer.id,
      type,
      referenceNumber: transfer.referenceNumber,
      description,
      timestamp: transfer.completedAt || transfer.createdAt,
    };
  });
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<EnrichedTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Pagination state (controlled by parent for server-side pagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const fetchTransfers = useCallback(async (limit: number, offset: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/transfers?limit=${limit}&offset=${offset}`,
      );
      const data: PaginatedResponse<EnrichedTransfer> = await response.json();
      setTransfers(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when pagination changes
  useEffect(() => {
    fetchTransfers(rowsPerPage, page * rowsPerPage);
  }, [fetchTransfers, page, rowsPerPage]);

  // Callback for form completion - reset to first page and refetch
  const handleTransferComplete = useCallback(() => {
    setPage(0);
    fetchTransfers(rowsPerPage, 0);
  }, [fetchTransfers, rowsPerPage]);

  // Callback for rows per page change - reset to first page
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  // Generate activity events from transfers
  const activityEvents = useMemo(
    () => createActivityEvents(transfers),
    [transfers],
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        pb: { xs: 8, md: 10 },
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* Page Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            <SwapHorizIcon fontSize="large" color="primary" />
            Stock Transfers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage inventory movement between warehouse locations.
          </Typography>
        </Box>

        <Tooltip title="Coming soon">
          <span>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled
              sx={{ borderRadius: 2 }}
            >
              Export Data
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Transfer Wizard Section */}
      <Box sx={{ mb: 5 }}>
        <TransferForm onTransferComplete={handleTransferComplete} />
      </Box>

      {/* History and Activity - Side by Side */}
      <Grid2 container spacing={3} alignItems="stretch">
        {/* Transfer History - takes more space */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Transfer History
            </Typography>
          </Box>
          <TransferHistory
            transfers={transfers}
            loading={loading}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            hideHeader
            maxHeight={450}
          />
        </Grid2>

        {/* Recent Activity - sidebar */}
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Recent Activity
            </Typography>
          </Box>
          <RecentActivity
            events={activityEvents}
            loading={loading}
            hideHeader
            maxHeight={450}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}
