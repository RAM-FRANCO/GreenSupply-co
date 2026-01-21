import type { Product, Warehouse } from './inventory';

// ============================================================================
// Transfer Types
// ============================================================================

/** Transfer status enum */
export type TransferStatus = 'completed' | 'pending' | 'cancelled';

/** Transfer record - stored in transfers.json */
export interface Transfer {
  readonly id: number;
  readonly referenceNumber: string;
  readonly productId: number;
  readonly fromWarehouseId: number;
  readonly toWarehouseId: number;
  readonly quantity: number;
  readonly status: TransferStatus;
  readonly notes?: string;
  readonly createdAt: string;
  readonly completedAt?: string;
}

/** Enriched transfer with resolved references */
export interface EnrichedTransfer extends Omit<Transfer, 'productId' | 'fromWarehouseId' | 'toWarehouseId'> {
  readonly product: Pick<Product, 'id' | 'name' | 'sku'>;
  readonly fromWarehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
  readonly toWarehouse: Pick<Warehouse, 'id' | 'name' | 'code'>;
}

/** POST /api/transfers request body */
export interface CreateTransferRequest {
  readonly productId: number;
  readonly fromWarehouseId: number;
  readonly toWarehouseId: number;
  readonly quantity: number;
  readonly notes?: string;
}

/** GET /api/transfers query params */
export interface TransferQueryParams {
  readonly productId?: number;
  readonly warehouseId?: number;
  readonly status?: TransferStatus;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly limit?: number;
  readonly offset?: number;
}

// ============================================================================
// Audit Log Types
// ============================================================================

/** Audit event types - extensible for future features */
export type AuditEventType =
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'ADJUSTMENT'
  | 'RECEIPT';

/** Audit log entry - stored in audit_log.json */
export interface AuditLogEntry {
  readonly id: number;
  readonly eventType: AuditEventType;
  readonly referenceNumber: string;
  readonly productId: number;
  readonly warehouseId: number;
  readonly quantityChange: number;
  readonly quantityBefore: number;
  readonly quantityAfter: number;
  readonly timestamp: string;
  readonly notes?: string;
}

/** Query params for audit log */
export interface AuditQueryParams {
  readonly productId?: number;
  readonly warehouseId?: number;
  readonly eventType?: AuditEventType;
  readonly startDate?: string;
  readonly endDate?: string;
}

// ============================================================================
// Generic Response Types
// ============================================================================

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/** API error response */
export interface ApiError {
  readonly message: string;
  readonly code?: string;
}
