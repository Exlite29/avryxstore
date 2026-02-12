import api, { ApiError, isApiError } from "../../lib/api";
import {
  REPORTS_ERROR_MESSAGES,
  getErrorMessage,
} from "../../lib/errorMessages";

/**
 * Get user-friendly error message for reports operations
 */
const getReportsErrorMessage = (error, operation) => {
  if (!isApiError(error)) {
    return REPORTS_ERROR_MESSAGES[operation] || REPORTS_ERROR_MESSAGES.getSalesReports;
  }
  return error.message || REPORTS_ERROR_MESSAGES[operation] || REPORTS_ERROR_MESSAGES.getSalesReports;
};

const reportService = {
  getSalesReports: async () => {
    try {
      const data = await api("/api/v1/reports/sales");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Reports] Get sales reports error:", error.message);
        throw new ApiError(
          getReportsErrorMessage(error, "getSalesReports"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Reports] Get sales reports error:", error);
      throw new ApiError(
        getErrorMessage(error, REPORTS_ERROR_MESSAGES.getSalesReports),
        500,
        "SALES_REPORTS_ERROR"
      );
    }
  },

  getTopProducts: async () => {
    try {
      const data = await api("/api/v1/reports/sales/top-products");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Reports] Get top products error:", error.message);
        throw new ApiError(
          getReportsErrorMessage(error, "getTopProducts"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Reports] Get top products error:", error);
      throw new ApiError(
        getErrorMessage(error, REPORTS_ERROR_MESSAGES.getTopProducts),
        500,
        "TOP_PRODUCTS_ERROR"
      );
    }
  },

  getDailySales: async () => {
    try {
      const data = await api("/api/v1/reports/sales/daily");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Reports] Get daily sales error:", error.message);
        throw new ApiError(
          getReportsErrorMessage(error, "getDailySales"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Reports] Get daily sales error:", error);
      throw new ApiError(
        getErrorMessage(error, REPORTS_ERROR_MESSAGES.getDailySales),
        500,
        "DAILY_SALES_ERROR"
      );
    }
  },

  getCashflow: async () => {
    try {
      const data = await api("/api/v1/reports/sales/cashflow");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Reports] Get cashflow error:", error.message);
        throw new ApiError(
          getReportsErrorMessage(error, "getCashflow"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Reports] Get cashflow error:", error);
      throw new ApiError(
        getErrorMessage(error, REPORTS_ERROR_MESSAGES.getCashflow),
        500,
        "CASHFLOW_ERROR"
      );
    }
  },

  getInventoryReports: async () => {
    try {
      const data = await api("/api/v1/reports/inventory");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Reports] Get inventory reports error:", error.message);
        throw new ApiError(
          getReportsErrorMessage(error, "getInventoryReports"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Reports] Get inventory reports error:", error);
      throw new ApiError(
        getErrorMessage(error, REPORTS_ERROR_MESSAGES.getInventoryReports),
        500,
        "INVENTORY_REPORTS_ERROR"
      );
    }
  },

  getInventoryValuation: async () => {
    try {
      const data = await api("/api/v1/reports/inventory/valuation");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Reports] Get inventory valuation error:", error.message);
        throw new ApiError(
          getReportsErrorMessage(error, "getInventoryValuation"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Reports] Get inventory valuation error:", error);
      throw new ApiError(
        getErrorMessage(error, REPORTS_ERROR_MESSAGES.getInventoryValuation),
        500,
        "INVENTORY_VALUATION_ERROR"
      );
    }
  },

  getScannerMetrics: async () => {
    try {
      const data = await api("/api/v1/reports/scanner/metrics");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Reports] Get scanner metrics error:", error.message);
        throw new ApiError(
          getReportsErrorMessage(error, "getScannerMetrics"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Reports] Get scanner metrics error:", error);
      throw new ApiError(
        getErrorMessage(error, REPORTS_ERROR_MESSAGES.getScannerMetrics),
        500,
        "SCANNER_METRICS_ERROR"
      );
    }
  },
};

export default reportService;
