import api from "../../lib/api";

const salesService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/sales${query ? `?${query}` : ""}`;
    return api(endpoint);
  },
  
  getDailySummary: () => api("/api/v1/sales/daily-summary"),
  
  getById: (id) => api(`/api/v1/sales/${id}`),
  
  create: (saleData) => api("/api/v1/sales", {
    method: "POST",
    body: JSON.stringify(saleData),
  }),
  
  getReceipt: (id) => api(`/api/v1/sales/${id}/receipt`),
  
  cancel: (id, reason) => api(`/api/v1/sales/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  }),
};

export default salesService;
