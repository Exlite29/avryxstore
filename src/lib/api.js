import { HTTP_ERROR_MESSAGES } from "./errorMessages";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, errorCode = null, details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse error response from API
 */
const parseErrorResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  let errorData = {};
  
  if (contentType && contentType.includes("application/json")) {
    try {
      errorData = await response.json();
    } catch {
      // JSON parsing failed, use default
    }
  } else {
    // Try to get text response
    try {
      const text = await response.text();
      errorData.message = text || `Request failed with status ${response.status}`;
    } catch {
      errorData.message = `Request failed with status ${response.status}`;
    }
  }
  
  return {
    message: errorData.message || HTTP_ERROR_MESSAGES[response.status] || `Request failed with status ${response.status}`,
    errorCode: errorData.code || errorData.errorCode || null,
    details: errorData.details || errorData.errors || null,
  };
};

/**
 * Network error handler
 */
const handleNetworkError = (error) => {
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return new ApiError(
      HTTP_ERROR_MESSAGES.NETWORK_ERROR,
      0,
      "NETWORK_ERROR"
    );
  }
  
  if (error.name === "AbortError") {
    return new ApiError(
      HTTP_ERROR_MESSAGES.TIMEOUT_ERROR,
      0,
      "TIMEOUT_ERROR"
    );
  }
  
  return new ApiError(
    error.message || HTTP_ERROR_MESSAGES[500],
    500,
    "UNKNOWN_ERROR"
  );
};

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = { ...options.headers };

  // Only set application/json if not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Standardize: Remove trailing slash from both API_URL and endpoint
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const finalUrl = `${baseUrl}${cleanEndpoint}`;

  try {
    console.log(`[API Request] ${options.method || 'GET'} ${finalUrl}`, {
      headers: { ...headers, Authorization: token ? 'Bearer [HIDDEN]' : 'None' },
      body: options.body instanceof FormData ? 'FormData' : options.body
    });

    const response = await fetch(finalUrl, config);
    
    // Check if it's a 204 No Content or a delete operation with no body
    if (response.status === 204) {
      return null;
    }

    // Handle redirect (401 - Unauthorized)
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      // Optionally redirect to login
      window.location.href = "/login";
      throw new ApiError(
        HTTP_ERROR_MESSAGES[401],
        401,
        "UNAUTHORIZED"
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorInfo = await parseErrorResponse(response);
      console.warn(`[API Error Response] Status ${response.status}:`, errorInfo);
      
      throw new ApiError(
        errorInfo.message,
        response.status,
        errorInfo.errorCode,
        errorInfo.details
      );
    }

    console.log(`[API Response] ${finalUrl}:`, data);
    return data;
  } catch (error) {
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network and other errors
    const structuredError = handleNetworkError(error);
    console.error(`[API Exception] ${endpoint}:`, structuredError);
    throw structuredError;
  }
};

export default api;

// Export helper functions for specific error handling
export const isApiError = (error) => {
  return error instanceof ApiError;
};

export const getErrorStatus = (error) => {
  if (error instanceof ApiError) {
    return error.statusCode;
  }
  return error.status || error.statusCode || null;
};

export const getErrorCode = (error) => {
  if (error instanceof ApiError) {
    return error.errorCode;
  }
  return error.code || error.errorCode || null;
};
