// pages/api/transfers/index.ts
import { createApiHandler } from '@/utils/apiHandler';
import {
  queryTransfers,
  executeTransfer,
  ValidationError,
} from '@/lib/transferService';
import type { TransferQueryParams, CreateTransferRequest } from '@/types/transfers';
import { transferSubmitSchema } from '@/schemas/transferSchema';

export default createApiHandler({
  GET: {
    handler: async (req, res) => {
      // Manual query parsing (could be improved with z.object for querySchema later)
      const q = req.query as Record<string, string | undefined>;

      const params: TransferQueryParams = {
        productId: q.productId ? Number(q.productId) : undefined,
        warehouseId: q.warehouseId ? Number(q.warehouseId) : undefined,
        status: q.status as TransferQueryParams['status'],
        startDate: q.startDate,
        endDate: q.endDate,
        limit: q.limit ? Number(q.limit) : undefined,
        offset: q.offset ? Number(q.offset) : undefined,
      };

      const result = queryTransfers(params);
      res.status(200).json(result);
    },
  },
  POST: {
    schema: transferSubmitSchema,
    handler: async (req, res) => {
      try {
        const request = req.body as CreateTransferRequest;
        const transfer = await executeTransfer(request);
        res.status(201).json(transfer);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(error.statusCode).json({
            message: error.message,
            code: error.code,
          });
          return;
        }
        throw error; // Let apiHandler handle 500s
      }
    },
  },
});
