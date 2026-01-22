/**
 * Generic data service for file-based JSON operations.
 * DRY utility functions used across all data files.
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Read and parse a JSON data file
 */
export const readJsonFile = <T>(filename: string): T[] => {
  const filePath = path.join(DATA_DIR, filename);
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData) as T[];
};

/**
 * Write data to a JSON file with pretty formatting
 */
export const writeJsonFile = <T>(filename: string, data: T[]): void => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * Get the next available ID for a collection
 */
export const getNextId = <T extends { id: number }>(items: readonly T[]): number => {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
};

/**
 * Generate a reference number with date prefix
 * Format: PREFIX-YYYYMMDD-NNNN (e.g., TRF-20260122-0001)
 */
export const generateReferenceNumber = <T extends { referenceNumber: string }>(
  prefix: string,
  existingItems: readonly T[]
): string => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  // Find highest sequence for today
  const todayPrefix = `${prefix}-${dateStr}-`;
  const todayRefs = existingItems
    .filter((item) => item.referenceNumber.startsWith(todayPrefix))
    .map((item) => parseInt(item.referenceNumber.slice(-4), 10));

  const nextSeq = todayRefs.length > 0 ? Math.max(...todayRefs) + 1 : 1;
  return `${todayPrefix}${nextSeq.toString().padStart(4, '0')}`;
};

/**
 * Get current ISO timestamp
 */
export const getCurrentTimestamp = (): string => new Date().toISOString();
