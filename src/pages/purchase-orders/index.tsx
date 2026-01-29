import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { createColumnHelper } from '@tanstack/react-table';

import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import CreatePurchaseOrderModal from '@/components/purchase-orders/CreatePurchaseOrderModal';
import { useInventoryData } from '@/hooks/useInventoryData';
import { exportToPdf } from '@/utils/exportUtils';
import type { EnrichedPurchaseOrder } from '@/hooks/useInventoryData';
import PurchaseOrderExportDialog, { ExportDateRange } from '@/components/purchase-orders/PurchaseOrderExportDialog';
import { subDays, isWithinInterval, startOfDay, endOfDay, subWeeks, subMonths } from 'date-fns';

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    products,
    warehouses,
    loading,
    error,
    receiveOrder,
    createPurchaseOrder,
    refetch,
  } = useInventoryData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Column Definition
  const columnHelper = createColumnHelper<EnrichedPurchaseOrder>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'PO ID',
        cell: (info) => `#${info.getValue()}`,
      }),
      columnHelper.accessor('orderDate', {
        header: 'Date',
        cell: (info) =>
          info.getValue() ? format(new Date(info.getValue()), 'MMM d, yyyy') : '-',
      }),
      columnHelper.accessor('product', {
        header: 'Product',
        cell: (info) => {
          const product = info.getValue();
          return (
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {product?.name || `Product #${info.row.original.productId}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {product?.sku}
              </Typography>
            </Box>
          );
        },
      }),
      columnHelper.accessor('warehouse', {
        header: 'Warehouse',
        cell: (info) =>
          info.getValue()?.name || `Warehouse #${info.row.original.warehouseId}`,
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        meta: { align: 'right' },
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          let color: 'default' | 'primary' | 'success' | 'warning' = 'default';
          if (status === 'pending') color = 'warning';
          if (status === 'received') color = 'success';
          if (status === 'cancelled') color = 'default';

          return (
            <Chip
              label={status.toUpperCase()}
              color={color}
              size="small"
              variant={status === 'pending' ? 'filled' : 'outlined'}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Action',
        meta: { align: 'right' },
        cell: (info) => {
            const order = info.row.original;
            if (order.status !== 'pending') return null;
            
            return (
                 <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => receiveOrder(order.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    Receive
                  </Button>
            );
        }
      }),
    ],
    [receiveOrder]
  );

  const handleCreateOrder = async (
    productId: number,
    warehouseId: number,
    quantity: number
  ) => {
    setCreateLoading(true);
    try {
      await createPurchaseOrder(productId, warehouseId, quantity); 
      setCreateModalOpen(false);
      await refetch();
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Failed to create order');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleExport = async (range: ExportDateRange, customStart?: string, customEnd?: string) => {
    setExportLoading(true);
    try {
        let filteredOrders = [...purchaseOrders];
        const now = new Date();

        if (range !== 'all') {
            filteredOrders = filteredOrders.filter(order => {
                if (!order.orderDate) return false;
                const orderDate = new Date(order.orderDate);
                
                switch (range) {
                    case '1d':
                        return orderDate >= subDays(now, 1);
                    case '3d':
                        return orderDate >= subDays(now, 3);
                    case '1w':
                        return orderDate >= subWeeks(now, 1);
                    case '1m':
                        return orderDate >= subMonths(now, 1);
                    case 'custom':
                        if (customStart && customEnd) {
                            return isWithinInterval(orderDate, {
                                start: startOfDay(new Date(customStart)),
                                end: endOfDay(new Date(customEnd))
                            });
                        }
                        return true;
                    default:
                        return true;
                }
            });
        }

        const data = filteredOrders.map((order) => ({
        ID: order.id,
        Date: order.orderDate ? format(new Date(order.orderDate), 'yyyy-MM-dd') : '-',
        Product: order.product?.name || order.productId,
        Warehouse: order.warehouse?.name || order.warehouseId,
        Quantity: order.quantity,
        Status: order.status,
        }));

        exportToPdf({
        title: `Purchase Orders Report (${range === 'all' ? 'All Time' : range})`,
        columns: [
            { header: 'ID', dataKey: 'ID' },
            { header: 'Date', dataKey: 'Date' },
            { header: 'Product', dataKey: 'Product' },
            { header: 'Warehouse', dataKey: 'Warehouse' },
            { header: 'Quantity', dataKey: 'Quantity' },
            { header: 'Status', dataKey: 'Status' },
        ],
        data,
        filename: `purchase_orders_${format(new Date(), 'yyyyMMdd')}.pdf`,
        });
    } catch (error) {
        console.error("Export failed", error);
    } finally {
        setExportLoading(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <PageHeader
        title="Purchase Orders"
        description="Manage your purchase orders and incoming stock."
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Purchase Order
          </Button>
        </Stack>
      </PageHeader>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", overflow: "hidden" }}>
        {error && (
             <Box p={2} bgcolor="error.light" color="error.contrastText">
                <Typography>Error loading orders: {error}</Typography>
            </Box>
        )}
        <DataTable
            columns={columns}
            data={purchaseOrders}
            enablePagination
            title="Overview"
            isLoading={loading}
            pageSize={10}
            // For client-side pagination with DataTable, we just pass data and it handles it
            // if we don't pass manualPagination props.
            // useInventoryData returns all data, so client-side pagination is fine.
            emptyMessage="No purchase orders found."
        />
      </Paper>

      <CreatePurchaseOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={handleCreateOrder}
        products={products}
        warehouses={warehouses}
        loading={createLoading}
      />
      <PurchaseOrderExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        loading={exportLoading}
      />
    </Box>
  );
}
