import { useState, useMemo } from "react";
import { useSWRConfig } from "swr";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  EnrichedAlert,
  AlertStatus,
  AlertSeverity,
  AlertRecord,
} from "@/types/alerts";
import type { AlertStatusUpdate } from "@/schemas/alertSchema";
import { QUERY_KEYS } from "@/hooks/useReferenceData";

interface UseAlertsResult {
  alerts: EnrichedAlert[];
  loading: boolean;
  error: string | null;
  filters: {
    severity?: AlertSeverity;
    status?: AlertStatus;
    warehouseId?: number;
  };
  setFilters: (filters: {
    severity?: AlertSeverity;
    status?: AlertStatus;
    warehouseId?: number;
  }) => void;
  updateAlertStatus: (
    productId: number,
    warehouseId: number,
    update: AlertStatusUpdate
  ) => Promise<AlertRecord>;
  reorderStock: (
    productId: number,
    warehouseId: number,
    quantity: number,
  ) => Promise<void>;
  refetch: () => Promise<void>;
  stats: {
    critical: number;
    warning: number;
    overstocked: number;
    active: number;
    acknowledged: number;
    unread: number;
  };
}

async function fetchAlerts(params: URLSearchParams): Promise<EnrichedAlert[]> {
  const res = await fetch(`/api/alerts?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export function useAlerts(): UseAlertsResult {
  const { mutate } = useSWRConfig();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<{
    severity?: AlertSeverity;
    status?: AlertStatus;
    warehouseId?: number;
  }>({});

  const params = new URLSearchParams();
  if (filters.severity) params.append("severity", filters.severity);
  if (filters.status) params.append("status", filters.status);
  if (filters.warehouseId)
    params.append("warehouseId", filters.warehouseId.toString());

  // Use React Query instead of SWR
  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.alerts, filters] as const,
    queryFn: () => fetchAlerts(params),
    refetchInterval: 30000, // Poll every 30s
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      productId,
      warehouseId,
      update,
    }: {
      productId: number;
      warehouseId: number;
      update: AlertStatusUpdate;
    }) => {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          warehouseId,
          ...update,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update alert status");
      }
      return (await res.json()) as AlertRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      productId,
      warehouseId,
      quantity,
    }: {
      productId: number;
      warehouseId: number;
      quantity: number;
    }) => {
      const res = await fetch("/api/stock/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, warehouseId, quantity }),
      });

      if (!res.ok) {
        throw new Error("Failed to place order");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stock });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });

      // Invalidate SWR
      mutate(
        (key: string) => typeof key === "string" && key.startsWith("/api/products"),
        undefined,
        { revalidate: true }
      );
    },
  });

  const stats = useMemo(() => {
    return {
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      overstocked: alerts.filter((a) => a.shortage < 0).length,
      active: alerts.filter((a) => a.status === "active").length,
      acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
      unread: alerts.filter(
        (a) =>
          a.status === "active" &&
          (a.severity === "critical" || a.severity === "warning"),
      ).length,
    };
  }, [alerts]);

  return {
    alerts,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    filters,
    setFilters,
    updateAlertStatus: (productId, warehouseId, update) =>
      updateStatusMutation.mutateAsync({ productId, warehouseId, update }),
    reorderStock: (productId, warehouseId, quantity) =>
      reorderMutation.mutateAsync({ productId, warehouseId, quantity }),
    refetch: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
    },
    stats,
  };
}
