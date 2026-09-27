import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockCreate } = vi.hoisted(() => {
  const requestUse = vi.fn();
  const responseUse = vi.fn();
  const instance = {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  };

  return { mockCreate: vi.fn(() => instance) };
});

vi.mock("axios", () => ({
  default: { create: mockCreate },
}));

import api, { ApiError } from "./api";

const responseErrorHandler = mockCreate.mock.results[0].value.interceptors.response.use
  .mock.calls[0][1];

describe("api error handling", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the backend error field instead of discarding it", async () => {
    const responseInterceptor = responseErrorHandler;
    const backendError = new Error("request failed");
    backendError.response = {
      status: 400,
      data: {
        error: "Insufficient payment. Total: ₱112.00, Paid: ₱100.00",
        message: "Request failed",
        code: "SALE_002",
      },
    };

    await expect(responseInterceptor(backendError)).rejects.toEqual(
      expect.objectContaining({
        message: "Insufficient payment. Total: ₱112.00, Paid: ₱100.00",
        statusCode: 400,
        errorCode: "SALE_002",
      })
    );
    expect(api).toEqual(expect.any(Function));
    expect(ApiError).toEqual(expect.any(Function));
  });
});
