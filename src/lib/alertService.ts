/**
 * Alert service - business logic for low stock alerts.
 * Alerts are derived from live stock data + persisted tracking status.
 */
import type {
  AlertRecord,
  EnrichedAlert,
  AlertStatus,
  AlertSeverity,
  AlertStatusUpdate,
} from '@/types/alerts';
import type { Product, Stock, Warehouse } from '@/types/inventory';
import {
  readJsonFile,
  writeJsonFile,
  getNextId,
  getCurrentTimestamp,
} from './dataService';
import { getStockStatus, StockStatusType } from '@/utils/stockUtils';

// File names
const ALERTS_FILE = 'alerts.json';
const STOCK_FILE = 'stock.json';
const PRODUCTS_FILE = 'products.json';
const WAREHOUSES_FILE = 'warehouses.json';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate severity based on stock status
 */
const getSeverity = (status: StockStatusType): AlertSeverity => {
  switch (status) {
    case 'critical-low':
      return 'critical';
    case 'low-stock':
      return 'warning';
    case 'overstocked':
      return 'info';
    default:
      return 'info';
  }
};

/**
 * Economic Order Quantity (EOQ) placeholder
 * For now, simple logic: target = reorderPoint * 2
 */
const calculateRecommendedQuantity = (
  currentStock: number,
  reorderPoint: number
): number => {
  const targetStock = reorderPoint * 2;
  return Math.max(0, targetStock - currentStock);
};

// ============================================================================
// Core Logic
// ============================================================================

/**
 * Generate all active alerts by scanning current stock levels.
 * Merges with persisted tracking data (acknowledged, snoozed, etc.)
 */
export const queryAlerts = (filters: {
  severity?: AlertSeverity;
  status?: AlertStatus;
  warehouseId?: number;
} = {}): EnrichedAlert[] => {
  const stock = readJsonFile<Stock>(STOCK_FILE);
  const products = readJsonFile<Product>(PRODUCTS_FILE);
  const warehouses = readJsonFile<Warehouse>(WAREHOUSES_FILE);
  const alertRecords = readJsonFile<AlertRecord>(ALERTS_FILE);

  return stock.reduce<EnrichedAlert[]>((acc, item) => {
    const product = products.find((p) => p.id === item.productId);
    const warehouse = warehouses.find((w) => w.id === item.warehouseId);

    if (!product || !warehouse) return acc;
    if (filters.warehouseId && filters.warehouseId !== item.warehouseId) return acc;

    const stockStatus = getStockStatus(item.quantity, product.reorderPoint);
    if (stockStatus === 'healthy') return acc;

    const severity = getSeverity(stockStatus);
    if (filters.severity && filters.severity !== severity) return acc;

    const record = alertRecords.find(
      (r) => r.productId === item.productId && r.warehouseId === item.warehouseId
    );

    // Determine effective status
    let status: AlertStatus = record ? record.status : 'active';
    if (status === 'snoozed' && record?.snoozedUntil) {
      if (new Date(record.snoozedUntil) <= new Date()) {
        status = 'active';
      }
    }

    if (filters.status && filters.status !== status) return acc;

    acc.push({
      id: record?.id ?? 0,
      status,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
      },
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
      },
      currentStock: item.quantity,
      reorderPoint: product.reorderPoint,
      shortage: product.reorderPoint - item.quantity,
      severity,
      recommendedQuantity: calculateRecommendedQuantity(item.quantity, product.reorderPoint),
      timestamp: record?.createdAt ?? getCurrentTimestamp(),
      createdAt: record?.createdAt ?? getCurrentTimestamp(),
      updatedAt: record?.updatedAt ?? getCurrentTimestamp(),
      ...(record?.acknowledgedAt && { acknowledgedAt: record.acknowledgedAt }),
      ...(record?.snoozedUntil && { snoozedUntil: record.snoozedUntil }),
      ...(record?.notes && { notes: record.notes }),
    });

    return acc;
  }, []);
};

/**
 * Get aggregated stats for dashboard/alerts page
 */
export const getAlertStats = () => {
  const alerts = queryAlerts();

  return {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    overstocked: alerts.filter(a => a.shortage < 0).length, // Negative shortage = surplus
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    snoozed: alerts.filter(a => a.status === 'snoozed').length,
  };
};

/**
 * Get a single alert by ID (for API access)
 * Since IDs are only assigned to tracked alerts, untracked ones can't be fetched by ID easily.
 * This is primarily for updating existing records.
 */
export const getAlertById = (id: number): AlertRecord | undefined => {
  const records = readJsonFile<AlertRecord>(ALERTS_FILE);
  return records.find(r => r.id === id);
};

/**
 * Create or Update alert tracking status
 * Used when user Acknowledges or Snoozes an alert
 */
export const updateAlertStatus = (
  productId: number,
  warehouseId: number,
  update: AlertStatusUpdate
): AlertRecord => {
  const records = readJsonFile<AlertRecord>(ALERTS_FILE);
  const timestamp = getCurrentTimestamp();

  const index = records.findIndex(
    (r) => r.productId === productId && r.warehouseId === warehouseId
  );

  let record: AlertRecord;

  if (index !== -1) {
    // Update existing record
    records[index] = {
      ...records[index],
      status: update.status,
      updatedAt: timestamp,
      snoozedUntil: update.snoozeUntil ?? records[index].snoozedUntil,
      notes: update.notes ?? records[index].notes,
      ...(update.status === 'acknowledged' && { acknowledgedAt: timestamp }),
      ...(update.status === 'resolved' && { resolvedAt: timestamp }),
    };
    record = records[index];
  } else {
    // Create new tracking record
    record = {
      id: getNextId(records),
      productId,
      warehouseId,
      status: update.status,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(update.notes && { notes: update.notes }),
      ...(update.snoozeUntil && { snoozedUntil: update.snoozeUntil }),
      ...(update.status === 'acknowledged' && { acknowledgedAt: timestamp }),
    };
    records.push(record);
  }

  writeJsonFile(ALERTS_FILE, records);
  return record;
};
