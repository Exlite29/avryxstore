import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockApi, MockApiError } = vi.hoisted(() => {
  class MockApiError extends Error {
    constructor(message, statusCode = 500, errorCode = null, details = null) {
      super(message);
      this.name = "ApiError";
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.details = details;
    }
  }

  return { mockApi: vi.fn(), MockApiError };
});

vi.mock("../../../lib/api", () => ({
  default: mockApi,
  ApiError: MockApiError,
  isApiError: (error) => error instanceof MockApiError,
  getErrorStatus: (error) => error?.statusCode ?? null,
  getErrorCode: (error) => error?.errorCode ?? null,
}));

import salesService from "../salesService";

describe("salesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the sale payload to the create endpoint", async () => {
    const saleData = {
      items: [{ product_id: 1, quantity: 1, unit_price: 100 }],
      payment_method: "cash",
      amount_paid: 112,
      discount: 0,
    };
    mockApi.mockResolvedValueOnce({ data: { id: 1 } });

    await salesService.create(saleData);

    expect(mockApi).toHaveBeenCalledWith(
      "/api/v1/sales",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(saleData),
      })
    );
  });

  it("preserves the backend message for an underpayment error", async () => {
    const message = "Insufficient payment. Total: ₱112.00, Paid: ₱100.00";
    mockApi.mockRejectedValueOnce(new MockApiError(message, 400, "SALE_002"));

    await expect(salesService.create({ amount_paid: 100 })).rejects.toMatchObject({
      message,
      statusCode: 400,
      errorCode: "SALE_002",
    });
  });

  it("maps an empty-cart backend code to the empty-cart message", async () => {
    mockApi.mockRejectedValueOnce(
      new MockApiError("Cart is empty", 400, "SALE_005")
    );

    await expect(salesService.create({ items: [] })).rejects.toThrow(
      "Your cart is empty. Add items before completing the sale."
    );
  });
});
