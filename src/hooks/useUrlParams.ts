import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { debounce } from "lodash";

// Type definitions for our query params
export interface UrlParams {
    page: number;
    limit: number;
    search: string;
    filter: Record<string, string>;
}

export function useUrlParams() {
    const router = useRouter();

    // Parse current params from URL
    const params: UrlParams = useMemo(() => {
        const { page, limit, search, ...rest } = router.query;

        // Extract everything else as filters, excluding known Next.js params or modal params
        const filters: Record<string, string> = {};
        Object.entries(rest).forEach(([key, value]) => {
            // Exclude modal params and system params
            if (['action', 'id', 'slug'].includes(key)) return;
            if (typeof value === 'string') filters[key] = value;
        });

        return {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            search: typeof search === 'string' ? search : '',
            filter: filters
        };
    }, [router.query]);

    // Helper to update URL
    const updateParams = useCallback((newParams: Partial<UrlParams>) => {
        const query = { ...router.query };

        if (newParams.page !== undefined) query.page = newParams.page.toString();
        if (newParams.limit !== undefined) query.limit = newParams.limit.toString();
        if (newParams.search !== undefined) {
            if (newParams.search) {
                query.search = newParams.search;
            } else {
                delete query.search;
            }
            // Reset page on search change usually
            query.page = "1";
        }

        // Handle filters
        if (newParams.filter) {
            Object.entries(newParams.filter).forEach(([key, value]) => {
                if (value) {
                    query[key] = value;
                } else {
                    delete query[key];
                }
            });
            // Reset page on filter change usually
            query.page = "1";
        }

        router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    }, [router]);

    // Debounced search update
    const debouncedSearch = useMemo(
        () => debounce((term: string) => updateParams({ search: term }), 500),
        [updateParams]
    );

    return {
        params,
        setPage: (page: number) => updateParams({ page }),
        setLimit: (limit: number) => updateParams({ limit }),
        setSearch: debouncedSearch,
        setFilter: (key: string, value: string) => updateParams({ filter: { [key]: value } }),
    };
}
