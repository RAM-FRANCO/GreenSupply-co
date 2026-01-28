// pages/api/products/[id].ts
import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile, writeJsonFile } from "@/lib/dataService";
import { ProductFormSchema } from "@/schemas/inventorySchema";
import { generateUniqueSlug } from "@/utils/stringUtils";
import type { Product, Stock } from "@/types/inventory";
import type { AlertRecord } from "@/types/alerts";
import type { PurchaseOrder } from "@/types/purchaseOrder";

const PRODUCT_FILE = "products.json";

export default createApiHandler({
  GET: {
    handler: async (req, res) => {
      const { id } = req.query;
      const param = id as string;
      const productId = Number(param);

      const products = readJsonFile<Product>(PRODUCT_FILE);

      let product;
      if (!isNaN(productId)) {
        console.log(`[API] Fetching product by ID: ${productId}`);
        product = products.find((p) => p.id === productId);
      } else {
        console.log(`[API] Fetching product by Slug: ${param}`);
        product = products.find((p) => p.slug === param);
      }

      if (product) {
        console.log(`[API] Found product: ${product.name}`);
        res.status(200).json(product);
      } else {
        console.log(`[API] Product not found`);
        res.status(404).json({ message: "Product not found" });
      }
    },
  },
  PUT: {
    schema: ProductFormSchema.partial(),
    handler: async (req, res) => {
      const { id } = req.query;
      const productId = Number(id);

      const products = readJsonFile<Product>(PRODUCT_FILE);
      const index = products.findIndex((p) => p.id === productId);

      if (index === -1) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      const updatedProduct = {
        ...products[index],
        ...req.body,
        id: productId, // Protect ID
      };

      // Update slug if name changed
      if (req.body.name && req.body.name !== products[index].name) {
        const existingSlugs = products.map(p => p.slug);
        updatedProduct.slug = generateUniqueSlug(req.body.name, existingSlugs, products[index].slug);
      }

      products[index] = updatedProduct;

      writeJsonFile(PRODUCT_FILE, products);
      res.status(200).json(products[index]);
    },
  },
  DELETE: {
    handler: async (req, res) => {
      const { id } = req.query;
      const productId = Number(id);

      const products = readJsonFile<Product>(PRODUCT_FILE);
      const index = products.findIndex((p) => p.id === productId);

      if (index === -1) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      // Cascading Delete
      // 1. Delete Stock
      const stock = readJsonFile<Stock>("stock.json");
      const newStock = stock.filter((s) => s.productId !== productId);
      if (stock.length !== newStock.length) {
        writeJsonFile("stock.json", newStock);
      }

      // 2. Delete Alerts
      const alerts = readJsonFile<AlertRecord>("alerts.json");
      const newAlerts = alerts.filter((a) => a.productId !== productId);
      if (alerts.length !== newAlerts.length) {
        writeJsonFile("alerts.json", newAlerts);
      }

      // 3. Delete Purchase Orders (Cascade)
      const pos = readJsonFile<PurchaseOrder>("purchase_orders.json");
      const newPos = pos.filter((po) => po.productId !== productId);
      if (pos.length !== newPos.length) {
        writeJsonFile("purchase_orders.json", newPos);
      }

      products.splice(index, 1);
      writeJsonFile(PRODUCT_FILE, products);
      res.status(204).end();
    },
  },
});
