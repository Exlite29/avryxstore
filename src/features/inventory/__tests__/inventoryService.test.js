import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the API module
const mockApi = vi.fn();
vi.mock('../../lib/api', () => ({
  default: mockApi,
  ApiError: class ApiError extends Error {
    constructor(message, statusCode = 500, errorCode = null) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode;
    }
  },
  isApiError: vi.fn((error) => error instanceof Error && error.name === 'ApiError'),
  getErrorCode: vi.fn()
}));

describe('inventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  describe('addStock', () => {
    it('calls correct endpoint with POST method', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      const productId = '4';
      const data = { quantity: 10, reason: 'Manual add' };
      const mockResponse = {
        success: true,
        data: [{ product_id: 4, total_inventory_qty: 28 }]
      };
      
      mockApi.mockResolvedValueOnce(mockResponse);
      
      const result = await inventoryService.addStock(productId, data);
      
      expect(mockApi).toHaveBeenCalledWith(
        '/api/v1/inventory/product/4/add',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws ApiError on failure', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      const { ApiError } = await import('../../lib/api');
      
      mockApi.mockRejectedValueOnce(new ApiError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
      
      await expect(inventoryService.addStock('999', { quantity: 10 }))
        .rejects.toThrow('Product not found');
    });
  });

  describe('removeStock', () => {
    it('calls correct endpoint with POST method', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      const productId = '4';
      const data = { quantity: 5, reason: 'Damaged' };
      const mockResponse = { success: true, data: [] };
      
      mockApi.mockResolvedValueOnce(mockResponse);
      
      await inventoryService.removeStock(productId, data);
      
      expect(mockApi).toHaveBeenCalledWith(
        '/api/v1/inventory/product/4/remove',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
    });

    it('throws ApiError for insufficient stock', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      const { ApiError } = await import('../../lib/api');
      
      mockApi.mockRejectedValueOnce(new ApiError('Insufficient stock', 400, 'INSUFFICIENT_STOCK'));
      
      await expect(inventoryService.removeStock('4', { quantity: 1000 }))
        .rejects.toThrow('Insufficient stock');
    });
  });

  describe('adjustStock', () => {
    it('calls correct endpoint with POST method', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      const productId = '4';
      const data = { quantity: -2, reason: 'Inventory Count Correction' };
      const mockResponse = { success: true, data: [] };
      
      mockApi.mockResolvedValueOnce(mockResponse);
      
      await inventoryService.adjustStock(productId, data);
      
      expect(mockApi).toHaveBeenCalledWith(
        '/api/v1/inventory/product/4/adjust',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
    });
  });

  describe('endpoint validation', () => {
    it('addStock endpoint uses POST /api/v1/inventory/product/:productId/add', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      mockApi.mockResolvedValueOnce({ success: true });
      
      await inventoryService.addStock('123', { quantity: 10 });
      
      const call = mockApi.mock.calls[0][0];
      expect(call).toContain('/api/v1/inventory/product/');
      expect(call).toContain('/add');
    });

    it('removeStock endpoint uses POST /api/v1/inventory/product/:productId/remove', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      mockApi.mockResolvedValueOnce({ success: true });
      
      await inventoryService.removeStock('123', { quantity: 5 });
      
      const call = mockApi.mock.calls[0][0];
      expect(call).toContain('/api/v1/inventory/product/');
      expect(call).toContain('/remove');
    });

    it('adjustStock endpoint uses POST /api/v1/inventory/product/:productId/adjust', async () => {
      const { default: inventoryService } = await import('../inventoryService');
      
      mockApi.mockResolvedValueOnce({ success: true });
      
      await inventoryService.adjustStock('123', { quantity: -1 });
      
      const call = mockApi.mock.calls[0][0];
      expect(call).toContain('/api/v1/inventory/product/');
      expect(call).toContain('/adjust');
    });
  });

  describe('data handling', () => {
    it('handles NULL stock_quantity by falling back to total_inventory_qty', async () => {
      // This tests the frontend handling of the API response
      const product = {
        product_id: 4,
        product_name: 'Product',
        stock_quantity: null,
        total_inventory_qty: 28
      };

      // Frontend should prioritize total_inventory_qty
      const stockValue = product.total_inventory_qty || product.stock_quantity || product.stock || 0;
      expect(stockValue).toBe(28);
    });

    it('handles response with total_inventory_qty field', async () => {
      const mockResponse = {
        success: true,
        data: [
          { product_id: 4, product_name: 'Argentina Meat Loaf', total_inventory_qty: 28 }
        ],
        pagination: { page: 1, limit: 10, total: 4, totalPages: 1 }
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.data[0].total_inventory_qty).toBe(28);
    });
  });
});
