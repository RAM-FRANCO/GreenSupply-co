/**
 * Product entity from products.json
 */
export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  reorderPoint: number;
}

/**
 * Warehouse entity from warehouses.json
 */
export interface Warehouse {
  id: number;
  name: string;
  location: string;
  code: string;
}

/**
 * Stock entry from stock.json
 */
export interface Stock {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
}

/**
 * Enriched inventory item with calculated fields
 */
export interface InventoryItem extends Product {
  totalQuantity: number;
  isLowStock: boolean;
}

/**
 * Dashboard stats summary
 */
export interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  totalValue: number;
  lowStockAlerts: number;
}

/**
 * Bar chart data point for category distribution
 */
export interface CategoryChartData {
  category: string;
  value: number;
}

/**
 * Line/Area chart data point for trends
 */
export interface TrendChartData {
  month: string;
  value: number;
}
