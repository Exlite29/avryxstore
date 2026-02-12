import axios from "axios";
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
 * Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: { ...config.headers, Authorization: token ? 'Bearer [HIDDEN]' : 'None' },
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error("[API Request Exception]:", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors and extract data
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}:`, response.data);
    return response.data;
  },
  (error) => {
    let structuredError;

    if (error.response) {
      // The server responded with a status code outside the 2xx range
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem("token");
        // Only redirect if not already on login or landing page
        if (!window.location.pathname.includes("/login") && window.location.pathname !== "/") {
          window.location.href = "/login";
        }
      }

      const message = data?.message || HTTP_ERROR_MESSAGES[status] || `Request failed with status ${status}`;
      const errorCode = data?.code || data?.errorCode || null;
      const details = data?.details || data?.errors || null;

      structuredError = new ApiError(message, status, errorCode, details);
      console.warn(`[API Error Response] Status ${status}:`, structuredError);
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === 'ECONNABORTED') {
        structuredError = new ApiError(HTTP_ERROR_MESSAGES.TIMEOUT_ERROR, 0, "TIMEOUT_ERROR");
      } else {
        structuredError = new ApiError(HTTP_ERROR_MESSAGES.NETWORK_ERROR, 0, "NETWORK_ERROR");
      }
      console.error("[API Network Error]:", error);
    } else {
      // Something happened in setting up the request
      structuredError = new ApiError(error.message || HTTP_ERROR_MESSAGES[500], 500, "UNKNOWN_ERROR");
      console.error("[API Request Setup Error]:", error);
    }

    return Promise.reject(structuredError);
  }
);

/**
 * Main api function maintaining the same signature for backward compatibility
 */
const api = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers, ...rest } = options;
  
  // Standardize: Remove leading slash if present because baseURL handles it
  const cleanUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Map fetch 'body' to axios 'data'
  // Also handle FormData automatically (axios does this, but we ensure it's passed)
  const config = {
    url: cleanUrl,
    method: method.toUpperCase(),
    headers: { ...headers },
    data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
    ...rest
  };

  // If there's a Content-Type in options.headers, axios will use it
  // If body is FormData, axios will handle Content-Type transition automatically

  return apiClient(config);
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

