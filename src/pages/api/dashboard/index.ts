import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile } from "@/lib/dataService";
import type { Product, Warehouse, Stock, InventoryItem } from "@/types/inventory";
import type { Category } from "@/types/category";

// Define file names (matching other API routes)
const PRODUCT_FILE = "products.json";
const WAREHOUSE_FILE = "warehouses.json";
const STOCK_FILE = "stock.json";
const CATEGORIES_FILE = "categories.json";

export default createApiHandler({
    GET: {
        handler: async (req, res) => {
            // Parallel fetch of all required data
            // Parallel fetch of all required data
            const [products, warehouses, stock, categories] = await Promise.all([
                readJsonFile<Product>(PRODUCT_FILE),
                readJsonFile<Warehouse>(WAREHOUSE_FILE),
                readJsonFile<Stock>(STOCK_FILE),
                readJsonFile<Category>(CATEGORIES_FILE),
            ]);

            // --- Calculate Stats ---

            // 1. Low Stock & Total Value
            // We need to aggregate stock per product to check reorder points
            let lowStockCount = 0;
            let totalValue = 0;

            // Helper map to aggregate stock quantities per product
            const productStockMap = new Map<number, number>();
            stock.forEach((s) => {
                const current = productStockMap.get(s.productId) || 0;
                productStockMap.set(s.productId, current + s.quantity);
            });

            // Calculate value and check low stock status
            const inventoryOverview: InventoryItem[] = products.map((product) => {
                const totalQuantity = productStockMap.get(product.id) || 0;
                const isLowStock = totalQuantity <= product.reorderPoint;

                if (isLowStock) {
                    lowStockCount++;
                }

                totalValue += product.unitCost * totalQuantity;

                return {
                    ...product,
                    totalQuantity,
                    isLowStock
                };
            });

            // 2. Chart Data (Stock by Category)
            const stockByCategory: Record<string, number> = {};

            // Initialize with 0
            categories.forEach(cat => {
                stockByCategory[cat.name] = 0;
            });

            // Sum quantities by category
            stock.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product?.category) {
                    stockByCategory[product.category] = (stockByCategory[product.category] || 0) + item.quantity;
                }
            });

            const categoryChartData = categories.map(cat => ({
                category: cat.name,
                value: stockByCategory[cat.name] || 0
            }));

            // Return the aggregated dashboard payload
            res.status(200).json({
                stats: {
                    totalProducts: products.length,
                    totalWarehouses: warehouses.length,
                    totalValue,
                    lowStockAlerts: lowStockCount,
                },
                chartData: categoryChartData,
                // We can send top low stock items or recent items if needed later
                inventoryOverview: inventoryOverview.slice(0, 10), // Send top 10 for "Overview" table to save bandwidth? 
                // User asked for "Overview" table on dashboard, usually typically shows all or top X. 
                // For now, let's strictly follow the existing UI which shows *everything* in the table on dashboard? 
                // Wait, the existing dashboard table is "Inventory Overview". 
                // If we paginate/limit this, we change behavior. 
                // But sending ALL products for the dashboard table defeats the purpose of optimization?
                // Let's send ALL for now to maintain exact parity, but we should probably paginate this table too later.
                inventoryOverviewFull: inventoryOverview,
            });
        },
    },
});
