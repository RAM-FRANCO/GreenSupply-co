import useSWR from "swr";
import type { CategoryChartData, InventoryItem, DashboardStats } from "@/types/inventory";

interface DashboardDataResponse {
    stats: DashboardStats;
    chartData: CategoryChartData[];
    inventoryOverviewFull: InventoryItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return res.json();
});

export function useDashboardData() {
    const { data, error, isLoading, mutate } = useSWR<DashboardDataResponse>(
        "/api/dashboard",
        fetcher
    );

    return {
        stats: data?.stats,
        chartData: data?.chartData || [],
        inventoryOverview: data?.inventoryOverviewFull || [],
        loading: isLoading,
        error: error instanceof Error ? error.message : error ? "An error occurred" : null,
        refetch: mutate,
    };
}
