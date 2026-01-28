/**
 * Multiplier for determining "low stock" threshold.
 * e.g., if reorderPoint is 100 and multiplier is 1.2,
 * stock between 100-120 is considered "low stock".
 */
export const LOW_STOCK_THRESHOLD_MULTIPLIER = 1.2;

/**
 * Multiplier for determining "overstocked" threshold.
 * e.g., if reorderPoint is 100 and multiplier is 3.0,
 * stock above 300 is considered "overstocked".
 */
export const OVERSTOCKED_THRESHOLD_MULTIPLIER = 3.0;

/**
 * Stock status type for centralized type definitions
 */
export type StockStatusType = 'healthy' | 'low-stock' | 'critical-low' | 'overstocked';

/**
 * Determines stock status based on quantity vs reorder point.
 * Centralizes logic to avoid duplication across components.
 */
export function getStockStatus(
  quantity: number,
  reorderPoint: number
): StockStatusType {
  if (quantity < reorderPoint) {
    return 'critical-low';
  }
  if (quantity <= reorderPoint * LOW_STOCK_THRESHOLD_MULTIPLIER) {
    return 'low-stock';
  }
  if (quantity > reorderPoint * OVERSTOCKED_THRESHOLD_MULTIPLIER) {
    return 'overstocked';
  }
  return 'healthy';
}
