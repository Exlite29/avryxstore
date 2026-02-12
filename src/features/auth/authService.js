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
      const data = await api("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      console.log("[Auth] Registration successful");
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Auth] Registration error:", error.message);
        throw error;
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
      const data = await api("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      console.log("[Auth] Login successful");
      return data;
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
      const data = await api("/api/v1/auth/refresh-token", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      return data;
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

  getProfile: async () => {
    try {
      const data = await api("/api/v1/auth/profile");
      return data;
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

  updateProfile: async (profileData) => {
    try {
      const data = await api("/api/v1/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
      return data;
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

  changePassword: async (passwordData) => {
    try {
      const data = await api("/api/v1/auth/change-password", {
        method: "POST",
        body: JSON.stringify(passwordData),
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("[Auth] Change password API error:", error.message);
        throw new ApiError(
          getPasswordErrorMessage(error),
          error.statusCode,
          error.errorCode
        );
      }
      console.error("[Auth] Change password error:", error);
      throw new ApiError(
        AUTH_ERROR_MESSAGES.changePassword.currentPasswordWrong,
        500,
        "PASSWORD_CHANGE_ERROR"
      );
    }
  },

  logout: async () => {
    try {
      const data = await api("/api/v1/auth/logout", {
        method: "POST",
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          return { success: true };
        }
        throw error;
      }
      console.error("[Auth] Logout error:", error);
      return { success: true };
    }
  },
};

export default authService;
