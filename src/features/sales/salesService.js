import api, { ApiError, isApiError, getErrorCode } from "../../lib/api";
import {
  SALES_ERROR_MESSAGES,
  getErrorMessage,
} from "../../lib/errorMessages";

const getValidationMessage = (details) => {
  if (!details) return null;

  const fields = Array.isArray(details)
    ? details.map((detail) => detail?.field)
    : Object.keys(details);

  if (fields.includes("items")) {
    return SALES_ERROR_MESSAGES.create.invalidItems;
  }

  if (fields.some((field) => typeof field === "string" && field.includes("quantity"))) {
    return SALES_ERROR_MESSAGES.create.invalidQuantity;
  }

  return null;
};

const getSalesErrorMessage = (error, operation) => {
  if (!isApiError(error)) {
    return operation === "create"
      ? SALES_ERROR_MESSAGES.create.paymentFailed
      : SALES_ERROR_MESSAGES[operation] || SALES_ERROR_MESSAGES.getAll;
  }

  const errorCode = getErrorCode(error);

  switch (errorCode) {
    case "EMPTY_CART":
    case "CART_EMPTY":
    case "SALE_005":
      return SALES_ERROR_MESSAGES.create.emptyCart;
    case "INVALID_ITEMS":
      return SALES_ERROR_MESSAGES.create.invalidItems;
    case "INSUFFICIENT_STOCK":
    case "PROD_007":
      return SALES_ERROR_MESSAGES.create.insufficientStock;
    case "PRODUCT_NOT_FOUND":
      return SALES_ERROR_MESSAGES.create.productNotFound;
    case "INVALID_QUANTITY":
      return SALES_ERROR_MESSAGES.create.invalidQuantity;
    case "INVALID_PRICE":
      return SALES_ERROR_MESSAGES.create.invalidPrice;
    case "INSUFFICIENT_PAYMENT":
      return SALES_ERROR_MESSAGES.create.insufficientPayment;
    case "PAYMENT_FAILED":
    case "SALE_007":
    case "SALE_008":
      return SALES_ERROR_MESSAGES.create.paymentFailed;
    case "PAYMENT_DECLINED":
      return SALES_ERROR_MESSAGES.create.paymentDeclined;
    case "SALE_NOT_FOUND":
    case "SALE_001":
      return SALES_ERROR_MESSAGES.cancel.notFound;
    case "ALREADY_CANCELLED":
      return SALES_ERROR_MESSAGES.cancel.alreadyCancelled;
    case "TOO_LATE":
      return SALES_ERROR_MESSAGES.cancel.tooLate;
    case "HAS_REFUND":
      return SALES_ERROR_MESSAGES.cancel.hasRefund;
    case "REASON_REQUIRED":
      return SALES_ERROR_MESSAGES.cancel.reasonRequired;
    default: {
      const validationMessage = getValidationMessage(error.details);
      if (validationMessage) return validationMessage;

      if (error.statusCode === 404) {
        return SALES_ERROR_MESSAGES.cancel.notFound;
      }
      if (error.statusCode === 409) {
        return SALES_ERROR_MESSAGES.cancel.alreadyCancelled;
      }
      if (error.statusCode === 400) {
        return operation === "cancel"
          ? SALES_ERROR_MESSAGES.cancel.reasonRequired
          : error.message || SALES_ERROR_MESSAGES.create.paymentFailed;
      }
      if (error.statusCode === 422) {
        return SALES_ERROR_MESSAGES.create.invalidItems;
      }
      return error.message || (operation === "create"
        ? SALES_ERROR_MESSAGES.create.paymentFailed
        : SALES_ERROR_MESSAGES[operation] || SALES_ERROR_MESSAGES.getAll);
    }
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
          error.errorCode,
          error.details
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
          error.errorCode,
          error.details
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
          error.errorCode,
          error.details
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
          error.errorCode,
          error.details
        );
      }
      console.error("[Sales] Create error:", error);
      throw new ApiError(
        getErrorMessage(error, SALES_ERROR_MESSAGES.create.paymentFailed),
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
          error.errorCode,
          error.details
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
          error.errorCode,
          error.details
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
