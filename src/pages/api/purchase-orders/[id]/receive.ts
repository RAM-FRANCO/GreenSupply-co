import { createApiHandler } from '@/utils/apiHandler';
import { receivePurchaseOrder } from '@/lib/stockService';



export default createApiHandler({
    POST: {
        handler: async (req, res) => {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                res.status(400).json({ message: 'Invalid Order ID' });
                return;
            }

            const orderId = parseInt(id, 10);
            const result = receivePurchaseOrder(orderId);
            res.status(200).json(result);
        },
    },
});
