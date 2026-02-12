import api, { ApiError, isApiError, getErrorCode } from "../../lib/api";
import {
  AUTH_ERROR_MESSAGES,
  HTTP_ERROR_MESSAGES,
  getErrorMessage,
} from "../../lib/errorMessages";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Map API error codes to user-friendly messages
 */
const getAuthErrorMessage = (error) => {
  if (!isApiError(error)) {
    return getErrorMessage(error, AUTH_ERROR_MESSAGES.login.invalidCredentials);
  }

  const errorCode = getErrorCode(error);

  // Handle specific status codes
  switch (error.statusCode) {
    case 401:
      return AUTH_ERROR_MESSAGES.login.invalidCredentials;
    case 403:
      return AUTH_ERROR_MESSAGES.login.accountLocked;
    case 404:
      return AUTH_ERROR_MESSAGES.login.noAccount;
    case 422:
      // Handle validation errors
      if (error.details) {
        const details = error.details;
        if (details.email) return AUTH_ERROR_MESSAGES.register.invalidEmail;
        if (details.password) return AUTH_ERROR_MESSAGES.register.weakPassword;
      }
      return AUTH_ERROR_MESSAGES.register.missingFields;
    default:
      // Handle specific error codes
      if (errorCode === "EMAIL_EXISTS") {
        return AUTH_ERROR_MESSAGES.register.emailExists;
      }
      if (errorCode === "USERNAME_EXISTS") {
        return AUTH_ERROR_MESSAGES.register.usernameExists;
      }
      if (errorCode === "INVALID_CREDENTIALS") {
        return AUTH_ERROR_MESSAGES.login.invalidCredentials;
      }
      if (errorCode === "ACCOUNT_LOCKED") {
        return AUTH_ERROR_MESSAGES.login.accountLocked;
      }
      if (errorCode === "ACCOUNT_INACTIVE") {
        return AUTH_ERROR_MESSAGES.login.inactiveAccount;
      }
      return error.message || AUTH_ERROR_MESSAGES.login.invalidCredentials;
  }
};

/**
 * Map profile/update errors to user-friendly messages
 */
const getProfileErrorMessage = (error) => {
  if (!isApiError(error)) {
    return AUTH_ERROR_MESSAGES.profile;
  }

  const errorCode = getErrorCode(error);

  if (errorCode === "EMAIL_EXISTS") {
    return AUTH_ERROR_MESSAGES.register.emailExists;
  }
  if (errorCode === "USERNAME_EXISTS") {
    return AUTH_ERROR_MESSAGES.register.usernameExists;
  }

  return error.message || AUTH_ERROR_MESSAGES.profile;
};

/**
 * Map password change errors to user-friendly messages
 */
const getPasswordErrorMessage = (error) => {
  if (!isApiError(error)) {
    return AUTH_ERROR_MESSAGES.changePassword.currentPasswordWrong;
  }

  const errorCode = getErrorCode(error);

  switch (errorCode) {
    case "CURRENT_PASSWORD_WRONG":
      return AUTH_ERROR_MESSAGES.changePassword.currentPasswordWrong;
    case "PASSWORDS_NOT_MATCH":
      return AUTH_ERROR_MESSAGES.changePassword.passwordsNotMatch;
    case "WEAK_PASSWORD":
      return AUTH_ERROR_MESSAGES.changePassword.weakNewPassword;
    case "SAME_AS_OLD":
      return AUTH_ERROR_MESSAGES.changePassword.sameAsOld;
    default:
      if (error.statusCode === 400) {
        return AUTH_ERROR_MESSAGES.changePassword.currentPasswordWrong;
      }
      return error.message || AUTH_ERROR_MESSAGES.changePassword.currentPasswordWrong;
  }
};

const authService = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        
        let errorMessage = AUTH_ERROR_MESSAGES.register.missingFields;
        
        if (errorInfo.code === "EMAIL_EXISTS") {
          errorMessage = AUTH_ERROR_MESSAGES.register.emailExists;
        } else if (errorInfo.code === "USERNAME_EXISTS") {
          errorMessage = AUTH_ERROR_MESSAGES.register.usernameExists;
        } else if (errorInfo.message) {
          errorMessage = errorInfo.message;
        }

        throw new ApiError(
          errorMessage,
          response.status,
          errorInfo.code || "REGISTRATION_FAILED"
        );
      }

      console.log("[Auth] Registration successful");
      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Auth] Registration error:", error.message);
        throw new ApiError(error.message, error.statusCode, error.errorCode);
      }
      
      console.error("[Auth] Registration error:", error);
      throw new ApiError(
        getErrorMessage(error, AUTH_ERROR_MESSAGES.register.missingFields),
        500,
        "REGISTRATION_ERROR"
      );
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new ApiError(
          getAuthErrorMessage({ statusCode: response.status, ...errorInfo }),
          response.status,
          errorInfo.code || "LOGIN_FAILED"
        );
      }

      console.log("[Auth] Login successful");
      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Auth] Login error:", error.message);
        throw error;
      }
      
      console.error("[Auth] Login error:", error);
      throw new ApiError(
        getErrorMessage(error, AUTH_ERROR_MESSAGES.login.invalidCredentials),
        500,
        "LOGIN_ERROR"
      );
    }
  },

  refreshToken: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new ApiError(
          AUTH_ERROR_MESSAGES.refreshToken,
          response.status,
          errorInfo.code || "REFRESH_TOKEN_FAILED"
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error("[Auth] Token refresh error:", error);
      throw new ApiError(
        AUTH_ERROR_MESSAGES.refreshToken,
        500,
        "REFRESH_TOKEN_ERROR"
      );
    }
  },

  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new ApiError(
          AUTH_ERROR_MESSAGES.profile,
          response.status,
          errorInfo.code || "PROFILE_FETCH_FAILED"
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error("[Auth] Get profile error:", error);
      throw new ApiError(
        AUTH_ERROR_MESSAGES.profile,
        500,
        "PROFILE_FETCH_ERROR"
      );
    }
  },

  updateProfile: async (token, profileData) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new ApiError(
          getProfileErrorMessage(errorInfo),
          response.status,
          errorInfo.code || "PROFILE_UPDATE_FAILED"
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error("[Auth] Update profile error:", error);
      throw new ApiError(
        AUTH_ERROR_MESSAGES.updateProfile,
        500,
        "PROFILE_UPDATE_ERROR"
      );
    }
  },

  changePassword: async (token, passwordData) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new ApiError(
          getPasswordErrorMessage(errorInfo),
          response.status,
          errorInfo.code || "PASSWORD_CHANGE_FAILED"
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error("[Auth] Change password error:", error);
      throw new ApiError(
        getPasswordErrorMessage(error),
        500,
        "PASSWORD_CHANGE_ERROR"
      );
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
      });

      if (!response.ok && response.status !== 401) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new ApiError(
          AUTH_ERROR_MESSAGES.logout,
          response.status,
          errorInfo.code || "LOGOUT_FAILED"
        );
      }

      return response.json().catch(() => ({}));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error("[Auth] Logout error:", error);
      // Don't throw on logout error, just log it
      return { success: true };
    }
  },
};

export default authService;
