// pages/api/categories/[id].ts
import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile, writeJsonFile } from "@/lib/dataService";
import { Category } from "@/types/category";
import type { Product, Stock } from "@/types/inventory";
import { z } from "zod";

const CATEGORY_FILE = "categories.json";

// For updates, we allow partial fields
const updateCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  productCount: z.number().optional(),
  totalItems: z.number().optional(),
  totalValue: z.number().optional(),
});

export default createApiHandler({
  PUT: {
    schema: updateCategorySchema,
    handler: async (req, res) => {
      const { id } = req.query;
      const categories = readJsonFile<Category>(CATEGORY_FILE);
      const index = categories.findIndex((c) => c.id === id);

      if (index === -1) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      categories[index] = { ...categories[index], ...req.body };
      writeJsonFile(CATEGORY_FILE, categories);
      res.status(200).json(categories[index]);
    },
  },
  DELETE: {
    handler: async (req, res) => {
      const { id } = req.query;
      const categoryId = id as string; // categories use string IDs
      const categories = readJsonFile<Category>(CATEGORY_FILE);
      const newCategories = categories.filter((c) => c.id !== categoryId);

      if (categories.length === newCategories.length) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      // Cascading Delete
      // 1. Identify products in this category
      const products = readJsonFile<Product>("products.json");
      const productsToDelete = products.filter(p => p.categoryId === categoryId);
      const productIds = productsToDelete.map(p => p.id);

      if (productIds.length > 0) {
        // 2. Delete these products
        const newProducts = products.filter(p => p.categoryId !== categoryId);
        writeJsonFile("products.json", newProducts);

        // 3. Delete Stock for these products
        const stock = readJsonFile<Stock>("stock.json");
        const newStock = stock.filter(s => !productIds.includes(s.productId));
        if (stock.length !== newStock.length) {
          writeJsonFile("stock.json", newStock);
        }

        // 4. Delete Alerts for these products
        const alerts = readJsonFile<any>("alerts.json");
        const newAlerts = alerts.filter((a: any) => !productIds.includes(a.productId));
        if (alerts.length !== newAlerts.length) {
          writeJsonFile("alerts.json", newAlerts);
        }
      }

      writeJsonFile(CATEGORY_FILE, newCategories);
      res.status(200).json({ message: "Category deleted successfully" });
    },
  },
});
