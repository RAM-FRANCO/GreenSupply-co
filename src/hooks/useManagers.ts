import { useState, useEffect, useCallback } from "react";

export interface Manager {
    id: number;
    name: string;
    email: string;
}

export function useManagers() {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchManagers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/managers");
            if (!res.ok) throw new Error("Failed to fetch managers");
            const data = await res.json();
            setManagers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    const addManager = async (name: string) => {
        try {
            const res = await fetch("/api/managers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email: "" })
            });
            if (!res.ok) throw new Error("Failed to add manager");
            const newManager = await res.json();
            setManagers(prev => [...prev, newManager]);
            return newManager;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchManagers();
    }, [fetchManagers]);

    return { managers, loading, error, fetchManagers, addManager };
}
