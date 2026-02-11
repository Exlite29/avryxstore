import api from "../../lib/api";

const inventoryService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/inventory${query ? `?${query}` : ""}`;
    return api(endpoint);
  },
  
  getValuation: () => api("/api/v1/inventory/valuation"),
  
  getByProduct: (productId) => api(`/api/v1/inventory/product/${productId}`),
  
  getMovements: (productId) => api(`/api/v1/inventory/product/${productId}/movements`),
  
  addStock: (productId, data) => api(`/api/v1/inventory/product/${productId}/add`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  
  removeStock: (productId, data) => api(`/api/v1/inventory/product/${productId}/remove`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  
  adjustStock: (productId, data) => api(`/api/v1/inventory/product/${productId}/adjust`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

export default inventoryService;
