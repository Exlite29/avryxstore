import api, { ApiError, isApiError, getErrorCode } from "../../lib/api";
import {
  SALES_ERROR_MESSAGES,
  getErrorMessage,
  getStatusCodeErrorMessage,
} from "../../lib/errorMessages";

/**
 * Get user-friendly error message for sales operations
 */
const getSalesErrorMessage = (error, operation) => {
  if (!isApiError(error)) {
    return SALES_ERROR_MESSAGES[operation] || SALES_ERROR_MESSAGES.getAll;
  }

  const errorCode = getErrorCode(error);

  // Handle specific error codes
  switch (errorCode) {
    case "EMPTY_CART":
    case "CART_EMPTY":
      return SALES_ERROR_MESSAGES.create.emptyCart;
    case "INVALID_ITEMS":
      return SALES_ERROR_MESSAGES.create.invalidItems;
    case "INSUFFICIENT_STOCK":
      return SALES_ERROR_MESSAGES.create.insufficientStock;
    case "PRODUCT_NOT_FOUND":
      return SALES_ERROR_MESSAGES.create.productNotFound;
    case "INVALID_QUANTITY":
      return SALES_ERROR_MESSAGES.create.invalidQuantity;
    case "INVALID_PRICE":
      return SALES_ERROR_MESSAGES.create.invalidPrice;
    case "PAYMENT_FAILED":
      return SALES_ERROR_MESSAGES.create.paymentFailed;
    case "PAYMENT_DECLINED":
      return SALES_ERROR_MESSAGES.create.paymentDeclined;
    case "SALE_NOT_FOUND":
      return SALES_ERROR_MESSAGES.cancel.notFound;
    case "ALREADY_CANCELLED":
      return SALES_ERROR_MESSAGES.cancel.alreadyCancelled;
    case "TOO_LATE":
      return SALES_ERROR_MESSAGES.cancel.tooLate;
    case "HAS_REFUND":
      return SALES_ERROR_MESSAGES.cancel.hasRefund;
    case "REASON_REQUIRED":
      return SALES_ERROR_MESSAGES.cancel.reasonRequired;
    default:
      // Handle status codes
      if (error.statusCode === 404) {
        return SALES_ERROR_MESSAGES.cancel.notFound;
      }
      if (error.statusCode === 409) {
        return SALES_ERROR_MESSAGES.cancel.alreadyCancelled;
      }
      if (error.statusCode === 400) {
        if (operation === "create") {
          return SALES_ERROR_MESSAGES.create.emptyCart;
        }
        if (operation === "cancel") {
          return SALES_ERROR_MESSAGES.cancel.reasonRequired;
        }
      }
      if (error.statusCode === 422) {
        if (error.details) {
          if (error.details.items) return SALES_ERROR_MESSAGES.create.invalidItems;
          if (error.details.quantity) return SALES_ERROR_MESSAGES.create.invalidQuantity;
        }
        return SALES_ERROR_MESSAGES.create.invalidItems;
      }
      return error.message || SALES_ERROR_MESSAGES[operation] || SALES_ERROR_MESSAGES.getAll;
  }
};

const salesService = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = `/api/v1/sales${query ? `?${query}` : ""}`;
      const data = await api(endpoint);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Sales] Get all error:", error.message);
        throw new ApiError(
          getSalesErrorMessage(error, "getAll"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Sales] Get all error:", error);
      throw new ApiError(
        getErrorMessage(error, SALES_ERROR_MESSAGES.getAll),
        500,
        "SALES_FETCH_ERROR"
      );
    }
  },

  getDailySummary: async () => {
    try {
      const data = await api("/api/v1/sales/daily-summary");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Sales] Get daily summary error:", error.message);
        throw new ApiError(
          getSalesErrorMessage(error, "getDailySummary"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Sales] Get daily summary error:", error);
      throw new ApiError(
        getErrorMessage(error, SALES_ERROR_MESSAGES.getDailySummary),
        500,
        "DAILY_SUMMARY_ERROR"
      );
    }
  },

  getById: async (id) => {
    try {
      const data = await api(`/api/v1/sales/${id}`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Sales] Get by ID error:", error.message);
        throw new ApiError(
          getSalesErrorMessage(error, "getById"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Sales] Get by ID error:", error);
      throw new ApiError(
        getErrorMessage(error, SALES_ERROR_MESSAGES.getById),
        500,
        "SALE_DETAILS_ERROR"
      );
    }
  },

  create: async (saleData) => {
    try {
      const data = await api("/api/v1/sales", {
        method: "POST",
        body: JSON.stringify(saleData),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Sales] Create error:", error.message);
        throw new ApiError(
          getSalesErrorMessage(error, "create"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Sales] Create error:", error);
      throw new ApiError(
        getErrorMessage(error, SALES_ERROR_MESSAGES.create.emptyCart),
        500,
        "SALE_CREATE_ERROR"
      );
    }
  },

  getReceipt: async (id) => {
    try {
      const data = await api(`/api/v1/sales/${id}/receipt`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Sales] Get receipt error:", error.message);
        throw new ApiError(
          getSalesErrorMessage(error, "getReceipt"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Sales] Get receipt error:", error);
      throw new ApiError(
        getErrorMessage(error, SALES_ERROR_MESSAGES.getReceipt),
        500,
        "RECEIPT_ERROR"
      );
    }
  },

  cancel: async (id, reason) => {
    try {
      const data = await api(`/api/v1/sales/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Sales] Cancel error:", error.message);
        throw new ApiError(
          getSalesErrorMessage(error, "cancel"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Sales] Cancel error:", error);
      throw new ApiError(
        getErrorMessage(error, SALES_ERROR_MESSAGES.cancel.notFound),
        500,
        "SALE_CANCEL_ERROR"
      );
    }
  },
};

export default salesService;
