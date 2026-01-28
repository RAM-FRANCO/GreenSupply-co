// pages/api/warehouses/index.ts
import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile, writeJsonFile, getNextId } from "@/lib/dataService";
import { WarehouseFormSchema, WarehouseFormData } from "@/schemas/inventorySchema";
import type { Warehouse, Stock } from "@/types/inventory";

const WAREHOUSE_FILE = "warehouses.json";
const STOCK_FILE = "stock.json";

export default createApiHandler({
  GET: {


    // ... inside handler
    handler: async (req, res) => {
      const warehouses = readJsonFile<Warehouse>(WAREHOUSE_FILE);
      const stocks = readJsonFile<Stock>(STOCK_FILE);

      // Calculate stats
      const stats = stocks.reduce((acc, item) => {
        if (!acc[item.warehouseId]) {
          acc[item.warehouseId] = { skuCount: 0, totalQuantity: 0 };
        }
        acc[item.warehouseId].skuCount++;
        acc[item.warehouseId].totalQuantity += item.quantity;
        return acc;
      }, {} as Record<number, { skuCount: number; totalQuantity: number }>);

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search as string || "").toLowerCase();

      const enrichedWarehouses = warehouses.map(w => ({
        ...w,
        skuCount: stats[w.id]?.skuCount || 0,
        totalQuantity: stats[w.id]?.totalQuantity || 0
      }));

      const filtered = enrichedWarehouses.filter(w => {
        if (!search) return true;
        return w.name.toLowerCase().includes(search) ||
          w.location.toLowerCase().includes(search);
      });

      const total = filtered.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = filtered.slice(start, end);

      res.status(200).json({
        data: paginated,
        meta: {
          total,
          page,
          limit
        }
      });
    },
  },
  POST: {
    schema: WarehouseFormSchema,
    handler: async (req, res) => {
      const warehouses = readJsonFile<Warehouse>(WAREHOUSE_FILE);
      const body = req.body as WarehouseFormData;
      const newWarehouse: Warehouse = {
        id: getNextId(warehouses),
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
        ...body,
      };

      warehouses.push(newWarehouse);
      writeJsonFile(WAREHOUSE_FILE, warehouses);

      res.status(201).json(newWarehouse);
    },
  },
});
