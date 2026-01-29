import {
  readJsonFile,
  writeJsonFile,
  getCurrentTimestamp,
} from './dataService';
import type { Stock } from '@/types/inventory';
import type { AlertRecord } from '@/types/alerts';
import type { PurchaseOrder } from '@/types/purchaseOrder';
import { updateAlertStatus } from './alertService';

const STOCK_FILE = 'stock.json';
const ALERTS_FILE = 'alerts.json';
const ORDERS_FILE = 'purchase_orders.json';

/**
 * Get all purchase orders
 */
export const getPurchaseOrders = (): PurchaseOrder[] => {
  return readJsonFile<PurchaseOrder>(ORDERS_FILE);
};

/**
 * Create a new purchase order
 */
export const createPurchaseOrder = (
  productId: number,
  warehouseId: number,
  quantity: number
): { success: boolean; orderId: number } => {
  if (quantity <= 0) throw new Error('Quantity must be positive');

  const orders = readJsonFile<PurchaseOrder>(ORDERS_FILE);
  const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;

  const newOrder: PurchaseOrder = {
    id: newId,
    productId,
    warehouseId,
    quantity,
    status: 'pending',
    orderDate: getCurrentTimestamp(),
  };

  orders.push(newOrder);
  writeJsonFile(ORDERS_FILE, orders);

  return { success: true, orderId: newId };
};

/**
 * Receive a purchase order (finalize stock update)
 */
export const receivePurchaseOrder = (
  orderId: number
): { success: boolean; newStock: number } => {
  const orders = readJsonFile<PurchaseOrder>(ORDERS_FILE);
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) throw new Error('Order not found');
  const order = orders[orderIndex];

  if (order.status !== 'pending') {
    throw new Error(`Order is already ${order.status}`);
  }

  // 1. Update Stock
  const stockItems = readJsonFile<Stock>(STOCK_FILE);
  const stockIndex = stockItems.findIndex(
    (s) => s.productId === order.productId && s.warehouseId === order.warehouseId
  );

  let finalStockQty = 0;

  if (stockIndex === -1) {
    // Create new stock entry
    const newId = stockItems.length > 0 ? Math.max(...stockItems.map(s => s.id)) + 1 : 1;
    const newStockItem: Stock = {
      id: newId,
      productId: order.productId,
      warehouseId: order.warehouseId,
      quantity: order.quantity
    };
    stockItems.push(newStockItem);
    finalStockQty = order.quantity;
  } else {
    stockItems[stockIndex].quantity += order.quantity;
    finalStockQty = stockItems[stockIndex].quantity;
  }

  writeJsonFile(STOCK_FILE, stockItems);

  // 2. Update Order Status
  orders[orderIndex] = {
    ...order,
    status: 'received',
    receivedDate: getCurrentTimestamp(),
  };
  writeJsonFile(ORDERS_FILE, orders);

  // 3. Resolve associated alert if it exists
  const alerts = readJsonFile<AlertRecord>(ALERTS_FILE);
  const alertIndex = alerts.findIndex(
    (a) => a.productId === order.productId && a.warehouseId === order.warehouseId
  );

  if (alertIndex !== -1) {
    // Only resolve if stock is now above threshold? 
    // For simplicity, we resolve it as "action taken" but realistically we should check levels.
    // The previous logic resolved it on reorder, so we keep that behavior or improve it.
    // Let's mark it resolved because stock HAS increased now.
    alerts[alertIndex] = {
      ...alerts[alertIndex],
      status: 'resolved',
      updatedAt: getCurrentTimestamp(),
      resolvedAt: getCurrentTimestamp(),
      notes: alerts[alertIndex].notes
        ? `${alerts[alertIndex].notes}\nSystem: Received PO #${order.id} (+${order.quantity} units)`
        : `System: Received PO #${order.id} (+${order.quantity} units)`
    };
    writeJsonFile(ALERTS_FILE, alerts);
  }

  return {
    success: true,
    newStock: finalStockQty
  };
};

/**
 * Backward compatibility wrapper: now creates a PO instead of instant update
 */
export const reorderStock = (
  productId: number,
  warehouseId: number,
  quantity: number
): { success: boolean; message: string } => {
  const result = createPurchaseOrder(productId, warehouseId, quantity);

  // Implicitly acknowledge the alert if one exists
  try {
    // We update the status to 'acknowledged' so it stops showing as "unread" in the notification menu
    updateAlertStatus(productId, warehouseId, { status: 'acknowledged' });
  } catch (e) {
    console.error("Failed to auto-acknowledge alert", e);
  }

  return {
    success: result.success,
    message: "Purchase Order Created (Pending)"
  };
};
