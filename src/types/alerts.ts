/**
 * Alert severity based on stock status
 */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/**
 * Alert status workflow
 */
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'snoozed';

/**
 * Stock category for filtering
 */
export type StockCategory = 'critical' | 'low' | 'adequate' | 'overstocked';

/**
 * Persisted alert tracking record
 * Only stores the metadata for managing the workflow
 */
export interface AlertRecord {
  id: number;
  productId: number;
  warehouseId: number;
  status: AlertStatus;
  acknowledgedAt?: string;
  resolvedAt?: string;
  snoozedUntil?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enriched alert for UI display
 * Combines live stock data with persisted tracking info
 */
export interface EnrichedAlert extends Omit<AlertRecord, 'productId' | 'warehouseId'> {
  product: { id: number; name: string; sku: string; category: string };
  warehouse: { id: number; name: string; code: string };
  currentStock: number;
  reorderPoint: number;
  shortage: number;
  severity: AlertSeverity;
  recommendedQuantity: number;
  timestamp: string;
}

export interface AlertStatusUpdate {
  status: AlertStatus;
  snoozeUntil?: string;
  notes?: string;
}
