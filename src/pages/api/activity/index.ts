import { createApiHandler } from "@/utils/apiHandler";
import { readJsonFile } from "@/lib/dataService";
import type { Transfer, ActivityEvent } from "@/types/transfers";

const TRANSFER_FILE = "transfers.json";

export default createApiHandler({
    GET: {
        handler: async (req, res) => {
            const { productId, limit = "5" } = req.query;
            const transfers = readJsonFile<Transfer>(TRANSFER_FILE);

            let filtered = transfers;
            if (productId) {
                const pId = Number(productId);
                filtered = transfers.filter(t => t.productId === pId);
            }

            // Sort by createdAt desc
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const limited = filtered.slice(0, Number(limit));

            const activity: ActivityEvent[] = limited.map(t => ({
                id: t.id,
                type: t.status === 'completed' ? 'completed' : 'pending', // simplistic mapping
                referenceNumber: t.referenceNumber,
                description: `Transfer of ${t.quantity} items`, // Could be more descriptive if we enriched it
                timestamp: t.createdAt
            }));

            res.status(200).json(activity);
        },
    },
});
