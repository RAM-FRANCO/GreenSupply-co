import { useState, useEffect, useCallback } from "react";
import type { Warehouse } from "@/types/inventory";

export function useWarehouses() {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWarehouses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/warehouses?limit=100");
            if (!res.ok) throw new Error("Failed to fetch warehouses");
            const json = await res.json();
            // Handle both array (legacy) and paginated response
            setWarehouses(Array.isArray(json) ? json : json.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const deleteWarehouse = async (id: number) => {
        try {
            const res = await fetch(`/api/warehouses/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setWarehouses((prev) => prev.filter((w) => w.id !== id));
            }
        } catch (err) {
            console.error("Error deleting warehouse:", err);
        }
    };

    const createWarehouse = async (data: Partial<Warehouse>) => {
        setLoading(true);
        try {
            const res = await fetch("/api/warehouses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await fetchWarehouses();
            } else {
                throw new Error("Failed to create warehouse");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create warehouse");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateWarehouse = async (id: number, data: Partial<Warehouse>) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/warehouses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await fetchWarehouses();
            } else {
                throw new Error("Failed to update warehouse");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update warehouse");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { warehouses, loading, error, refetch: fetchWarehouses, deleteWarehouse, createWarehouse, updateWarehouse };
}
