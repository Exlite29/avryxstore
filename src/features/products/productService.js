import api from "../../lib/api";

const productService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/v1/products${query ? `?${query}` : ""}`;
    return api(endpoint);
  },
  
  getCategories: () => api("/api/v1/products/categories"),
  
  getLowStock: () => api("/api/v1/products/low-stock"),
  
  getByBarcode: (barcode) => api(`/api/v1/products/barcode/${barcode}`),
  
  getById: (id) => api(`/api/v1/products/${id}`),
  
  create: (productData) => api("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(productData),
  }),
  
  bulkImport: (products) => api("/api/v1/products/bulk-import", {
    method: "POST",
    body: JSON.stringify(products),
  }),
  
  uploadImages: (id, formData) => api(`/api/v1/products/${id}/images`, {
    method: "POST",
    body: formData,
  }),
  
  update: (id, productData) => api(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  }),
  
  updateStock: (id, stockData) => api(`/api/v1/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify(stockData),
  }),
  
  delete: (id) => api(`/api/v1/products/${id}`, {
    method: "DELETE",
  }),
};

export default productService;
