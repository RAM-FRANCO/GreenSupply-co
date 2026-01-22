/**
 * Hook for fetching reference data (products, warehouses, stock) with React Query.
 * Includes Zod validation for type safety at runtime.
 */
import { useQuery } from "@tanstack/react-query";
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
} as const;

/** Fetch and validate products */
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return ProductArraySchema.parse(data);
}

/** Fetch and validate warehouses */
async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await fetch("/api/warehouses");
  if (!res.ok) throw new Error("Failed to fetch warehouses");
  const data = await res.json();
  return WarehouseArraySchema.parse(data);
}

/** Fetch and validate stock */
async function fetchStock(): Promise<Stock[]> {
  const res = await fetch("/api/stock");
  if (!res.ok) throw new Error("Failed to fetch stock");
  const data = await res.json();
  return StockArraySchema.parse(data);
}

/**
 * Hook to fetch all reference data needed for transfers.
 */
export function useReferenceData() {
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

  const isLoading =
    productsQuery.isLoading ||
    warehousesQuery.isLoading ||
    stockQuery.isLoading;

  const error =
    productsQuery.error || warehousesQuery.error || stockQuery.error;

  return {
    products: productsQuery.data ?? [],
    warehouses: warehousesQuery.data ?? [],
    stock: stockQuery.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
