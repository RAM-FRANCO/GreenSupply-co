import { createApiHandler } from '@/utils/apiHandler';
import { getPurchaseOrders } from '@/lib/stockService';

export default createApiHandler({
    GET: {
        handler: async (req, res) => {
            const orders = getPurchaseOrders();
            res.status(200).json(orders);
        },
    },
});
