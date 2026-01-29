/**
 * Transfers page - Stock transfer management
 * Features form, history table, and activity timeline
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { Typography, Box, Button, Grid2 } from "@mui/material";
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
import PageHeader from "@/components/common/PageHeader";
import SuccessDialog from "@/components/common/SuccessDialog";
import { exportToPdf } from "@/utils/exportUtils";
import TransferExportDialog from "@/components/transfers/TransferExportDialog";
import { format, isWithinInterval } from "date-fns";

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
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);


  // Pagination state (controlled by parent for server-side pagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const fetchTransfers = useCallback(async (limit: number, offset: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/transfers?limit=${limit}&offset=${offset}`,
      );
      const data: PaginatedResponse<EnrichedTransfer> = await response.json();
      setTransfers(data.data);

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

  // Callback for form completion - reset to first page, refetch, and show toast
  const handleTransferComplete = useCallback((referenceNumber?: string) => {
    setPage(0);
    fetchTransfers(rowsPerPage, 0);
    setSuccessModal({
      open: true,
      message: referenceNumber 
        ? `Transfer ${referenceNumber} initiated successfully.` 
        : "Transfer initiated successfully.",
    });
  }, [fetchTransfers, rowsPerPage]);

  // Success Modal State
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });

  const handleSuccessModalClose = () => {
    setSuccessModal((prev) => ({ ...prev, open: false }));
  };

  const handleExportPDF = async (startDate: Date | null, endDate: Date | null) => {
    setExportLoading(true);
    try {
        const response = await fetch('/api/transfers?limit=10000&offset=0');
        const data: PaginatedResponse<EnrichedTransfer> = await response.json();
        let exportItems = data.data;

        if (startDate && endDate) {
            exportItems = exportItems.filter(item => {
                const date = new Date(item.createdAt);
                return isWithinInterval(date, { start: startDate, end: endDate });
            });
        }

        const exportRows = exportItems.map(t => ({
            Reference: t.referenceNumber,
            Product: t.product?.name,
            From: t.fromWarehouse?.name,
            To: t.toWarehouse?.name,
            Quantity: t.quantity,
            Status: t.status,
            Date: format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm')
        }));

        exportToPdf({
            title: 'Stock Transfers Report',
            columns: [
                { header: 'Reference', dataKey: 'Reference' },
                { header: 'Product', dataKey: 'Product' },
                { header: 'From', dataKey: 'From' },
                { header: 'To', dataKey: 'To' },
                { header: 'Quantity', dataKey: 'Quantity' },
                { header: 'Status', dataKey: 'Status' },
                { header: 'Date', dataKey: 'Date' },
            ],
            data: exportRows
        });

    } catch (e) {
        console.error(e);
        alert("Failed to export transfers");
    } finally {
        setExportLoading(false);
    }
  };

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
      {/* Page Header */}
      <PageHeader
        title="Stock Transfers"
        description="Manage inventory movement between warehouse locations."
      >
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ borderRadius: 2 }}
          onClick={() => setExportOpen(true)}
        >
          Export Data
        </Button>
      </PageHeader>

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
            hideHeader

            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
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
          />
        </Grid2>
      </Grid2>
      <SuccessDialog
        open={successModal.open}
        onClose={handleSuccessModalClose}
        title="Transfer Initiated"
        message={successModal.message}
        buttonText="Close"
      />
      
      <TransferExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExportPDF}
        loading={exportLoading}
      />
    </Box>
  );
}
