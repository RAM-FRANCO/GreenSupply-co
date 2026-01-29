import { createApiHandler } from '@/utils/apiHandler';
import { getPurchaseOrders, createPurchaseOrder } from '@/lib/stockService';

export default createApiHandler({
    GET: {
        handler: async (req, res) => {
            const orders = getPurchaseOrders();
            res.status(200).json(orders);
        },
    },
    POST: {
        handler: async (req, res) => {
            const { productId, warehouseId, quantity } = req.body;
            // Basic validation
            if (!productId || !warehouseId || !quantity) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const result = createPurchaseOrder(productId, warehouseId, quantity); // Ensure this function is imported
            res.status(201).json(result);
        }
    }
});
