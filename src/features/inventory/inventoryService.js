import api, { ApiError, isApiError, getErrorCode } from "../../lib/api";
import {
  INVENTORY_ERROR_MESSAGES,
  getErrorMessage,
  getStatusCodeErrorMessage,
} from "../../lib/errorMessages";

/**
 * Get user-friendly error message for inventory operations
 */
const getInventoryErrorMessage = (error, operation) => {
  if (!isApiError(error)) {
    return INVENTORY_ERROR_MESSAGES[operation] || INVENTORY_ERROR_MESSAGES.getAll;
  }

  const errorCode = getErrorCode(error);

  // Handle specific error codes
  switch (errorCode) {
    case "PRODUCT_NOT_FOUND":
      return INVENTORY_ERROR_MESSAGES.addStock.notFound;
    case "NEGATIVE_QUANTITY":
      return INVENTORY_ERROR_MESSAGES.addStock.negativeQuantity;
    case "INSUFFICIENT_STOCK":
      return INVENTORY_ERROR_MESSAGES.removeStock.insufficientStock;
    case "EXCEEDS_STOCK":
      return INVENTORY_ERROR_MESSAGES.removeStock.exceedsStock;
    case "REASON_REQUIRED":
      return INVENTORY_ERROR_MESSAGES.removeStock.reasonRequired;
    default:
      // Handle status codes
      if (error.statusCode === 404) {
        return INVENTORY_ERROR_MESSAGES.addStock.notFound;
      }
      if (error.statusCode === 400) {
        if (error.message?.includes("product ID")) {
          return INVENTORY_ERROR_MESSAGES.addStock.invalidProduct;
        }
        if (operation === "addStock") {
          return INVENTORY_ERROR_MESSAGES.addStock.invalidQuantity;
        }
        if (operation === "removeStock") {
          return INVENTORY_ERROR_MESSAGES.removeStock.insufficientStock;
        }
      }
      return error.message || INVENTORY_ERROR_MESSAGES[operation] || INVENTORY_ERROR_MESSAGES.getAll;
  }
};

const inventoryService = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const endpoint = `/api/v1/inventory${query ? `?${query}` : ""}`;
      const data = await api(endpoint);
      
      // Normalize response data to ensure 'id' and 'name' exist
      // The backend 'paginated' helper returns { success, data, pagination }
      const items = data.data || data.inventory || (Array.isArray(data) ? data : null);
      
      if (items && Array.isArray(items)) {
        const normalizedItems = items.map(item => ({
          ...item,
          id: item.id || item.product_id,
          name: item.name || item.product_name
        }));
        
        if (data.data) data.data = normalizedItems;
        if (data.inventory) data.inventory = normalizedItems;
        if (Array.isArray(data)) return normalizedItems;
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Inventory] Get all error:", error.message);
        throw new ApiError(
          getInventoryErrorMessage(error, "getAll"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Inventory] Get all error:", error);
      throw new ApiError(
        getErrorMessage(error, INVENTORY_ERROR_MESSAGES.getAll),
        500,
        "INVENTORY_FETCH_ERROR"
      );
    }
  },

  getValuation: async () => {
    try {
      const data = await api("/api/v1/inventory/valuation");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Inventory] Get valuation error:", error.message);
        throw new ApiError(
          getInventoryErrorMessage(error, "getValuation"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Inventory] Get valuation error:", error);
      throw new ApiError(
        getErrorMessage(error, INVENTORY_ERROR_MESSAGES.getValuation),
        500,
        "INVENTORY_VALUATION_ERROR"
      );
    }
  },

  getByProduct: async (productId) => {
    try {
      const data = await api(`/api/v1/inventory/product/${productId}`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Inventory] Get by product error:", error.message);
        throw new ApiError(
          getInventoryErrorMessage(error, "getByProduct"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Inventory] Get by product error:", error);
      throw new ApiError(
        getErrorMessage(error, INVENTORY_ERROR_MESSAGES.getByProduct),
        500,
        "INVENTORY_PRODUCT_ERROR"
      );
    }
  },

  getMovements: async (productId) => {
    try {
      const data = await api(`/api/v1/inventory/product/${productId}/movements`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Inventory] Get movements error:", error.message);
        throw new ApiError(
          getInventoryErrorMessage(error, "getMovements"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Inventory] Get movements error:", error);
      throw new ApiError(
        getErrorMessage(error, INVENTORY_ERROR_MESSAGES.getMovements),
        500,
        "INVENTORY_MOVEMENTS_ERROR"
      );
    }
  },

  addStock: async (productId, data) => {
    try {
      const response = await api(`/api/v1/inventory/product/${productId}/add`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Inventory] Add stock error:", error.message);
        throw new ApiError(
          getInventoryErrorMessage(error, "addStock"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Inventory] Add stock error:", error);
      throw new ApiError(
        getErrorMessage(error, INVENTORY_ERROR_MESSAGES.addStock.invalidQuantity),
        500,
        "ADD_STOCK_ERROR"
      );
    }
  },

  removeStock: async (productId, data) => {
    try {
      const response = await api(`/api/v1/inventory/product/${productId}/remove`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Inventory] Remove stock error:", error.message);
        throw new ApiError(
          getInventoryErrorMessage(error, "removeStock"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Inventory] Remove stock error:", error);
      throw new ApiError(
        getErrorMessage(error, INVENTORY_ERROR_MESSAGES.removeStock.insufficientStock),
        500,
        "REMOVE_STOCK_ERROR"
      );
    }
  },

  adjustStock: async (productId, data) => {
    try {
      const response = await api(`/api/v1/inventory/product/${productId}/adjust`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Inventory] Adjust stock error:", error.message);
        throw new ApiError(
          getInventoryErrorMessage(error, "adjustStock"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Inventory] Adjust stock error:", error);
      throw new ApiError(
        getErrorMessage(error, INVENTORY_ERROR_MESSAGES.adjustStock.negativeQuantity),
        500,
        "ADJUST_STOCK_ERROR"
      );
    }
  },
};

export default inventoryService;
