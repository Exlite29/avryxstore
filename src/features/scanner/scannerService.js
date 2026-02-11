import api from "../../lib/api";

const scannerService = {
  scanBarcode: (barcode) => api("/api/v1/scanner/barcode", {
    method: "POST",
    body: JSON.stringify({ barcode }),
  }),
  
  scanImage: (formData) => api("/api/v1/scanner/image", {
    method: "POST",
    body: formData,
  }),
  
  bulkScan: (barcodes) => api("/api/v1/scanner/bulk-scan", {
    method: "POST",
    body: JSON.stringify({ barcodes }),
  }),
  
  quickSale: (barcode, quantity = 1) => api("/api/v1/scanner/quick-sale", {
    method: "POST",
    body: JSON.stringify({ barcode, quantity }),
  }),
  
  getHistory: () => api("/api/v1/scanner/history"),
};

export default scannerService;
