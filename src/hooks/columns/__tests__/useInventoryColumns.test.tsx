import { renderHook } from "@testing-library/react";
import { useInventoryColumns } from "../useInventoryColumns";
import type { InventoryItem } from "../../../types/inventory";

// Mock the theme to avoid import issues
jest.mock("../../../theme/theme", () => ({
  customPalette: {
    status: {
      lowStock: { bg: "#ffebee", text: "#c62828" },
      inStock: { bg: "#e8f5e9", text: "#2e7d32" },
    },
  },
}));

describe("useInventoryColumns", () => {
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Hook Structure", () => {
    it("should return an array of column definitions", () => {
      const { result } = renderHook(() =>
        useInventoryColumns({ onEdit: mockOnEdit }),
      );

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it("should return stable reference when onEdit does not change", () => {
      const { result, rerender } = renderHook(() =>
        useInventoryColumns({ onEdit: mockOnEdit }),
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it("should return new reference when onEdit changes", () => {
      const { result, rerender } = renderHook(
        ({ onEdit }) => useInventoryColumns({ onEdit }),
        { initialProps: { onEdit: mockOnEdit } },
      );

      const firstResult = result.current;
      const newOnEdit = jest.fn();
      rerender({ onEdit: newOnEdit });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });
  });

  describe("Column Definitions", () => {
    it("should have required columns: SKU, Product Name, Category, Total Stock, Reorder Point, Status, Actions", () => {
      const { result } = renderHook(() =>
        useInventoryColumns({ onEdit: mockOnEdit }),
      );

      const headers = result.current.map((col) => {
        if ("header" in col && typeof col.header === "string") {
          return col.header;
        }
        // For display columns, return the header (which may be a string)
        if (col.id && "header" in col) {
          return col.header;
        }
        return col.id;
      });

      expect(headers).toContain("SKU");
      expect(headers).toContain("Product Name");
      expect(headers).toContain("Category");
      expect(headers).toContain("Total Stock");
      expect(headers).toContain("Reorder Point");
      expect(headers).toContain("Status");
      expect(headers).toContain("Actions");
    });

    it("should disable sorting on Status and Actions columns", () => {
      const { result } = renderHook(() =>
        useInventoryColumns({ onEdit: mockOnEdit }),
      );

      const statusColumn = result.current.find((col) => col.id === "status");
      const actionsColumn = result.current.find((col) => col.id === "actions");

      expect(statusColumn?.enableSorting).toBe(false);
      expect(actionsColumn?.enableSorting).toBe(false);
    });

    it("should have right alignment for numeric columns", () => {
      const { result } = renderHook(() =>
        useInventoryColumns({ onEdit: mockOnEdit }),
      );

      const totalStockColumn = result.current.find(
        (col) => "accessorKey" in col && col.accessorKey === "totalQuantity",
      );
      const reorderPointColumn = result.current.find(
        (col) => "accessorKey" in col && col.accessorKey === "reorderPoint",
      );
      const actionsColumn = result.current.find((col) => col.id === "actions");

      expect(totalStockColumn?.meta).toEqual({ align: "right" });
      expect(reorderPointColumn?.meta).toEqual({ align: "right" });
      expect(actionsColumn?.meta).toEqual({ align: "right" });
    });
  });

  describe("Callback Integration", () => {
    it("should use the provided onEdit callback", () => {
      const { result } = renderHook(() =>
        useInventoryColumns({ onEdit: mockOnEdit }),
      );

      // The actions column should exist
      const actionsColumn = result.current.find((col) => col.id === "actions");
      expect(actionsColumn).toBeDefined();

      // Verify the column can render (basic smoke test)
      expect(actionsColumn?.cell).toBeDefined();
    });
  });

  describe("Type Safety", () => {
    it("should accept valid InventoryItem data shape", () => {
      const mockItem: InventoryItem = {
        id: 1,
        sku: "TEST-001",
        name: "Test Product",
        category: "Electronics",
        unitCost: 99.99,
        reorderPoint: 10,
        totalQuantity: 50,
        isLowStock: false,
      };

      const { result } = renderHook(() =>
        useInventoryColumns({ onEdit: mockOnEdit }),
      );

      // Columns should work with the InventoryItem type
      const skuColumn = result.current.find(
        (col) => "accessorKey" in col && col.accessorKey === "sku",
      );
      expect(skuColumn).toBeDefined();

      // Type check passes if we get here without TypeScript errors
      expect(mockItem.sku).toBe("TEST-001");
    });
  });
});
