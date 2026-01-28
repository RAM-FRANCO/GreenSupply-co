import { z } from "zod";

/**
 * Schema for updating alert status (PATCH)
 */
export const alertStatusUpdateSchema = z.object({
  status: z.enum(["active", "acknowledged", "resolved", "snoozed"]),
  snoozeUntil: z.string().optional(), // ISO date string required if status is snoozed
  notes: z.string().optional(),
}).refine((data) => {
  if (data.status === "snoozed" && !data.snoozeUntil) {
    return false;
  }
  return true;
}, {
  message: "snoozeUntil is required when status is snoozed",
  path: ["snoozeUntil"],
});

/**
 * Schema for creating a new alert tracking record (POST)
 * Used when a user interacts with a generated alert for the first time
 */
export const createAlertSchema = z.object({
  productId: z.number().int().positive(),
  warehouseId: z.number().int().positive(),
  status: z.enum(["acknowledged", "snoozed"]),
  snoozeUntil: z.string().optional(),
  notes: z.string().optional(),
});

export type AlertStatusUpdate = z.infer<typeof alertStatusUpdateSchema>;
export type CreateAlertRequest = z.infer<typeof createAlertSchema>;
