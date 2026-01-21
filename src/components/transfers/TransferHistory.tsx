/**
 * Transfer history table component.
 * Displays transfer records with expandable audit details.
 */
import { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Box,
  Skeleton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import HistoryIcon from "@mui/icons-material/History";
import StatusChip from "@/components/common/StatusChip";
import type { EnrichedTransfer, TransferStatus } from "@/types/transfers";

interface TransferHistoryProps {
  readonly transfers: readonly EnrichedTransfer[];
  readonly loading?: boolean;
}

interface TransferRowProps {
  readonly transfer: EnrichedTransfer;
}

function TransferRow({ transfer }: TransferRowProps) {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="body2" fontWeight={500}>
            {transfer.referenceNumber}
          </Typography>
        </TableCell>
        <TableCell>{formatDate(transfer.createdAt)}</TableCell>
        <TableCell>
          <Typography variant="body2">{transfer.product.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {transfer.product.sku}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {transfer.fromWarehouse.code} → {transfer.toWarehouse.code}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight={500}>
            {transfer.quantity}
          </Typography>
        </TableCell>
        <TableCell>
          <StatusChip status={transfer.status as TransferStatus} />
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
                      <TableCell>{formatDate(transfer.completedAt)}</TableCell>
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
            <Skeleton width={60} />
          </TableCell>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function TransferHistory({
  transfers,
  loading = false,
}: TransferHistoryProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <HistoryIcon color="primary" />
        Transfer History
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }} />
              <TableCell>Reference</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Route</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <LoadingSkeleton />
            ) : transfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No transfers found. Create your first transfer above.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transfers.map((transfer) => (
                <TransferRow key={transfer.id} transfer={transfer} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
