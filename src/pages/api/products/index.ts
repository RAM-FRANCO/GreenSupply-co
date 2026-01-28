// pages/api/products/index.ts
import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile, writeJsonFile, getNextId } from "@/lib/dataService";
import { generateUniqueSlug } from "@/utils/stringUtils";
import { ProductFormSchema, ProductFormData } from "@/schemas/inventorySchema";
import type { Product, Stock } from "@/types/inventory";

const PRODUCT_FILE = "products.json";

export default createApiHandler({
  GET: {
    handler: async (req, res) => {
      const products = readJsonFile<Product>(PRODUCT_FILE);
      const stock = readJsonFile<Stock>("stock.json");

      // Parse Query Params
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search as string || "").toLowerCase();
      const category = req.query.category as string;

      const filtered = products.map(product => {
        // Calculate stock metrics
        const productStock = stock.filter(s => s.productId === product.id);
        const currentStock = productStock.reduce((sum, s) => sum + s.quantity, 0);

        // Determine status
        let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
        if (currentStock === 0) stockStatus = 'Out of Stock';
        else if (currentStock <= product.reorderPoint) stockStatus = 'Low Stock';

        // Calculate health (0-100)
        // 100% healthy = 3x reorder point (heuristic)
        const healthyThreshold = product.reorderPoint * 3;
        const stockHealth = Math.min(Math.round((currentStock / healthyThreshold) * 100), 100);

        return {
          ...product,
          currentStock,
          stockStatus,
          stockHealth
        };
      }).filter(p => {
        const matchesSearch = !search ||
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search);
        const matchesCategory = !category || p.categoryId === category;
        const matchesStatus = !req.query.status || req.query.status === 'all' ||
          (req.query.status === 'low-stock' && p.stockStatus === 'Low Stock') ||
          (req.query.status === 'out-of-stock' && p.stockStatus === 'Out of Stock') ||
          (req.query.status === 'in-stock' && p.stockStatus === 'In Stock');

        return matchesSearch && matchesCategory && matchesStatus;
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
    schema: ProductFormSchema,
    handler: async (req, res) => {
      const products = readJsonFile<Product>(PRODUCT_FILE);
      const body = req.body as ProductFormData;
      const existingSlugs = products.map(p => p.slug);
      const slug = generateUniqueSlug(body.name, existingSlugs);

      const newProduct: Product = {
        id: getNextId(products),
        slug,
        ...body,
      };

      products.push(newProduct);
      writeJsonFile(PRODUCT_FILE, products);

      res.status(201).json(newProduct);
    },
  },
});
