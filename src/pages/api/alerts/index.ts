// pages/api/alerts/index.ts
import { createApiHandler } from '@/utils/apiHandler';
import { queryAlerts, updateAlertStatus } from '@/lib/alertService';
import type { AlertSeverity, AlertStatus } from '@/types/alerts';
import { createAlertSchema } from '@/schemas/alertSchema';

export default createApiHandler({
  GET: {
    handler: async (req, res) => {
      // Manual query parsing/validation since querySchema is optional
      // Ideally we would add Zod query schema here
      const severity = req.query.severity as AlertSeverity | undefined;
      const status = req.query.status as AlertStatus | undefined;
      const warehouseId = req.query.warehouseId ? Number(req.query.warehouseId) : undefined;

      const alerts = queryAlerts({ severity, status, warehouseId });
      res.status(200).json(alerts);
    },
  },
  POST: {
    schema: createAlertSchema,
    handler: async (req, res) => {
      // req.body is already validated and typed by schema
      // However, TypeScript might need a hint if createAlertSchema doesn't exactly match expected args
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = req.body as any; // safe cast because of validation

      const record = updateAlertStatus(
        data.productId,
        data.warehouseId,
        {
          status: data.status,
          snoozeUntil: data.snoozeUntil,
          notes: data.notes,
        }
      );

      res.status(200).json(record);
    },
  },
});
