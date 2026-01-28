import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import type { EnrichedPurchaseOrder } from "@/hooks/useInventoryData";
import { format } from "date-fns";

interface PurchaseOrdersModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly orders: EnrichedPurchaseOrder[];
  readonly onReceive: (orderId: number) => Promise<void>;
}

export default function PurchaseOrdersModal({
  open,
  onClose,
  orders,
  onReceive,
}: PurchaseOrdersModalProps) {
  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="bold">
            Purchase Orders
          </Typography>
          <Chip label={`${pendingOrders.length} Pending`} color="primary" size="small" />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {pendingOrders.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No pending purchase orders.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>PO ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                       {/* Handle date formatting safely */}
                       {order.orderDate ? format(new Date(order.orderDate), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {order.product?.name || `Product #${order.productId}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.product?.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.warehouse?.name || `Warehouse #${order.warehouseId}`}</TableCell>
                    <TableCell align="right">{order.quantity}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onReceive(order.id)}
                      >
                        Receive
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
