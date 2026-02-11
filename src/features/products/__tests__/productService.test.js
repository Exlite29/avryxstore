import { describe, it, expect, vi, beforeEach } from 'vitest';
import productService from '../productService';

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
  });

  it('getAll calls the correct endpoint', async () => {
    const mockProducts = [{ id: 1, name: 'Product 1' }];
    window.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ products: mockProducts }),
    });

    const result = await productService.getAll();
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/products/'),
      expect.any(Object)
    );
    expect(result.products).toEqual(mockProducts);
  });

  it('create sends correct data', async () => {
    const newProduct = { name: 'New Product', price: 100 };
    window.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 2, ...newProduct }),
    });

    await productService.create(newProduct);
    expect(window.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/products/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newProduct),
      })
    );
  });

  it('handles API errors', async () => {
    window.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' }),
    });

    await expect(productService.getAll()).rejects.toThrow('Bad Request');
  });
});
