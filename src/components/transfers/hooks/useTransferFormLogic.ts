/**
 * Custom hook for transfer form logic.
 * Uses React Query via useReferenceData for data fetching.
 */
import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  transferFormSchema,
  transferSubmitSchema,
  routeSelectionSchema,
  itemSelectionSchema,
  type TransferFormData,
} from "@/schemas/transferSchema";
import type { CreateTransferRequest } from "@/types/transfers";
import type { SelectOption } from "@/types/common";

import { useReferenceData, QUERY_KEYS } from "@/hooks/useReferenceData";
import { useQueryClient } from "@tanstack/react-query";
interface UseTransferFormLogicReturn {
  // Form state
  formValues: TransferFormData;
  errors: ReturnType<typeof useForm<TransferFormData>>["formState"]["errors"];
  setValue: ReturnType<typeof useForm<TransferFormData>>["setValue"];
  trigger: ReturnType<typeof useForm<TransferFormData>>["trigger"];
  setError: ReturnType<typeof useForm<TransferFormData>>["setError"];
  reset: ReturnType<typeof useForm<TransferFormData>>["reset"];
  // Reference data
  products: ReturnType<typeof useReferenceData>["products"];
  warehouses: ReturnType<typeof useReferenceData>["warehouses"];
  // Derived options
  productOptions: readonly SelectOption[];
  warehouseOptions: readonly SelectOption[];
  destinationOptions: readonly SelectOption[];
  // Stock info
  availableStock: number | null;
  stockPercentage: number;
  // Review helpers
  from: ReturnType<typeof useReferenceData>["warehouses"][number] | undefined;
  to: ReturnType<typeof useReferenceData>["warehouses"][number] | undefined;
  product: ReturnType<typeof useReferenceData>["products"][number] | undefined;
  // UI state
  activeStep: number;
  loading: boolean;
  initialLoading: boolean;
  submitError: string | null;
  success: string | null;
  // Actions
  handleNext: () => Promise<void>;
  handleBack: () => void;
  handleSubmit: () => Promise<void>;
  clearSubmitError: () => void;
  clearSuccess: () => void;
}
/**
 * Encapsulates all transfer form logic for cleaner component code.
 */
import { useRouter } from "next/router";

// ... inside hook ...
export function useTransferFormLogic(
  onTransferComplete?: (referenceNumber?: string) => void
): UseTransferFormLogicReturn {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { fromWarehouseId } = router.query;

  const { watch, trigger, reset, setValue, setError, formState: { errors } } =
    useForm<TransferFormData>({
      resolver: zodResolver(transferFormSchema),
      defaultValues: {
        fromWarehouseId: fromWarehouseId ? Number(fromWarehouseId) : undefined,
        toWarehouseId: undefined,
        productId: undefined,
        quantity: undefined,
        notes: "",
      },
      mode: "onChange",
    });
  const formValues = watch();
  // Use React Query for data fetching
  const {
    products,
    warehouses,
    stock,
    isLoading: initialLoading,
    error: dataError,
    refetchStock,
  } = useReferenceData();
  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(
    dataError ?? null
  );
  const [success, setSuccess] = useState<string | null>(null);
  // Dropdown options
  const productOptions = useMemo(
    () => products.map((p) => ({ id: p.id, label: `${p.name} (${p.sku})` })),
    [products]
  );
  const warehouseOptions = useMemo(
    () => warehouses.map((w) => ({ id: w.id, label: `${w.name} (${w.code})` })),
    [warehouses]
  );
  const destinationOptions = useMemo(
    () => warehouseOptions.filter((w) => w.id !== formValues.fromWarehouseId),
    [warehouseOptions, formValues.fromWarehouseId]
  );
  // Available stock at source warehouse
  const availableStock = useMemo(() => {
    if (!formValues.productId || !formValues.fromWarehouseId) return null;
    const stockEntry = stock.find(
      (s) =>
        s.productId === formValues.productId &&
        s.warehouseId === formValues.fromWarehouseId
    );
    return stockEntry?.quantity ?? 0;
  }, [formValues.productId, formValues.fromWarehouseId, stock]);
  // Stock gauge percentage
  const stockPercentage = useMemo(
    () =>
      availableStock && formValues.quantity
        ? Math.min(100, (formValues.quantity / availableStock) * 100)
        : 0,
    [availableStock, formValues.quantity]
  );
  // Review details
  const { from, to, product } = useMemo(
    () => ({
      from: warehouses.find((w) => w.id === formValues.fromWarehouseId),
      to: warehouses.find((w) => w.id === formValues.toWarehouseId),
      product: products.find((p) => p.id === formValues.productId),
    }),
    [
      warehouses,
      products,
      formValues.fromWarehouseId,
      formValues.toWarehouseId,
      formValues.productId,
    ]
  );
  /** Validate current step and proceed to next */
  const handleNext = useCallback(async () => {
    setSubmitError(null);

    // Step 0: Validate route selection using the step-specific schema
    if (activeStep === 0) {
      const result = routeSelectionSchema.safeParse(formValues);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof TransferFormData;
          setError(field, { type: "manual", message: issue.message });
        });
        return;
      }
    }

    // Step 1: Validate item selection using the step-specific schema
    if (activeStep === 1) {
      const result = itemSelectionSchema.safeParse(formValues);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof TransferFormData;
          setError(field, { type: "manual", message: issue.message });
        });
        return;
      }
      // Stock availability validation
      if (availableStock !== null && formValues.quantity && formValues.quantity > availableStock) {
        setSubmitError(`Insufficient stock. Available: ${availableStock}`);
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  }, [activeStep, formValues, setError, availableStock]);
  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
    setSubmitError(null);
  }, []);
  /** Submit the transfer */
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      // Validate form data before submission
      const result = transferSubmitSchema.safeParse(formValues);
      if (!result.success) {
        setSubmitError("Please complete all required fields.");
        return;
      }
      const validatedData = result.data;
      const request: CreateTransferRequest = {
        productId: validatedData.productId,
        fromWarehouseId: validatedData.fromWarehouseId,
        toWarehouseId: validatedData.toWarehouseId,
        quantity: validatedData.quantity,
        ...(validatedData.notes && { notes: validatedData.notes }),
      };
      // Defense-in-depth: verify stock availability before API call
      // Fetch fresh stock data to avoid stale UI state
      const { data: freshStockResult } = await refetchStock();
      const freshStock = freshStockResult?.find(
        (s) => s.productId === request.productId && s.warehouseId === request.fromWarehouseId
      );
      const currentAvailable = freshStock?.quantity ?? 0;

      if (request.quantity > currentAvailable) {
        setSubmitError(`Insufficient stock. Available: ${currentAvailable}`);
        return;
      }

      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 400 && responseData.errors) {
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            const message = Array.isArray(messages)
              ? messages[0]
              : (messages as string);
            setError(field as keyof TransferFormData, {
              type: "server",
              message,
            });
          });
          throw new Error("Validation failed. Please check the form fields.");
        }
        throw new Error(responseData.message || "Transfer failed");
      }
      setSuccess(
        `Transfer ${responseData.referenceNumber} initiated successfully`
      );
      reset();
      setActiveStep(0);
      // Invalidate stock query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stock });

      // Invalidate alerts to update notifications immediately
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });

      onTransferComplete?.(responseData.referenceNumber);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  }, [formValues, setError, reset, onTransferComplete, queryClient, refetchStock]);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);
  return {
    formValues,
    errors,
    setValue,
    trigger,
    setError,
    reset,
    products,
    warehouses,
    productOptions,
    warehouseOptions,
    destinationOptions,
    availableStock,
    stockPercentage,
    from,
    to,
    product,
    activeStep,
    loading,
    initialLoading,
    submitError,
    success,
    handleNext,
    handleBack,
    handleSubmit,
    clearSubmitError,
    clearSuccess,
  };
}

