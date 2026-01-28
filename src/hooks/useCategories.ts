import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@/types/category";

const QUERY_KEY = ["categories"];

async function fetchCategories(): Promise<Category[]> {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

/**
 * Hook for managing category data and operations.
 */
export function useCategories() {
    const queryClient = useQueryClient();
    const [error] = useState<string | null>(null);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: fetchCategories,
    });

    const createMutation = useMutation({
        mutationFn: async (newCategory: Omit<Category, "id">) => {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });
            if (!res.ok) throw new Error("Failed to create category");
            return res.json();
        },
        onMutate: async (newCategory) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previousCategories = queryClient.getQueryData<Category[]>(QUERY_KEY);
            queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) => [
                ...old,
                { ...newCategory, id: "temp-id-" + Date.now(), productCount: 0, totalItems: 0, totalValue: 0 } as Category,
            ]);
            return { previousCategories };
        },
        onError: (_err, _newCategory, context) => {
            queryClient.setQueryData(QUERY_KEY, context?.previousCategories);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
            const res = await fetch(`/api/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update category");
            return res.json();
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previousCategories = queryClient.getQueryData<Category[]>(QUERY_KEY);
            queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) =>
                old.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
            );
            return { previousCategories };
        },
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(QUERY_KEY, context?.previousCategories);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete category");
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previousCategories = queryClient.getQueryData<Category[]>(QUERY_KEY);
            queryClient.setQueryData<Category[]>(QUERY_KEY, (old = []) =>
                old.filter((cat) => cat.id !== id)
            );
            return { previousCategories };
        },
        onError: (_err, _id, context) => {
            queryClient.setQueryData(QUERY_KEY, context?.previousCategories);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });

    return {
        categories,
        loading: isLoading,
        error: error || (createMutation.error as Error)?.message || (updateMutation.error as Error)?.message || (deleteMutation.error as Error)?.message,
        createCategory: createMutation.mutateAsync,
        updateCategory: updateMutation.mutateAsync,
        deleteCategory: deleteMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
}
