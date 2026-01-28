import { useMemo } from "react";
import type {
  Product,
  Warehouse,
  Stock,
  InventoryItem,
  CategoryChartData,
} from "@/types/inventory";
import type { Category } from "@/types/category";
import type { AlertRecord } from "@/types/alerts";
import { useReferenceData } from "./useReferenceData";

import type { PurchaseOrder } from "@/types/purchaseOrder";

export interface EnrichedStock extends Stock {
  product?: Product;
  warehouse?: Warehouse;
  alertStatus?: "active" | "acknowledged" | "snoozed" | "resolved" | null;
}

export interface EnrichedPurchaseOrder extends PurchaseOrder {
  product?: Product;
  warehouse?: Warehouse;
}

interface UseInventoryDataResult {
  products: Product[];
  warehouses: Warehouse[];
  stock: Stock[];
  enrichedStock: EnrichedStock[];
  categories: Category[];
  inventoryOverview: InventoryItem[];
  categoryChartData: CategoryChartData[];
  purchaseOrders: EnrichedPurchaseOrder[];
  pendingReordersCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reorderStock: (
    productId: number,
    warehouseId: number,
    quantity: number,
  ) => Promise<void>;
  adjustStock: (
    productId: number,
    warehouseId: number,
    adjustmentQuantity: number,
    reason?: string
  ) => Promise<void>;
  updateAlertStatus: (
    alertId: number,
    update: { status: string; snoozeUntil?: string; notes?: string },
  ) => Promise<void>;
  updateProduct: (productId: number, data: Partial<Product>) => Promise<void>;
  receiveOrder: (orderId: number) => Promise<void>;
}

export function useInventoryData(): UseInventoryDataResult {
  const {
    products,
    warehouses,
    stock,
    categories,
    purchaseOrders,
    isLoading: loading,
    error: referenceError,
    refetchStock,
  } = useReferenceData();

  const refetch = async () => {
    // We update both stock and purchase orders
    await refetchStock();
  };

  // derived state for purchase orders
  const pendingPurchaseOrders = useMemo(() => {
    // We treat "purchaseOrders" from the hook as potentially "any[]" if types are loose, 
    // but we can cast or just trust it flows from the API correctly.
    const orders = (purchaseOrders as PurchaseOrder[]) || [];

    // Enrich with product/warehouse data for the UI
    return orders.map(order => ({
      ...order,
      product: products.find(p => p.id === order.productId),
      warehouse: warehouses.find(w => w.id === order.warehouseId),
    }));
  }, [purchaseOrders, products, warehouses]);

  const pendingReordersCount = pendingPurchaseOrders.filter(o => o.status === 'pending').length;

  // Mock alerts for now as we don't have a hook for it yet
  const alerts: AlertRecord[] = useMemo(() => [], []);

  const enrichedStock = useMemo(() => {
    return stock.map((item) => {
      const alert = alerts.find(
        (a) =>
          a.productId === item.productId && a.warehouseId === item.warehouseId,
      );
      return {
        ...item,
        product: products.find((p) => p.id === item.productId),
        warehouse: warehouses.find((w) => w.id === item.warehouseId),
        alertStatus: alert?.status || null,
      };
    });
  }, [stock, products, warehouses, alerts]);

  // Derive categories stats
  const enrichedCategories: Category[] = useMemo(() => {
    return categories.map((cat) => {
      // Calculate stats for this category
      const catProducts = products.filter(p => p.categoryId === cat.id);
      const catProductIds = catProducts.map(p => p.id);
      const catStock = stock.filter(s => catProductIds.includes(s.productId));

      const totalItems = catStock.reduce((sum, s) => sum + s.quantity, 0);
      const totalValue = catStock.reduce((sum, s) => {
        const product = products.find(p => p.id === s.productId);
        return sum + (s.quantity * (product?.unitCost || 0));
      }, 0);

      const productCount = catProducts.length;

      return {
        ...cat,
        productCount,
        totalItems,
        totalValue,
        description: cat.description || `${productCount} products`,
      };
    });
  }, [products, stock, categories]);

  const inventoryOverview = useMemo(() => {
    return products.map((product) => {
      const productStock = stock.filter((s) => s.productId === product.id);
      const totalQuantity = productStock.reduce(
        (sum, s) => sum + s.quantity,
        0,
      );
      const isLowStock = totalQuantity <= product.reorderPoint;

      return {
        ...product,
        totalQuantity,
        isLowStock,
      };
    });
  }, [products, stock]);

  const categoryChartData: CategoryChartData[] = useMemo(() => {
    const stockByCategory: Record<string, number> = {};

    categories.forEach((cat) => {
      stockByCategory[cat.name] = 0;
    });

    enrichedStock.forEach((item) => {
      const catId = item.product?.categoryId;
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        stockByCategory[cat.name] = (stockByCategory[cat.name] || 0) + item.quantity;
      }
    });

    return categories.map((cat) => ({
      category: cat.name,
      value: stockByCategory[cat.name] || 0,
    }));
  }, [enrichedStock, categories]);

  const updateAlertStatus = async (
    alertId: number,
    update: { status: string; snoozeUntil?: string; notes?: string },
  ) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      if (!res.ok) {
        throw new Error("Failed to update alert status");
      }

      await refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update alert";
      throw new Error(message);
    }
  };

  const reorderStock = async (
    productId: number,
    warehouseId: number,
    quantity: number,
  ) => {
    try {
      const res = await fetch("/api/stock/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, warehouseId, quantity }),
      });

      if (!res.ok) {
        throw new Error("Failed to place order");
      }

      await refetch(); // Refresh to see updated stock
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reorder stock";
      throw new Error(message);
    }
  };

  const adjustStock = async (
    productId: number,
    warehouseId: number,
    adjustmentQuantity: number,
    reason?: string
  ) => {
    try {
      const res = await fetch("/api/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, warehouseId, adjustmentQuantity, reason }),
      });

      if (!res.ok) {
        throw new Error("Failed to adjust stock");
      }

      await refetch(); // Refresh to see updated stock
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to adjust stock";
      throw new Error(message);
    }
  };

  const updateProduct = async (productId: number, data: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      await refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update product";
      throw new Error(message);
    }
  };

  const receiveOrder = async (orderId: number) => {
    try {
      const res = await fetch(`/api/purchase-orders/${orderId}/receive`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to receive order");
      }

      await refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to receive order";
      throw new Error(message);
    }
  };

  return {
    products,
    warehouses,
    stock,
    enrichedStock,
    categories: enrichedCategories,
    inventoryOverview,
    categoryChartData,
    purchaseOrders: pendingPurchaseOrders, // Exposed enriched list
    pendingReordersCount,
    loading,
    error: referenceError || null,
    refetch,
    reorderStock,
    adjustStock,
    updateAlertStatus,
    updateProduct,
    receiveOrder,
  };
}
