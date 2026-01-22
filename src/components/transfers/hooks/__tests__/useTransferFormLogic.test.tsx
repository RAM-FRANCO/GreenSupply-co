import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTransferFormLogic } from "../useTransferFormLogic";

// Mock data
const mockProducts = [
  {
    id: 1,
    name: "Eco Spoon",
    sku: "ECO-001",
    category: "Utensils",
    unitCost: 2.5,
    reorderPoint: 100,
  },
  {
    id: 2,
    name: "Bamboo Plate",
    sku: "PLT-002",
    category: "Tableware",
    unitCost: 5.0,
    reorderPoint: 50,
  },
];
const mockWarehouses = [
  { id: 1, name: "North Hub", code: "NH-01", location: "New York" },
  { id: 2, name: "South Hub", code: "SH-02", location: "Miami" },
];
const mockStock = [{ id: 1, productId: 1, warehouseId: 1, quantity: 50 }];

// Helper to mock fetch responses
function mockFetch(url: string) {
  if (url === "/api/products")
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    });
  if (url === "/api/warehouses")
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockWarehouses),
    });
  if (url === "/api/stock")
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockStock),
    });
  return Promise.reject(new Error("Unknown URL"));
}

// Wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useTransferFormLogic", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(mockFetch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches reference data on mount", async () => {
    const { result } = renderHook(() => useTransferFormLogic(), {
      wrapper: createWrapper(),
    });

    expect(result.current.initialLoading).toBe(true);

    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.warehouses).toEqual(mockWarehouses);
    expect(result.current.productOptions).toHaveLength(2);
    expect(result.current.warehouseOptions).toHaveLength(2);
  });

  it("filters destination options based on selected origin", async () => {
    const { result } = renderHook(() => useTransferFormLogic(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    act(() => {
      result.current.setValue("fromWarehouseId", 1);
    });

    expect(result.current.destinationOptions).toHaveLength(1);
    expect(result.current.destinationOptions[0].id).toBe(2);
  });

  it("calculates available stock correctly", async () => {
    const { result } = renderHook(() => useTransferFormLogic(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    act(() => {
      result.current.setValue("productId", 1);
      result.current.setValue("fromWarehouseId", 1);
    });

    expect(result.current.availableStock).toBe(50);

    act(() => {
      result.current.setValue("fromWarehouseId", 2);
    });

    expect(result.current.availableStock).toBe(0);
  });

  it("validates insufficient stock before next step", async () => {
    const { result } = renderHook(() => useTransferFormLogic(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    act(() => {
      result.current.setValue("fromWarehouseId", 1);
      result.current.setValue("toWarehouseId", 2);
    });

    await act(async () => {
      await result.current.handleNext();
    });
    expect(result.current.activeStep).toBe(1);

    act(() => {
      result.current.setValue("productId", 1);
      result.current.setValue("quantity", 100);
    });

    await act(async () => {
      await result.current.handleNext();
    });

    expect(result.current.submitError).toContain("Insufficient stock");
    expect(result.current.activeStep).toBe(1);

    act(() => {
      result.current.setValue("quantity", 40);
    });

    await act(async () => {
      await result.current.handleNext();
    });

    expect(result.current.submitError).toBeNull();
    expect(result.current.activeStep).toBe(2);
  });

  it("handles successful submission", async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ referenceNumber: "TRF-123" }),
        });
      }
      return mockFetch(url);
    });

    const onCompleteMock = jest.fn();
    const { result } = renderHook(() => useTransferFormLogic(onCompleteMock), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.initialLoading).toBe(false));

    act(() => {
      result.current.setValue("fromWarehouseId", 1);
      result.current.setValue("toWarehouseId", 2);
      result.current.setValue("productId", 1);
      result.current.setValue("quantity", 10);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.success).toContain("TRF-123");
    expect(onCompleteMock).toHaveBeenCalled();
    expect(result.current.activeStep).toBe(0);
  });
});
