/**
 * API endpoint for transfers collection
 * GET /api/transfers - List transfers with filtering
 * POST /api/transfers - Create new transfer
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  queryTransfers,
  executeTransfer,
  ValidationError,
} from '@/lib/transferService';
import type { TransferQueryParams, CreateTransferRequest } from '@/types/transfers';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Parse query params
      const params: TransferQueryParams = {
        productId: req.query.productId ? Number(req.query.productId) : undefined,
        warehouseId: req.query.warehouseId ? Number(req.query.warehouseId) : undefined,
        status: req.query.status as TransferQueryParams['status'],
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      };

      const result = queryTransfers(params);
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const request: CreateTransferRequest = req.body;
      const transfer = executeTransfer(request);
      return res.status(201).json(transfer);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({
        message: error.message,
        code: error.code,
      });
    }

    console.error('Transfer API error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
