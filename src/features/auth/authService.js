const API_URL = import.meta.env.VITE_API_URL;

const authService = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error body");
        console.error("Registration error response:", errorText);
        let message = `Registration failed: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          message = errorData.message || message;
        } catch (e) {
          // Body is not JSON
        }
        throw new Error(message);
      }
      return response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  refreshToken: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return response.json();
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
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
      return response.json();
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
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
      return response.json();
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
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
      return response.json();
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
      });
      return response.json();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};

export default authService;
