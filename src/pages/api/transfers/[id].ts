/**
 * API endpoint for single transfer
 * GET /api/transfers/:id - Get transfer by ID
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getTransferById } from '@/lib/transferService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const transferId = Number(id);
  if (Number.isNaN(transferId)) {
    return res.status(400).json({ message: 'Invalid transfer ID' });
  }

  const transfer = getTransferById(transferId);
  if (!transfer) {
    return res.status(404).json({ message: 'Transfer not found' });
  }

  return res.status(200).json(transfer);
}
