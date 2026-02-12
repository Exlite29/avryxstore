/**
 * Error messages utility for API calls
 * Provides user-friendly error messages for different error scenarios
 */

// HTTP Status code error mappings
export const HTTP_ERROR_MESSAGES = {
  400: "The request was invalid. Please check your input and try again.",
  401: "Your session has expired. Please log in again to continue.",
  403: "You don't have permission to perform this action. Please contact your administrator.",
  404: "The requested resource was not found. It may have been deleted or moved.",
  409: "This action conflicts with existing data. Please review and try again.",
  422: "The data provided is invalid. Please check all required fields.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "A server error occurred. Please try again later or contact support.",
  502: "The server is temporarily unavailable. Please try again later.",
  503: "The service is temporarily unavailable. Please try again later.",
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  TIMEOUT_ERROR: "The request timed out. Please try again.",
};

// Auth-related error messages
export const AUTH_ERROR_MESSAGES = {
  register: {
    emailExists: "An account with this email already exists.",
    usernameExists: "This username is already taken.",
    weakPassword: "Password must be at least 8 characters with numbers and letters.",
    invalidEmail: "Please enter a valid email address.",
    missingFields: "Please fill in all required fields.",
  },
  login: {
    invalidCredentials: "Invalid email or password. Please try again.",
    accountLocked: "Your account has been locked. Please contact support.",
    inactiveAccount: "Your account is inactive. Please contact support.",
    noAccount: "No account found with this email. Please register first.",
  },
  refreshToken: "Unable to refresh your session. Please log in again.",
  profile: "Unable to load your profile. Please try again.",
  updateProfile: "Unable to update your profile. Please try again.",
  changePassword: {
    currentPasswordWrong: "The current password is incorrect.",
    passwordsNotMatch: "New passwords do not match.",
    weakNewPassword: "New password must be at least 8 characters with numbers and letters.",
    sameAsOld: "New password must be different from the current password.",
  },
  logout: "Unable to log out. Please try again.",
};

// Product-related error messages
export const PRODUCT_ERROR_MESSAGES = {
  getAll: "Unable to load products. Please refresh the page.",
  getById: "Unable to load product details. Please try again.",
  getByBarcode: "Product not found for this barcode.",
  getCategories: "Unable to load categories. Please try again.",
  getLowStock: "Unable to load low stock products. Please try again.",
  create: {
    missingRequired: "Please fill in all required product fields.",
    invalidPrice: "Please enter a valid price.",
    invalidQuantity: "Please enter a valid quantity.",
    invalidCategory: "Please select a valid category.",
    barcodeExists: "A product with this barcode already exists.",
  },
  update: {
    notFound: "Product not found. It may have been deleted.",
    noChanges: "No changes were made to the product.",
  },
  updateStock: {
    insufficientStock: "Insufficient stock available.",
    negativeStock: "Stock quantity cannot be negative.",
  },
  delete: {
    notFound: "Product not found. It may have already been deleted.",
    hasSales: "Cannot delete product with existing sales records.",
    hasInventory: "Cannot delete product with existing inventory.",
  },
  bulkImport: {
    invalidFormat: "Invalid file format. Please upload a valid file.",
    emptyFile: "The file appears to be empty.",
    tooManyRows: "Maximum 1000 products can be imported at once.",
    validationFailed: "Some products failed validation. Please review and try again.",
  },
  uploadImages: {
    invalidType: "Only image files (JPG, PNG, GIF) are allowed.",
    tooLarge: "Image size must be less than 5MB.",
    maxImages: "Maximum 5 images per product.",
  },
};

// Inventory-related error messages
export const INVENTORY_ERROR_MESSAGES = {
  getAll: "Unable to load inventory. Please refresh the page.",
  getValuation: "Unable to load inventory valuation. Please try again.",
  getByProduct: "Unable to load inventory details. Please try again.",
  getMovements: "Unable to load stock movements. Please try again.",
  addStock: {
    invalidQuantity: "Please enter a valid quantity.",
    negativeQuantity: "Quantity cannot be negative.",
    notFound: "Product not found for inventory adjustment.",
  },
  removeStock: {
    insufficientStock: "Insufficient stock to remove.",
    exceedsStock: "Cannot remove more than available stock.",
    reasonRequired: "Please provide a reason for stock removal.",
  },
  adjustStock: {
    sameQuantity: "New quantity is the same as current quantity.",
    negativeQuantity: "Quantity cannot be negative.",
    notFound: "Product not found for adjustment.",
  },
};

// Sales-related error messages
export const SALES_ERROR_MESSAGES = {
  getAll: "Unable to load sales. Please refresh the page.",
  getById: "Unable to load sale details. Please try again.",
  getDailySummary: "Unable to load daily summary. Please try again.",
  getReceipt: "Unable to generate receipt. Please try again.",
  create: {
    emptyCart: "Your cart is empty. Add items before completing the sale.",
    invalidItems: "Some items in your cart are no longer available.",
    insufficientStock: "Insufficient stock for one or more items.",
    productNotFound: "One or more products not found.",
    invalidQuantity: "Please enter a valid quantity for all items.",
    invalidPrice: "Invalid price for one or more items.",
    paymentFailed: "Payment processing failed. Please try again.",
    paymentDeclined: "Payment was declined. Please try a different payment method.",
  },
  cancel: {
    notFound: "Sale not found. It may have already been cancelled.",
    alreadyCancelled: "This sale has already been cancelled.",
    tooLate: "Sales can only be cancelled within 24 hours of creation.",
    hasRefund: "Cannot cancel a sale with refunds.",
    reasonRequired: "Please provide a reason for cancellation.",
  },
};

// Scanner-related error messages
export const SCANNER_ERROR_MESSAGES = {
  scanBarcode: {
    invalid: "Invalid barcode format. Please scan a valid barcode.",
    notFound: "No product found for this barcode.",
  },
  scanImage: {
    noBarcode: "No barcode detected in the image. Please try a clearer image.",
    multipleBarcodes: "Multiple barcodes detected. Please scan one at a time.",
    invalidImage: "Invalid image. Please upload a clear image with a barcode.",
  },
  bulkScan: {
    emptyList: "Please provide at least one barcode.",
    tooMany: "Maximum 50 barcodes can be scanned at once.",
    notFound: "Some barcodes were not found.",
  },
  quickSale: {
    productNotFound: "Product not found.",
    outOfStock: "This product is out of stock.",
    multipleFound: "Multiple products found with this barcode.",
    invalidQuantity: "Please enter a valid quantity.",
    priceNotSet: "This product does not have a set price.",
  },
  getHistory: "Unable to load scan history. Please try again.",
};

// Reports-related error messages
export const REPORTS_ERROR_MESSAGES = {
  getSalesReports: "Unable to load sales reports. Please try again.",
  getTopProducts: "Unable to load top products report. Please try again.",
  getDailySales: "Unable to load daily sales report. Please try again.",
  getCashflow: "Unable to load cashflow report. Please try again.",
  getInventoryReports: "Unable to load inventory reports. Please try again.",
  getInventoryValuation: "Unable to load inventory valuation report. Please try again.",
  getScannerMetrics: "Unable to load scanner metrics. Please try again.",
};

// Generic error helpers
export const getErrorMessage = (error, defaultMessage = "An unexpected error occurred. Please try again.") => {
  if (!error) return defaultMessage;
  
  // If error is a string
  if (typeof error === "string") return error;
  
  // If error is an object with message property
  if (error.message) {
    // Check for network errors
    if (error.message.includes("fetch") || error.message.includes("NetworkError")) {
      return HTTP_ERROR_MESSAGES.NETWORK_ERROR;
    }
    // Check for timeout errors
    if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
      return HTTP_ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    return error.message;
  }
  
  // If error is an object with data property (API response)
  if (error.data && error.data.message) {
    return error.data.message;
  }
  
  return defaultMessage;
};

export const getStatusCodeErrorMessage = (statusCode) => {
  return HTTP_ERROR_MESSAGES[statusCode] || HTTP_ERROR_MESSAGES[500];
};

// Error code to message mapping for specific API error codes
export const ERROR_CODES = {
  // Auth
  EMAIL_EXISTS: AUTH_ERROR_MESSAGES.register.emailExists,
  USERNAME_EXISTS: AUTH_ERROR_MESSAGES.register.usernameExists,
  INVALID_CREDENTIALS: AUTH_ERROR_MESSAGES.login.invalidCredentials,
  ACCOUNT_LOCKED: AUTH_ERROR_MESSAGES.login.accountLocked,
  
  // Products
  BARCODE_EXISTS: PRODUCT_ERROR_MESSAGES.create.barcodeExists,
  INSUFFICIENT_STOCK: PRODUCT_ERROR_MESSAGES.updateStock.insufficientStock,
  PRODUCT_NOT_FOUND: PRODUCT_ERROR_MESSAGES.update.notFound,
  
  // Inventory
  NEGATIVE_QUANTITY: INVENTORY_ERROR_MESSAGES.addStock.negativeQuantity,
  
  // Sales
  CART_EMPTY: SALES_ERROR_MESSAGES.create.emptyCart,
  SALE_NOT_FOUND: SALES_ERROR_MESSAGES.cancel.notFound,
  
  // Scanner
  INVALID_BARCODE: SCANNER_ERROR_MESSAGES.scanBarcode.invalid,
  PRODUCT_NOT_FOUND_SCAN: SCANNER_ERROR_MESSAGES.quickSale.productNotFound,
};

export const getErrorByCode = (code) => {
  return ERROR_CODES[code] || null;
};
