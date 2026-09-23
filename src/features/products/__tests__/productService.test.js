import { describe, it, expect, vi, beforeEach } from 'vitest';

// api.js uses axios (not fetch), so mock the api module itself
const { mockApi, MockApiError } = vi.hoisted(() => {
  class MockApiError extends Error {
    constructor(message, statusCode = 500, errorCode = null, details = null) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.details = details;
    }
  }
  return { mockApi: vi.fn(), MockApiError };
});

vi.mock('../../../lib/api', () => ({
  default: mockApi,
  ApiError: MockApiError,
  isApiError: (error) => error instanceof MockApiError,
  getErrorStatus: (error) => error?.statusCode ?? null,
  getErrorCode: (error) => error?.errorCode ?? null,
}));

import productService from '../productService';

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
  });

  it('getAll calls the correct endpoint', async () => {
    const mockProducts = [{ id: 1, name: 'Product 1' }];
    mockApi.mockResolvedValueOnce({ products: mockProducts });

    const result = await productService.getAll({ page: 1, limit: 10 });
    expect(mockApi).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/products')
    );
    expect(result.products).toEqual(mockProducts);
  });

  it('create sends correct data', async () => {
    const newProduct = { name: 'New Product', price: 100 };
    mockApi.mockResolvedValueOnce({ id: 2, ...newProduct });

    await productService.create(newProduct);
    expect(mockApi).toHaveBeenCalledWith(
      '/api/v1/products',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newProduct),
      })
    );
  });

  it('handles API errors', async () => {
    mockApi.mockRejectedValueOnce(new MockApiError('Bad Request', 400));

    await expect(productService.getAll()).rejects.toThrow('Bad Request');
  });
});
