import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

// Generic type for query params to ensure type safety
export type QueryParams = Record<string, string | number | undefined>;

interface UseQueryModalOptions {
    /** The specific action value that triggers the modal (e.g., 'add', 'edit') */
    action?: string;
    /** The key in the query params that defines the action (default: 'action') */
    paramKey?: string;
    /** Keys that should NOT be removed when closing the modal (e.g., route params like 'id' or 'slug') */
    lockedKeys?: string[];
}

/**
 * A hook to manage modal state via URL query parameters.
 * Follows industry best practices for:
 * - URL-driven state (deep linking, shareability)
 * - Shallow routing (no full page reload)
 * - Memoization (performance)
 *
 * @example
 * const { isOpen, open, close, params } = useQueryModal({ action: 'edit' });
 */
export function useQueryModal({
    action,
    paramKey = "action",
    lockedKeys = [],
}: UseQueryModalOptions = {}) {
    const router = useRouter();

    // Memoize the current value of the param to avoid recalculations
    const currentValue = useMemo(() => {
        const val = router.query[paramKey];
        return Array.isArray(val) ? val[0] : val;
    }, [router.query, paramKey]);

    // Determine open state based on action match or existence if no specific action provided
    const isOpen = useMemo(() => {
        if (action) {
            return currentValue === action;
        }
        return !!currentValue;
    }, [currentValue, action]);

    // Helper to extract other relevant params (like id) safely
    const getParams = useCallback(
        <T extends QueryParams>() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [paramKey]: _, ...rest } = router.query;
            return rest as unknown as T;
        },
        [router.query, paramKey]
    );

    /**
     * Opens the modal by setting the query param.
     * Can optionally include extra params (like id for editing).
     */
    const open = useCallback(
        (targetAction?: string, extraParams?: QueryParams) => {
            const valueToSet = targetAction || action;
            if (!valueToSet) {
                console.warn("No action specified for useQueryModal open()");
                return;
            }

            router.push(
                {
                    pathname: router.pathname,
                    query: {
                        ...router.query,
                        ...extraParams,
                        [paramKey]: valueToSet,
                    },
                },
                undefined,
                { shallow: true }
            );
        },
        [router, action, paramKey]
    );

    /**
     * Closes the modal by removing the query param and extra params.
     * Maintains other query params (like search/filters) if needed,
     * but for now we assume modal params should be cleared.
     */
    const close = useCallback(() => {
        const newQuery = { ...router.query };
        delete newQuery[paramKey];

        // If we were in edit mode (usually has an 'id'), we might want to clean that up too.
        // This is a naive cleanup; for complex cases, might need specific keys to remove.
        // We skip removal if the key is "locked" (e.g. it's a route param)
        if (newQuery.id && !lockedKeys.includes("id")) {
            delete newQuery.id;
        }
        // Cleanup stockId for alerts
        if (newQuery.stockId && !lockedKeys.includes("stockId")) {
            delete newQuery.stockId;
        }

        router.push(
            {
                pathname: router.pathname,
                query: newQuery,
            },
            undefined,
            { shallow: true }
        );
    }, [router, paramKey, lockedKeys]);

    return {
        isOpen,
        open,
        close,
        params: getParams(),
        currentValue,
    };
}
