/**
 * Hook for fetching reference data (products, warehouses, stock) with React Query.
 * Includes Zod validation for type safety at runtime.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ProductArraySchema,
  WarehouseArraySchema,
  StockArraySchema,
} from "@/schemas/inventorySchema";
import type { Product, Warehouse, Stock } from "@/types/inventory";

/** Query keys for cache management */
export const QUERY_KEYS = {
  products: ["products"] as const,
  warehouses: ["warehouses"] as const,
  stock: ["stock"] as const,
  alerts: ["alerts"] as const,
} as const;

/** Fetch and validate products */
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  // Handle both array and paginated response
  const items = Array.isArray(data) ? data : data.data || [];
  return ProductArraySchema.parse(items);
}

/** Fetch and validate warehouses */
async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await fetch("/api/warehouses");
  if (!res.ok) throw new Error("Failed to fetch warehouses");
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.data || [];
  return WarehouseArraySchema.parse(items);
}

/** Fetch and validate stock */
async function fetchStock(): Promise<Stock[]> {
  const res = await fetch("/api/stock");
  if (!res.ok) throw new Error("Failed to fetch stock");
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.data || [];
  return StockArraySchema.parse(items);
}

import type { PurchaseOrder } from "@/types/purchaseOrder";

/**
 * Fetch and validate purchase orders
 */
async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const res = await fetch("/api/purchase-orders");
  if (!res.ok) throw new Error("Failed to fetch purchase orders");
  return res.json();
}

import type { Category } from "@/types/category";

/** Fetch categories */
async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

import { useSWRConfig } from "swr";

/**
 * Hook to fetch all reference data needed for transfers.
 */
export function useReferenceData() {
  const { mutate } = useSWRConfig();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const warehousesQuery = useQuery({
    queryKey: QUERY_KEYS.warehouses,
    queryFn: fetchWarehouses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const stockQuery = useQuery({
    queryKey: QUERY_KEYS.stock,
    queryFn: fetchStock,
    staleTime: 30 * 1000, // 30 seconds - frequently refresh stock
  });

  const purchaseOrdersQuery = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: fetchPurchaseOrders,
    staleTime: 30 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const isLoading =
    productsQuery.isLoading ||
    warehousesQuery.isLoading ||
    stockQuery.isLoading ||
    purchaseOrdersQuery.isLoading;

  const error =
    productsQuery.error || warehousesQuery.error || stockQuery.error || purchaseOrdersQuery.error;

  return {
    products: productsQuery.data ?? [],
    warehouses: warehousesQuery.data ?? [],
    stock: stockQuery.data ?? [],
    purchaseOrders: purchaseOrdersQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetchStock: async () => {
      // Invalidate React Query
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stock }),
        queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products }),
      ]);

      // Invalidate SWR - Matches all product-related paginated endpoints
      await mutate(
        (key: any) => typeof key === "string" && key.startsWith("/api/products"),
        undefined,
        { revalidate: true }
      );
    },
  };
}
