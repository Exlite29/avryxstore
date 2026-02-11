const API_URL = import.meta.env.VITE_API_URL;

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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn(`[API Error Response] Status ${response.status}:`, data);
      const message = data.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error(`[API Exception] ${endpoint}:`, error);
    throw error;
  }
};

export default api;
