import { useState, useEffect, useCallback } from "react";
import { Product, Stock } from "../types";

interface UseInventoryReturn {
  products: Product[];
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, stockData] = await Promise.all([
        fetch("/api/products").then((res) => {
          if (!res.ok) throw new Error("Failed to fetch products");
          return res.json();
        }),
        fetch("/api/stock").then((res) => {
          if (!res.ok) throw new Error("Failed to fetch stock");
          return res.json();
        }),
      ]);
      setProducts(productsData);
      setStocks(stockData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { products, stocks, loading, error, refresh: fetchData };
};
