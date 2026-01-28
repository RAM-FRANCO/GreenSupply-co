// pages/api/alerts/[id].ts
import { createApiHandler } from '@/utils/apiHandler';
import { getAlertById, updateAlertStatus } from '@/lib/alertService';
import { alertStatusUpdateSchema } from '@/schemas/alertSchema';

export default createApiHandler({
  GET: {
    handler: async (req, res) => {
      const { id } = req.query;
      const alertId = Number(id);

      if (isNaN(alertId)) {
        res.status(400).json({ message: 'Invalid alert ID' });
        return;
      }

      const record = getAlertById(alertId);
      if (!record) {
        res.status(404).json({ message: 'Alert tracking record not found' });
        return;
      }

      res.status(200).json(record);
    },
  },
  PATCH: {
    schema: alertStatusUpdateSchema,
    handler: async (req, res) => {
      const { id } = req.query;
      const alertId = Number(id);

      if (isNaN(alertId)) {
        res.status(400).json({ message: 'Invalid alert ID' });
        return;
      }

      const record = getAlertById(alertId);
      if (!record) {
        res.status(404).json({ message: 'Alert tracking record not found' });
        return;
      }

      // req.body is validated
      const updated = updateAlertStatus(
        record.productId,
        record.warehouseId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.body as any // validation ensures shape
      );

      res.status(200).json(updated);
    },
  },
});
