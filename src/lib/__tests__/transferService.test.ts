import { executeTransfer } from '../transferService';
import { logStockChanges } from '../auditService';
import * as dataService from '../dataService';
import { CreateTransferRequest } from '@/types/transfers';

// Mock dependencies
jest.mock('../dataService', () => ({
  ...jest.requireActual('../dataService'), // Keep other exports real (like internal constants if any)
  readJsonFile: jest.fn(),
  writeJsonFile: jest.fn(),
  getNextId: jest.fn(),
  generateReferenceNumber: jest.fn(),
  getCurrentTimestamp: jest.fn(() => new Date().toISOString()), // Use Real Date so Fake Timers work
}));

jest.mock('../auditService');

describe('transferService', () => {
  const mockReadJsonFile = dataService.readJsonFile as jest.Mock;
  const mockWriteJsonFile = dataService.writeJsonFile as jest.Mock;
  const mockLogStockChanges = logStockChanges as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Industry Standard: Use Jest Fake Timers for robust time testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    // Default mocks
    (dataService.getNextId as jest.Mock).mockReturnValue(101);
    (dataService.generateReferenceNumber as jest.Mock).mockReturnValue('TRF-TEST');
    
    // Default data
    mockReadJsonFile.mockImplementation((file: string) => {
      if (file.includes('products')) return [{ id: 1, name: 'Test Product', sku: 'TP-001' }];
      if (file.includes('warehouses')) return [
        { id: 1, name: 'Source WH', code: 'WH-A' },
        { id: 2, name: 'Dest WH', code: 'WH-B' }
      ];
      if (file.includes('stock')) return [
        { id: 1, productId: 1, warehouseId: 1, quantity: 100 },
        { id: 2, productId: 1, warehouseId: 2, quantity: 50 }
      ];
      if (file.includes('transfers')) return [];
      return [];
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('executeTransfer', () => {
    const validRequest: CreateTransferRequest = {
      productId: 1,
      fromWarehouseId: 1,
      toWarehouseId: 2,
      quantity: 10,
      notes: 'Test Transfer'
    };

    it('should successfully execute a valid transfer', () => {
      const result = executeTransfer(validRequest);

      // Verify result
      expect(result).toEqual({
        id: 101,
        referenceNumber: 'TRF-TEST',
        productId: 1,
        fromWarehouseId: 1,
        toWarehouseId: 2,
        quantity: 10,
        status: 'completed',
        createdAt: '2024-01-01T00:00:00.000Z', // Fake Timer time
        completedAt: '2024-01-01T00:00:00.000Z',
        notes: 'Test Transfer'
      });

      expect(mockWriteJsonFile).toHaveBeenCalledWith('stock.json', expect.arrayContaining([
        expect.objectContaining({ warehouseId: 1, quantity: 90 }),
        expect.objectContaining({ warehouseId: 2, quantity: 60 })
      ]));

      // Optimization Check
      expect(mockLogStockChanges).toHaveBeenCalledTimes(1);
    });

    it('should throw error if stock is insufficient', () => {
      const invalidRequest = { ...validRequest, quantity: 150 };
      expect(() => executeTransfer(invalidRequest)).toThrow(/Insufficient stock/);
      expect(mockWriteJsonFile).not.toHaveBeenCalled();
    });

    it('should throw error if transferring to same warehouse', () => {
      const invalidRequest = { ...validRequest, toWarehouseId: 1 };
      expect(() => executeTransfer(invalidRequest)).toThrow(/same warehouse/);
    });

    it('should create new stock entry if destination has no stock', () => {
      mockReadJsonFile.mockImplementation((file: string) => {
        if (file.includes('stock')) return [
          { id: 1, productId: 1, warehouseId: 1, quantity: 100 }
        ];
        if (file.includes('products')) return [{ id: 1, name: 'Test Product' }];
        if (file.includes('warehouses')) return [{ id: 1, name: 'S' }, { id: 2, name: 'D' }];
        return [];
      });

      executeTransfer(validRequest);

      expect(mockWriteJsonFile).toHaveBeenCalledWith('stock.json', expect.arrayContaining([
        expect.objectContaining({ warehouseId: 1, quantity: 90 }),
        expect.objectContaining({ warehouseId: 2, quantity: 10 })
      ]));
    });
  });
});
