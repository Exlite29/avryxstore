import api, { ApiError, isApiError, getErrorCode } from "../../lib/api";
import {
  SCANNER_ERROR_MESSAGES,
  getErrorMessage,
  getStatusCodeErrorMessage,
} from "../../lib/errorMessages";

/**
 * Get user-friendly error message for scanner operations
 */
const getScannerErrorMessage = (error, operation) => {
  if (!isApiError(error)) {
    return SCANNER_ERROR_MESSAGES[operation] || SCANNER_ERROR_MESSAGES.getHistory;
  }

  const errorCode = getErrorCode(error);

  // Handle specific error codes
  switch (errorCode) {
    case "INVALID_BARCODE":
      return SCANNER_ERROR_MESSAGES.scanBarcode.invalid;
    case "PRODUCT_NOT_FOUND":
    case "BARCODE_NOT_FOUND":
      return SCANNER_ERROR_MESSAGES.scanBarcode.notFound;
    case "NO_BARCODE_DETECTED":
      return SCANNER_ERROR_MESSAGES.scanImage.noBarcode;
    case "MULTIPLE_BARCODES":
      return SCANNER_ERROR_MESSAGES.scanImage.multipleBarcodes;
    case "INVALID_IMAGE":
      return SCANNER_ERROR_MESSAGES.scanImage.invalidImage;
    case "EMPTY_LIST":
      return SCANNER_ERROR_MESSAGES.bulkScan.emptyList;
    case "TOO_MANY_BARCODES":
      return SCANNER_ERROR_MESSAGES.bulkScan.tooMany;
    case "PARTIAL_NOT_FOUND":
      return SCANNER_ERROR_MESSAGES.bulkScan.notFound;
    case "OUT_OF_STOCK":
      return SCANNER_ERROR_MESSAGES.quickSale.outOfStock;
    case "MULTIPLE_PRODUCTS":
      return SCANNER_ERROR_MESSAGES.quickSale.multipleFound;
    case "PRICE_NOT_SET":
      return SCANNER_ERROR_MESSAGES.quickSale.priceNotSet;
    case "INVALID_QUANTITY":
      return SCANNER_ERROR_MESSAGES.quickSale.invalidQuantity;
    default:
      // Handle status codes
      if (error.statusCode === 404) {
        if (operation === "scanBarcode") {
          return SCANNER_ERROR_MESSAGES.scanBarcode.notFound;
        }
        if (operation === "quickSale") {
          return SCANNER_ERROR_MESSAGES.quickSale.productNotFound;
        }
      }
      if (error.statusCode === 400) {
        if (operation === "scanBarcode") {
          return SCANNER_ERROR_MESSAGES.scanBarcode.invalid;
        }
        if (operation === "bulkScan") {
          return SCANNER_ERROR_MESSAGES.bulkScan.emptyList;
        }
      }
      if (error.statusCode === 422) {
        if (operation === "scanImage") {
          return SCANNER_ERROR_MESSAGES.scanImage.noBarcode;
        }
      }
      return error.message || SCANNER_ERROR_MESSAGES[operation] || SCANNER_ERROR_MESSAGES.getHistory;
  }
};

const scannerService = {
  scanBarcode: async (barcode) => {
    try {
      const data = await api("/api/v1/scanner/barcode", {
        method: "POST",
        body: JSON.stringify({ barcode }),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Scanner] Scan barcode error:", error.message);
        throw new ApiError(
          getScannerErrorMessage(error, "scanBarcode"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Scanner] Scan barcode error:", error);
      throw new ApiError(
        getErrorMessage(error, SCANNER_ERROR_MESSAGES.scanBarcode.notFound),
        500,
        "BARCODE_SCAN_ERROR"
      );
    }
  },

  scanImage: async (formData) => {
    try {
      const data = await api("/api/v1/scanner/image", {
        method: "POST",
        body: formData,
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Scanner] Scan image error:", error.message);
        throw new ApiError(
          getScannerErrorMessage(error, "scanImage"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Scanner] Scan image error:", error);
      throw new ApiError(
        getErrorMessage(error, SCANNER_ERROR_MESSAGES.scanImage.invalidImage),
        500,
        "IMAGE_SCAN_ERROR"
      );
    }
  },

  bulkScan: async (barcodes) => {
    try {
      const data = await api("/api/v1/scanner/bulk-scan", {
        method: "POST",
        body: JSON.stringify({ barcodes }),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Scanner] Bulk scan error:", error.message);
        throw new ApiError(
          getScannerErrorMessage(error, "bulkScan"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Scanner] Bulk scan error:", error);
      throw new ApiError(
        getErrorMessage(error, SCANNER_ERROR_MESSAGES.bulkScan.emptyList),
        500,
        "BULK_SCAN_ERROR"
      );
    }
  },

  quickSale: async (barcode, quantity = 1) => {
    try {
      const data = await api("/api/v1/scanner/quick-sale", {
        method: "POST",
        body: JSON.stringify({ barcode, quantity }),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Scanner] Quick sale error:", error.message);
        throw new ApiError(
          getScannerErrorMessage(error, "quickSale"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Scanner] Quick sale error:", error);
      throw new ApiError(
        getErrorMessage(error, SCANNER_ERROR_MESSAGES.quickSale.productNotFound),
        500,
        "QUICK_SALE_ERROR"
      );
    }
  },

  getHistory: async () => {
    try {
      const data = await api("/api/v1/scanner/history");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Scanner] Get history error:", error.message);
        throw new ApiError(
          getScannerErrorMessage(error, "getHistory"),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Scanner] Get history error:", error);
      throw new ApiError(
        getErrorMessage(error, SCANNER_ERROR_MESSAGES.getHistory),
        500,
        "HISTORY_FETCH_ERROR"
      );
    }
  },
};

export default scannerService;
