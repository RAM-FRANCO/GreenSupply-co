/**
 * Transfer service - business logic for stock transfers.
 * Uses auditService for tracking all stock changes.
 */
import type {
  Transfer,
  EnrichedTransfer,
  CreateTransferRequest,
  TransferQueryParams,
  PaginatedResponse,
} from '@/types/transfers';
import type { Product, Warehouse, Stock } from '@/types/inventory';
import { logStockChanges } from './auditService';
import {
  readJsonFile,
  writeJsonFile,
  getNextId,
  generateReferenceNumber,
  getCurrentTimestamp,
} from './dataService';

// File names
const TRANSFERS_FILE = 'transfers.json';
const STOCK_FILE = 'stock.json';
const PRODUCTS_FILE = 'products.json';
const WAREHOUSES_FILE = 'warehouses.json';

// ============================================================================
// Validation Errors
// ============================================================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate transfer request - throws ValidationError on invalid input
 */
export const validateTransfer = (req: CreateTransferRequest): void => {
  const { productId, fromWarehouseId, toWarehouseId, quantity } = req;

  // Required fields
  if (!productId || !fromWarehouseId || !toWarehouseId || quantity === undefined) {
    throw new ValidationError(
      'Missing required fields: productId, fromWarehouseId, toWarehouseId, quantity',
      'MISSING_FIELDS'
    );
  }

  // Quantity validation
  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    throw new ValidationError(
      'Quantity must be a positive integer',
      'INVALID_QUANTITY'
    );
  }

  // Same warehouse check
  if (fromWarehouseId === toWarehouseId) {
    throw new ValidationError(
      'Cannot transfer to the same warehouse',
      'SAME_WAREHOUSE'
    );
  }

  // Verify product exists
  const products = readJsonFile<Product>(PRODUCTS_FILE);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    throw new ValidationError(
      `Product with ID ${productId} not found`,
      'PRODUCT_NOT_FOUND',
      404
    );
  }

  // Verify warehouses exist
  const warehouses = readJsonFile<Warehouse>(WAREHOUSES_FILE);
  const fromWarehouse = warehouses.find((w) => w.id === fromWarehouseId);
  if (!fromWarehouse) {
    throw new ValidationError(
      `Source warehouse with ID ${fromWarehouseId} not found`,
      'SOURCE_WAREHOUSE_NOT_FOUND',
      404
    );
  }
  const toWarehouse = warehouses.find((w) => w.id === toWarehouseId);
  if (!toWarehouse) {
    throw new ValidationError(
      `Destination warehouse with ID ${toWarehouseId} not found`,
      'DEST_WAREHOUSE_NOT_FOUND',
      404
    );
  }

  // Verify sufficient stock
  const stock = readJsonFile<Stock>(STOCK_FILE);
  const sourceStock = stock.find(
    (s) => s.productId === productId && s.warehouseId === fromWarehouseId
  );
  if (!sourceStock || sourceStock.quantity < quantity) {
    const available = sourceStock?.quantity ?? 0;
    throw new ValidationError(
      `Insufficient stock. Available: ${available}, Requested: ${quantity}`,
      'INSUFFICIENT_STOCK',
      422
    );
  }
};

// ============================================================================
// Transfer Execution
// ============================================================================

/**
 * Execute a stock transfer between warehouses.
 * Creates audit entries and updates stock levels atomically.
 */
export const executeTransfer = (req: CreateTransferRequest): Transfer => {
  const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = req;

  // Validate first
  validateTransfer(req);

  // Read current data
  const transfers = readJsonFile<Transfer>(TRANSFERS_FILE);
  const stock = readJsonFile<Stock>(STOCK_FILE);

  // Generate reference number
  const referenceNumber = generateReferenceNumber('TRF', transfers);
  const timestamp = getCurrentTimestamp();

  // Update source stock (decrease)
  const sourceIndex = stock.findIndex(
    (s) => s.productId === productId && s.warehouseId === fromWarehouseId
  );
  
  // Capture state BEFORE modification for audit/transaction safety
  const sourceStockEntry = stock[sourceIndex];
  const sourceQtyBefore = sourceStockEntry.quantity;
  const sourceQtyAfter = sourceQtyBefore - quantity;

  // Update source
  stock[sourceIndex].quantity = sourceQtyAfter;

  // Update destination stock (increase or create)
  const destIndex = stock.findIndex(
    (s) => s.productId === productId && s.warehouseId === toWarehouseId
  );
  
  let destQtyBefore = 0;
  
  if (destIndex !== -1) {
    destQtyBefore = stock[destIndex].quantity;
    stock[destIndex].quantity += quantity;
  } else {
    // Create new stock entry for destination
    stock.push({
      id: getNextId(stock),
      productId,
      warehouseId: toWarehouseId,
      quantity,
    });
    // destQtyBefore defaults to 0
  }
  const destQtyAfter = destQtyBefore + quantity;

  // Transaction: Save updated stock (Commit Point 1)
  //
  // ARCHITECTURAL NOTE:
  // In a production SQL/NoSQL environment, this entire operation (stock update + audit log + transfer record)
  // would be wrapped in a single ACID transaction (BEGIN...COMMIT).
  //
  // Since we are using JSON files for this POC, we accept the risk of disjoint writes
  // in exchange for architecture simplicity. We mitigate logical inconsistencies by:
  // 1. Calculating all values in memory before writing.
  // 2. Passing explicit snapshots to the audit service to prevent stale reads.
  // 3. Writing the 'source of truth' (Stock) first.
  writeJsonFile(STOCK_FILE, stock);

  // Log audit entries (Batched: 1 Write)
  logStockChanges([
    {
      eventType: 'TRANSFER_OUT',
      referenceNumber,
      productId,
      warehouseId: fromWarehouseId,
      quantityChange: -quantity,
      notes,
      quantityBefore: sourceQtyBefore,
      quantityAfter: sourceQtyAfter
    },
    {
      eventType: 'TRANSFER_IN',
      referenceNumber,
      productId,
      warehouseId: toWarehouseId,
      quantityChange: quantity,
      notes,
      quantityBefore: destQtyBefore,
      quantityAfter: destQtyAfter
    }
  ]);

  // Create transfer record
  const transfer: Transfer = {
    id: getNextId(transfers),
    referenceNumber,
    productId,
    fromWarehouseId,
    toWarehouseId,
    quantity,
    status: 'completed',
    createdAt: timestamp,
    completedAt: timestamp,
    ...(notes && { notes }),
  };

  // Save transfer
  transfers.push(transfer);
  writeJsonFile(TRANSFERS_FILE, transfers);

  return transfer;
};

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Enrich a transfer with product and warehouse details
 */
export const enrichTransfer = (transfer: Transfer): EnrichedTransfer => {
  const products = readJsonFile<Product>(PRODUCTS_FILE);
  const warehouses = readJsonFile<Warehouse>(WAREHOUSES_FILE);

  const product = products.find((p) => p.id === transfer.productId);
  const fromWarehouse = warehouses.find((w) => w.id === transfer.fromWarehouseId);
  const toWarehouse = warehouses.find((w) => w.id === transfer.toWarehouseId);

  const { productId, fromWarehouseId, toWarehouseId, ...rest } = transfer;

  return {
    ...rest,
    product: product
      ? { id: product.id, name: product.name, sku: product.sku }
      : { id: productId, name: 'Unknown', sku: 'N/A' },
    fromWarehouse: fromWarehouse
      ? { id: fromWarehouse.id, name: fromWarehouse.name, code: fromWarehouse.code }
      : { id: fromWarehouseId, name: 'Unknown', code: 'N/A' },
    toWarehouse: toWarehouse
      ? { id: toWarehouse.id, name: toWarehouse.name, code: toWarehouse.code }
      : { id: toWarehouseId, name: 'Unknown', code: 'N/A' },
  };
};

/**
 * Query transfers with filtering and pagination
 */
export const queryTransfers = (
  params: TransferQueryParams = {}
): PaginatedResponse<EnrichedTransfer> => {
  const {
    productId,
    warehouseId,
    status,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = params;

  let transfers = readJsonFile<Transfer>(TRANSFERS_FILE);

  // Apply filters
  if (productId !== undefined) {
    transfers = transfers.filter((t) => t.productId === productId);
  }
  if (warehouseId !== undefined) {
    transfers = transfers.filter(
      (t) => t.fromWarehouseId === warehouseId || t.toWarehouseId === warehouseId
    );
  }
  if (status) {
    transfers = transfers.filter((t) => t.status === status);
  }
  if (startDate) {
    transfers = transfers.filter((t) => t.createdAt >= startDate);
  }
  if (endDate) {
    transfers = transfers.filter((t) => t.createdAt <= endDate);
  }

  // Sort by createdAt descending
  transfers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Get total before pagination
  const total = transfers.length;

  // Apply pagination
  const clampedLimit = Math.min(Math.max(1, limit), 100);
  const clampedOffset = Math.max(0, offset);
  transfers = transfers.slice(clampedOffset, clampedOffset + clampedLimit);

  // Enrich results
  const enrichedTransfers = transfers.map(enrichTransfer);

  return {
    data: enrichedTransfers,
    total,
    limit: clampedLimit,
    offset: clampedOffset,
  };
};

/**
 * Get a single transfer by ID
 */
export const getTransferById = (id: number): EnrichedTransfer | null => {
  const transfers = readJsonFile<Transfer>(TRANSFERS_FILE);
  const transfer = transfers.find((t) => t.id === id);
  return transfer ? enrichTransfer(transfer) : null;
};
