/**
 * Zod validation schema for the stock transfer form.
 * Used with react-hook-form for type-safe form validation.
 */
import { z } from "zod";

/**
 * Schema for Step 1: Route Selection
 */
export const routeSelectionSchema = z.object({
  fromWarehouseId: z
    .number({ message: "Please select an origin warehouse" })
    .int()
    .positive(),
  toWarehouseId: z
    .number({ message: "Please select a destination warehouse" })
    .int()
    .positive(),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
  message: "Origin and destination cannot be the same",
  path: ["toWarehouseId"],
});

/**
 * Schema for Step 2: Item Selection
 */
export const itemSelectionSchema = z.object({
  productId: z
    .number({ message: "Please select a product" })
    .int()
    .positive(),
  quantity: z
    .number({ message: "Please enter a valid quantity" })
    .int({ message: "Quantity must be a whole number" })
    .positive({ message: "Quantity must be greater than 0" }),
  notes: z.string().optional(),
});

/**
 * Complete transfer form schema combining all steps
 */
export const transferFormSchema = z.object({
  fromWarehouseId: z.number().int().positive().optional(),
  toWarehouseId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  quantity: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

/**
 * Schema for final submission validation
 */
export const transferSubmitSchema = routeSelectionSchema.and(itemSelectionSchema);

/**
 * TypeScript type inferred from the schema
 */
export type TransferFormData = z.infer<typeof transferFormSchema>;
export type TransferSubmitData = z.infer<typeof transferSubmitSchema>;
