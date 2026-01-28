import useSWR from "swr";
import { useUrlParams } from "./useUrlParams";
import { useMemo } from "react";

interface Meta {
    total: number;
    page: number;
    limit: number;
}

interface PaginatedResponse<T> {
    data: T[];
    meta: Meta;
}

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
});

export function usePaginatedData<T>(endpoint: string) {
    const { params } = useUrlParams();

    // Construct URL with query params
    // utilizing URLSearchParams for cleanliness
    const queryString = useMemo(() => {
        const searchParams = new URLSearchParams();
        searchParams.set("page", params.page.toString());
        searchParams.set("limit", params.limit.toString());
        if (params.search) searchParams.set("search", params.search);

        Object.entries(params.filter).forEach(([key, value]) => {
            searchParams.set(key, value);
        });

        return searchParams.toString();
    }, [params]);

    const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<T>>(
        `${endpoint}?${queryString}`,
        fetcher
    );

    return {
        data: data?.data || [],
        meta: data?.meta || { total: 0, page: 1, limit: 10 },
        loading: isLoading,
        error: error instanceof Error ? error.message : error ? "An error occurred" : null,
        refetch: mutate,
    };
}
