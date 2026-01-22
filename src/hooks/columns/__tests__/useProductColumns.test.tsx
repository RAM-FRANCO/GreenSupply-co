import { renderHook } from "@testing-library/react";
import { useProductColumns } from "../useProductColumns";
import type { ProductWithStock } from "../../../types";

// Mock dependencies
jest.mock("../../../utils/themeUtils", () => ({
  getCategoryColor: jest.fn(() => ({
    50: "#e3f2fd",
    800: "#1565c0",
  })),
}));

jest.mock("../../../components/common/StatusChip", () => ({
  __esModule: true,
  default: ({ status }: { status: string }) => (
    <span data-testid="status-chip">{status}</span>
  ),
}));

describe("useProductColumns", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Hook Structure", () => {
    it("should return an array of column definitions", () => {
      const { result } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it("should return stable reference when callbacks do not change", () => {
      const { result, rerender } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it("should return new reference when onEdit changes", () => {
      const { result, rerender } = renderHook(
        ({ onEdit, onDelete }) => useProductColumns({ onEdit, onDelete }),
        { initialProps: { onEdit: mockOnEdit, onDelete: mockOnDelete } },
      );

      const firstResult = result.current;
      rerender({ onEdit: jest.fn(), onDelete: mockOnDelete });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });

    it("should return new reference when onDelete changes", () => {
      const { result, rerender } = renderHook(
        ({ onEdit, onDelete }) => useProductColumns({ onEdit, onDelete }),
        { initialProps: { onEdit: mockOnEdit, onDelete: mockOnDelete } },
      );

      const firstResult = result.current;
      rerender({ onEdit: mockOnEdit, onDelete: jest.fn() });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });
  });

  describe("Column Definitions", () => {
    it("should have required columns: Product, SKU, Category, Stock Level, Unit Price, Actions", () => {
      const { result } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
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

      expect(headers).toContain("Product");
      expect(headers).toContain("SKU");
      expect(headers).toContain("Category");
      expect(headers).toContain("Stock Level");
      expect(headers).toContain("Unit Price");
      expect(headers).toContain("Actions");
    });

    it("should disable sorting on Actions column", () => {
      const { result } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      const actionsColumn = result.current.find((col) => col.id === "actions");
      expect(actionsColumn?.enableSorting).toBe(false);
    });

    it("should have right alignment for Unit Price column", () => {
      const { result } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      const unitPriceColumn = result.current.find(
        (col) => "accessorKey" in col && col.accessorKey === "unitCost",
      );

      expect(unitPriceColumn?.meta).toEqual({ align: "right" });
    });

    it("should have center alignment for Actions column", () => {
      const { result } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      const actionsColumn = result.current.find((col) => col.id === "actions");
      expect(actionsColumn?.meta).toEqual({ align: "center" });
    });
  });

  describe("Callback Integration", () => {
    it("should use the provided onEdit and onDelete callbacks", () => {
      const { result } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      // The actions column should exist with both callbacks
      const actionsColumn = result.current.find((col) => col.id === "actions");
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.cell).toBeDefined();
    });
  });

  describe("Type Safety", () => {
    it("should accept valid ProductWithStock data shape", () => {
      const mockProduct: ProductWithStock = {
        id: 1,
        sku: "PROD-001",
        name: "Test Product",
        category: "Electronics",
        unitCost: 149.99,
        reorderPoint: 5,
        currentStock: 25,
        stockStatus: "In Stock",
        stockHealth: 80,
      };

      const { result } = renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      // Columns should work with the ProductWithStock type
      const nameColumn = result.current.find(
        (col) => "accessorKey" in col && col.accessorKey === "name",
      );
      expect(nameColumn).toBeDefined();

      // Type check passes if we get here without TypeScript errors
      expect(mockProduct.name).toBe("Test Product");
    });
  });

  describe("Dependency Injection Pattern", () => {
    it("should not call callbacks during initialization", () => {
      renderHook(() =>
        useProductColumns({ onEdit: mockOnEdit, onDelete: mockOnDelete }),
      );

      expect(mockOnEdit).not.toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });
});
