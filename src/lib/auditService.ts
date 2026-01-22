/**
 * Centralized audit logging service.
 * Tracks all stock-affecting events for complete traceability.
 */
import type { AuditLogEntry, AuditEventType, AuditQueryParams } from '@/types/transfers';
import { readJsonFile, writeJsonFile, getNextId, getCurrentTimestamp } from './dataService';

const AUDIT_FILE = 'audit_log.json';

interface LogStockChangeParams {
  readonly eventType: AuditEventType;
  readonly referenceNumber: string;
  readonly productId: number;
  readonly warehouseId: number;
  readonly quantityChange: number;
  readonly notes?: string;
  // Snapshots explicitly required to prevent stale reads
  readonly quantityBefore: number;
  readonly quantityAfter: number;
}

/**
 * Log a single stock change event to the audit trail.
 */
export const logStockChange = (params: LogStockChangeParams): AuditLogEntry => {
  return logStockChanges([params])[0];
};

/**
 * Log multiple stock changes in a single file operation (I/O Optimization).
 */
export const logStockChanges = (entries: readonly LogStockChangeParams[]): AuditLogEntry[] => {
  if (entries.length === 0) return [];

  const auditLog = readJsonFile<AuditLogEntry>(AUDIT_FILE);
  let nextId = getNextId(auditLog);

  const newEntries = entries.map((params) => {
    const entry = createAuditEntry(params, nextId);
    nextId++;
    return entry;
  });

  auditLog.push(...newEntries);
  writeJsonFile(AUDIT_FILE, auditLog);

  return newEntries;
};

/**
 * Helper to create entry object
 */
const createAuditEntry = (params: LogStockChangeParams, id: number): AuditLogEntry => {
  const { 
    eventType, 
    referenceNumber, 
    productId, 
    warehouseId, 
    quantityChange, 
    notes,
    quantityBefore,
    quantityAfter
  } = params;

  return {
    id,
    eventType,
    referenceNumber,
    productId,
    warehouseId,
    quantityChange,
    quantityBefore,
    quantityAfter,
    timestamp: getCurrentTimestamp(),
    ...(notes && { notes }),
  };
};

/**
 * Query audit log with optional filters.
 * Returns entries sorted by timestamp descending.
 */
export const queryAuditLog = (params: AuditQueryParams = {}): readonly AuditLogEntry[] => {
  const { productId, warehouseId, eventType, startDate, endDate } = params;
  let entries = readJsonFile<AuditLogEntry>(AUDIT_FILE);

  // Apply filters
  if (productId !== undefined) {
    entries = entries.filter((e) => e.productId === productId);
  }
  if (warehouseId !== undefined) {
    entries = entries.filter((e) => e.warehouseId === warehouseId);
  }
  if (eventType !== undefined) {
    entries = entries.filter((e) => e.eventType === eventType);
  }
  if (startDate) {
    entries = entries.filter((e) => e.timestamp >= startDate);
  }
  if (endDate) {
    entries = entries.filter((e) => e.timestamp <= endDate);
  }

  // Sort by timestamp descending (newest first)
  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

/**
 * Get audit history for a specific product across all warehouses.
 */
export const getProductAuditHistory = (productId: number): readonly AuditLogEntry[] => {
  return queryAuditLog({ productId });
};

/**
 * Get audit history for a specific warehouse.
 */
export const getWarehouseAuditHistory = (warehouseId: number): readonly AuditLogEntry[] => {
  return queryAuditLog({ warehouseId });
};
