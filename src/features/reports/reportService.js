import api from "../../lib/api";

const reportService = {
  getSalesReports: () => api("/api/v1/reports/sales"),
  
  getTopProducts: () => api("/api/v1/reports/sales/top-products"),
  
  getDailySales: () => api("/api/v1/reports/sales/daily"),
  
  getCashflow: () => api("/api/v1/reports/sales/cashflow"),
  
  getInventoryReports: () => api("/api/v1/reports/inventory"),
  
  getInventoryValuation: () => api("/api/v1/reports/inventory/valuation"),
  
  getScannerMetrics: () => api("/api/v1/reports/scanner/metrics"),
};

export default reportService;
