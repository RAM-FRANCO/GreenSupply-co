/**
 * Constants for the transfer form wizard.
 * DRY: Extract shared values to avoid magic numbers and strings.
 */
import type { TransferFormData } from "@/schemas/transferSchema";

/** Steps in the transfer wizard */
export const FORM_STEPS = [
  "Select Route",
  "Choose Items",
  "Review & Confirm",
] as const;

/** Stock warning threshold percentage */
export const STOCK_WARNING_THRESHOLD_PERCENT = 80;

/** Low stock warning threshold (units) */
export const LOW_STOCK_THRESHOLD = 10;

/** Fields to validate for each step */
export const STEP_VALIDATION_FIELDS: Record<
  number,
  (keyof TransferFormData)[]
> = {
  0: ["fromWarehouseId", "toWarehouseId"],
  1: ["productId", "quantity"],
};
