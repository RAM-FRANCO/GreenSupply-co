import { useState, useMemo } from "react";
import { Product, Stock, ProductWithStock } from "../types";

interface UseProductFilteringProps {
  products: Product[];
  stocks: Stock[];
}

export const useProductFiltering = ({ products, stocks }: UseProductFilteringProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const processedProducts: ProductWithStock[] = useMemo(() => {
    if (!products.length) return [];

    return products
      .map((product) => {
        const productStocks = stocks.filter((s) => s.productId === product.id);
        const currentStock = productStocks.reduce(
          (sum, s) => sum + s.quantity,
          0,
        );

        const maxStock = Math.max(
          product.reorderPoint * 3,
          currentStock * 1.2,
          100,
        );
        const stockHealth = Math.min((currentStock / maxStock) * 100, 100);

        let stockStatus: ProductWithStock["stockStatus"] = "In Stock";
        if (currentStock === 0) stockStatus = "Out of Stock";
        else if (currentStock <= product.reorderPoint)
          stockStatus = "Low Stock";

        return {
          ...product,
          currentStock,
          stockStatus,
          stockHealth,
        };
      })
      .filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory =
          categoryFilter === "All" || p.categoryId === categoryFilter;
        const matchStatus =
          statusFilter === "All" || p.stockStatus === statusFilter;

        return matchSearch && matchCategory && matchStatus;
      });
  }, [products, stocks, searchTerm, categoryFilter, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    processedProducts,
  };
};
