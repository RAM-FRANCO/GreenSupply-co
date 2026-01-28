// pages/api/categories/index.ts
import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile, writeJsonFile } from "@/lib/dataService";
import { Category } from "@/types/category";
import { z } from "zod";

const CATEGORY_FILE = "categories.json";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  productCount: z.number().optional(),
  totalItems: z.number().optional(),
  totalValue: z.number().optional(),
});

import type { Product, Stock } from "@/types/inventory";

export default createApiHandler({
  GET: {
    handler: async (req, res) => {
      const categories = readJsonFile<Category>(CATEGORY_FILE);
      const products = readJsonFile<Product>("products.json");
      const stock = readJsonFile<Stock>("stock.json");

      const enrichedCategories = categories.map(cat => {
        const catProducts = products.filter(p => p.categoryId === cat.id);
        const productIds = catProducts.map(p => p.id);
        const catStock = stock.filter(s => productIds.includes(s.productId));

        const productCount = catProducts.length;
        const totalItems = catStock.reduce((sum, s) => sum + s.quantity, 0);
        const totalValue = catStock.reduce((sum, s) => {
          const product = catProducts.find(p => p.id === s.productId);
          return sum + (s.quantity * (product?.unitCost || 0));
        }, 0);

        return {
          ...cat,
          productCount,
          totalItems,
          totalValue
        };
      });

      res.status(200).json(enrichedCategories);
    },
  },
  POST: {
    schema: categorySchema,
    handler: async (req, res) => {
      const categories = readJsonFile<Category>(CATEGORY_FILE);
      const body = req.body; // Typed by schema

      const newCategory: Category = {
        ...body,
        id: body.id || body.name.toLowerCase().replace(/\s+/g, '-'),
        productCount: body.productCount ?? 0,
        totalItems: body.totalItems ?? 0,
        totalValue: body.totalValue ?? 0,
      };

      categories.push(newCategory);
      writeJsonFile(CATEGORY_FILE, categories);
      res.status(201).json(newCategory);
    },
  },
});
