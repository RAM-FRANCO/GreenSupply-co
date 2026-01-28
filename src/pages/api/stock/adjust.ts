// pages/api/stock/adjust.ts
import { createApiHandler } from '@/utils/apiHandler';
import { readJsonFile, writeJsonFile } from '@/lib/dataService';
import { z } from 'zod';

// Define local schema for adjustment
const adjustSchema = z.object({
  productId: z.number(),
  warehouseId: z.number(),
  adjustmentQuantity: z.number(),
  reason: z.string().optional()
});

interface Stock {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  lastUpdated: string;
}

const STOCK_FILE = 'stock.json';

export default createApiHandler({
  POST: {
    schema: adjustSchema,
    handler: async (req, res) => {
      const { productId, warehouseId, adjustmentQuantity, reason } = req.body;
      const stockData = readJsonFile<Stock>(STOCK_FILE);

      const stockIndex = stockData.findIndex(
        (s) => s.productId === productId && s.warehouseId === warehouseId
      );

      let newStockRecord: Stock;

      if (stockIndex > -1) {
        const currentStock = stockData[stockIndex];
        const newQuantity = Math.max(0, currentStock.quantity + adjustmentQuantity);

        stockData[stockIndex] = {
          ...currentStock,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
        };
        newStockRecord = stockData[stockIndex];
      } else {
        const maxId = stockData.reduce((max, s) => Math.max(max, s.id), 0);
        const newQuantity = Math.max(0, adjustmentQuantity);

        newStockRecord = {
          id: maxId + 1,
          productId,
          warehouseId,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
        };
        stockData.push(newStockRecord);
      }

      writeJsonFile(STOCK_FILE, stockData);

      console.log(`[Stock Adjustment] Product: ${productId}, Warehouse: ${warehouseId}, Change: ${adjustmentQuantity}, Reason: ${reason}`);

      res.status(200).json(newStockRecord);
    },
  },
});
