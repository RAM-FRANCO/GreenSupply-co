/**
 * Zod schemas for inventory API response validation.
 * These mirror the TypeScript interfaces in types/inventory.ts but add runtime validation.
 */
import { z } from "zod";

/** Product schema */
export const ProductSchema = z.object({
  id: z.number(),
  slug: z.string(),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  categoryId: z.string(),
  unitCost: z.number(),
  reorderPoint: z.number(),
  description: z.string().optional(),
  image: z.string().optional(),
});

/** Warehouse schema */
export const WarehouseSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  code: z.string(),
  slug: z.string(),
});

/** Stock schema */
export const StockSchema = z.object({
  id: z.number(),
  productId: z.number(),
  warehouseId: z.number(),
  quantity: z.number(),
});

/** Array validators for API responses */
export const ProductArraySchema = z.array(ProductSchema);
export const WarehouseArraySchema = z.array(WarehouseSchema);
export const StockArraySchema = z.array(StockSchema);

// ============================================================================
// FORM VALIDATION SCHEMAS
// These are used with react-hook-form for client-side validation
// ============================================================================

/** Form validation schema for creating/editing products */
export const ProductFormSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  unitCost: z
    .number({ message: "Unit cost is required" })
    .min(0, "Unit cost must be non-negative"),
  reorderPoint: z
    .number({ message: "Reorder point is required" })
    .int("Reorder point must be a whole number")
    .min(0, "Reorder point must be non-negative"),
  description: z.string().optional(),
  image: z
    .string()
    .refine(
      (val) => val === "" || val.startsWith("/") || z.string().url().safeParse(val).success,
      { message: "Must be a valid URL or local path" }
    )
    .optional()
    .or(z.literal("")),
});

/** Form validation schema for creating/editing warehouses */
export const WarehouseFormSchema = z.object({
  code: z.string().min(1, "Warehouse code is required"),
  name: z.string().min(1, "Warehouse name is required"),
  location: z.string().min(1, "Location is required"),
  managerName: z.string().optional(),
  maxSlots: z.number().min(1, "Max slots must be at least 1").default(500),
  type: z.enum(["Distribution Center", "Fulfillment Center", "Cold Storage", "Retail Store"]).default("Distribution Center"),
});

/** Form validation schema for adding/editing stock */
export const StockFormSchema = z.object({
  productId: z
    .number({ message: "Please select a product" })
    .int()
    .positive("Please select a product"),
  warehouseId: z
    .number({ message: "Please select a warehouse" })
    .int()
    .positive("Please select a warehouse"),
  quantity: z
    .number({ message: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
});

/** Type exports for form data */
export type ProductFormData = z.infer<typeof ProductFormSchema>;
export type WarehouseFormData = z.infer<typeof WarehouseFormSchema>;
export type StockFormData = z.infer<typeof StockFormSchema>;
