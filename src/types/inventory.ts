/**
 * Product entity from products.json
 */
export interface Product {
  id: number;
  slug: string; // URL-friendly identifier
  sku: string;
  name: string;
  categoryId: string; // Refactor: Tag by ID
  unitCost: number;
  reorderPoint: number;
  description?: string;
  image?: string;
}

/**
 * Warehouse entity from warehouses.json
 */
export interface Warehouse {
  id: number;
  slug: string; // New: Readable URL slug
  name: string;
  location: string;
  code: string;
  managerName?: string; // New: Real manager data
  maxSlots?: number;    // New: For capacity calculation
  type?: "Distribution Center" | "Fulfillment Center" | "Cold Storage" | "Retail Store";
  skuCount?: number;     // New: Calculated SKU count
  totalQuantity?: number; // New: Calculated total items
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

/**
 * Stock statistics for alerts page
 */
export interface StockStats {
  healthyPercentage: number;
  healthyTrend: number;
  approachingReorder: number;
  belowThreshold: number;
  pendingReorders: number;
}
