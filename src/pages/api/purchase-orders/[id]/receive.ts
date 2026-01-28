import { createApiHandler } from '@/utils/apiHandler';
import { receivePurchaseOrder } from '@/lib/stockService';
import { z } from 'zod';

const receiveSchema = z.object({
    // No body needed for simple receive, ID is in URL
});

export default createApiHandler({
    POST: {
        // schema: receiveSchema, // Removed to allow empty/any body
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
