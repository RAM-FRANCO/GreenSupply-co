// pages/api/warehouses/[id].ts
import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile, writeJsonFile } from "@/lib/dataService";
import { WarehouseFormSchema } from "@/schemas/inventorySchema";
import type { Warehouse, Stock } from "@/types/inventory";

const WAREHOUSE_FILE = "warehouses.json";

export default createApiHandler({
  GET: {
    handler: async (req, res) => {
      const { id } = req.query;
      const warehouseId = Number(id);

      const warehouses = readJsonFile<Warehouse>(WAREHOUSE_FILE);
      const warehouse = warehouses.find((w) => w.id === warehouseId);

      if (warehouse) {
        res.status(200).json(warehouse);
      } else {
        res.status(404).json({ message: "Warehouse not found" });
      }
    },
  },
  PUT: {
    schema: WarehouseFormSchema.partial(),
    handler: async (req, res) => {
      const { id } = req.query;
      const warehouseId = Number(id);

      const warehouses = readJsonFile<Warehouse>(WAREHOUSE_FILE);
      const index = warehouses.findIndex((w) => w.id === warehouseId);

      if (index === -1) {
        res.status(404).json({ message: "Warehouse not found" });
        return;
      }

      warehouses[index] = {
        ...warehouses[index],
        ...req.body,
        id: warehouseId, // Ensure ID cannot be overwritten
      };
      writeJsonFile(WAREHOUSE_FILE, warehouses);
      res.status(200).json(warehouses[index]);
    },
  },
  DELETE: {
    handler: async (req, res) => {
      const { id } = req.query;
      const warehouseId = Number(id);

      const warehouses = readJsonFile<Warehouse>(WAREHOUSE_FILE);
      const index = warehouses.findIndex((w) => w.id === warehouseId);

      if (index === -1) {
        res.status(404).json({ message: "Warehouse not found" });
        return;
      }

      // Cascading Delete: Remove associated Stock and Alerts
      const stock = readJsonFile<Stock>("stock.json");
      const newStock = stock.filter((s) => s.warehouseId !== warehouseId);
      if (stock.length !== newStock.length) {
        writeJsonFile("stock.json", newStock);
      }

      // Remove alerts for this warehouse
      // Note: We need to define AlertRecord or type it as any if not available easily, but better to import
      // Assuming generic structure or importing types
      const alerts = readJsonFile<any>("alerts.json");
      const newAlerts = alerts.filter((a: any) => a.warehouseId !== warehouseId);
      if (alerts.length !== newAlerts.length) {
        writeJsonFile("alerts.json", newAlerts);
      }

      warehouses.splice(index, 1);
      writeJsonFile(WAREHOUSE_FILE, warehouses);
      res.status(204).end();
    },
  },
});
