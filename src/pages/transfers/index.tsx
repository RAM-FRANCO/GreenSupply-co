/**
 * Transfers page - Stock transfer management
 */
import { useState, useEffect, useCallback } from "react";
import { Container, Typography, Box } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransferForm from "@/components/transfers/TransferForm";
import TransferHistory from "@/components/transfers/TransferHistory";
import type { EnrichedTransfer, PaginatedResponse } from "@/types/transfers";

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<EnrichedTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/transfers");
      const data: PaginatedResponse<EnrichedTransfer> = await response.json();
      setTransfers(data.data);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
          >
            <SwapHorizIcon fontSize="large" color="primary" />
            Stock Transfers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Move inventory between warehouses with full audit trail tracking.
          </Typography>
        </Box>

        <TransferForm onTransferComplete={fetchTransfers} />
        <TransferHistory transfers={transfers} loading={loading} />
      </Container>
    </DashboardLayout>
  );
}
