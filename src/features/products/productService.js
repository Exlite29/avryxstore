import api, { ApiError, isApiError, getErrorCode } from "../../lib/api";
import {
  PRODUCT_ERROR_MESSAGES,
  getErrorMessage,
  getStatusCodeErrorMessage,
} from "../../lib/errorMessages";

/**
 * Get user-friendly error message for product operations
 */
const getProductErrorMessage = (error, operation) => {
  if (!isApiError(error)) {
    return PRODUCT_ERROR_MESSAGES[operation] || PRODUCT_ERROR_MESSAGES.getAll;
  }

  const errorCode = getErrorCode(error);

  // Handle specific error codes
  switch (errorCode) {
    case "BARCODE_EXISTS":
      return PRODUCT_ERROR_MESSAGES.create.barcodeExists;
    case "PRODUCT_NOT_FOUND":
      return PRODUCT_ERROR_MESSAGES.update.notFound;
    case "INSUFFICIENT_STOCK":
      return PRODUCT_ERROR_MESSAGES.updateStock.insufficientStock;
    case "NEGATIVE_STOCK":
      return PRODUCT_ERROR_MESSAGES.updateStock.negativeStock;
    case "HAS_SALES":
      return PRODUCT_ERROR_MESSAGES.delete.hasSales;
    case "HAS_INVENTORY":
      return PRODUCT_ERROR_MESSAGES.delete.hasInventory;
    case "INVALID_FORMAT":
      return PRODUCT_ERROR_MESSAGES.bulkImport.invalidFormat;
    case "EMPTY_FILE":
      return PRODUCT_ERROR_MESSAGES.bulkImport.emptyFile;
    case "TOO_MANY_ROWS":
      return PRODUCT_ERROR_MESSAGES.bulkImport.tooManyRows;
    case "VALIDATION_FAILED":
      return PRODUCT_ERROR_MESSAGES.bulkImport.validationFailed;
    case "INVALID_IMAGE_TYPE":
      return PRODUCT_ERROR_MESSAGES.uploadImages.invalidType;
    case "IMAGE_TOO_LARGE":
      return PRODUCT_ERROR_MESSAGES.uploadImages.tooLarge;
    case "MAX_IMAGES_EXCEEDED":
      return PRODUCT_ERROR_MESSAGES.uploadImages.maxImages;
    default:
      // Handle status codes
      if (error.statusCode === 404) {
        return PRODUCT_ERROR_MESSAGES.update.notFound;
      }
      if (error.statusCode === 409) {
        return PRODUCT_ERROR_MESSAGES.create.barcodeExists;
      }
      if (error.statusCode === 400) {
        if (operation === "create") {
          return PRODUCT_ERROR_MESSAGES.create.missingRequired;
        }
        if (operation === "update") {
          return PRODUCT_ERROR_MESSAGES.update.noChanges;
        }
      }
      if (error.statusCode === 422) {
        if (error.details) {
          if (error.details.price) return PRODUCT_ERROR_MESSAGES.create.invalidPrice;
          if (error.details.quantity) return PRODUCT_ERROR_MESSAGES.create.invalidQuantity;
          if (error.details.category) return PRODUCT_ERROR_MESSAGES.create.invalidCategory;
        }
        return PRODUCT_ERROR_MESSAGES.create.missingRequired;
      }
      return error.message || PRODUCT_ERROR_MESSAGES[operation] || PRODUCT_ERROR_MESSAGES.getAll;
  }
};

const productService = {
  getAll: async (params = {}) => {
    try {
      // Sanitize params: remove undefined, null, or empty string values
      const sanitizedParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
      );
      
      const query = new URLSearchParams(sanitizedParams).toString();
      const endpoint = `/api/v1/products${query ? `?${query}` : ""}`;
      const data = await api(endpoint);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Get all error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "getAll"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Get all error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.getAll),
        500,
        "PRODUCTS_FETCH_ERROR"
      );
    }
  },

  getCategories: async () => {
    try {
      const data = await api("/api/v1/products/categories");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Get categories error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "getCategories"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Get categories error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.getCategories),
        500,
        "CATEGORIES_FETCH_ERROR"
      );
    }
  },

  getLowStock: async () => {
    try {
      const data = await api("/api/v1/products/low-stock");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Get low stock error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "getLowStock"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Get low stock error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.getLowStock),
        500,
        "LOW_STOCK_FETCH_ERROR"
      );
    }
  },

  getByBarcode: async (barcode) => {
    try {
      const data = await api(`/api/v1/products/barcode/${barcode}`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Get by barcode error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "getByBarcode"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Get by barcode error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.getByBarcode),
        500,
        "BARCODE_LOOKUP_ERROR"
      );
    }
  },

  getById: async (id) => {
    try {
      const data = await api(`/api/v1/products/${id}`);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Get by ID error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "getById"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Get by ID error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.getById),
        500,
        "PRODUCT_DETAILS_ERROR"
      );
    }
  },

  create: async (productData) => {
    try {
      const data = await api("/api/v1/products", {
        method: "POST",
        body: JSON.stringify(productData),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Create error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "create"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Create error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.create.missingRequired),
        500,
        "PRODUCT_CREATE_ERROR"
      );
    }
  },

  bulkImport: async (products) => {
    try {
      const data = await api("/api/v1/products/bulk-import", {
        method: "POST",
        body: JSON.stringify(products),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Bulk import error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "bulkImport"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Bulk import error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.bulkImport.invalidFormat),
        500,
        "BULK_IMPORT_ERROR"
      );
    }
  },

  uploadImages: async (id, formData) => {
    try {
      const data = await api(`/api/v1/products/${id}/images`, {
        method: "POST",
        body: formData,
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Upload images error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "uploadImages"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Upload images error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.uploadImages.invalidType),
        500,
        "IMAGE_UPLOAD_ERROR"
      );
    }
  },

  update: async (id, productData) => {
    try {
      const data = await api(`/api/v1/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Update error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "update"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Update error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.update.noChanges),
        500,
        "PRODUCT_UPDATE_ERROR"
      );
    }
  },

  updateStock: async (id, stockData) => {
    try {
      const data = await api(`/api/v1/products/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify(stockData),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Update stock error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "updateStock"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Update stock error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.updateStock.insufficientStock),
        500,
        "STOCK_UPDATE_ERROR"
      );
    }
  },

  delete: async (id) => {
    try {
      const data = await api(`/api/v1/products/${id}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Products] Delete error:", error.message);
        throw new ApiError(
          getProductErrorMessage(error, "delete"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Products] Delete error:", error);
      throw new ApiError(
        getErrorMessage(error, PRODUCT_ERROR_MESSAGES.delete.notFound),
        500,
        "PRODUCT_DELETE_ERROR"
      );
    }
  },
};

export default productService;
