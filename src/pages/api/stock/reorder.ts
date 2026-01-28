// pages/api/stock/reorder.ts
import { createApiHandler } from '@/utils/apiHandler';
import { reorderStock } from '@/lib/stockService';
import { z } from 'zod';

const reorderSchema = z.object({
  productId: z.number(),
  warehouseId: z.number(),
  quantity: z.number()
});

export default createApiHandler({
  POST: {
    schema: reorderSchema,
    handler: async (req, res) => {
      const { productId, warehouseId, quantity } = req.body;
      // reorderStock now creates a PO and returns { success, message }
      const result = reorderStock(productId, warehouseId, quantity);
      res.status(200).json(result);
    },
  },
});
