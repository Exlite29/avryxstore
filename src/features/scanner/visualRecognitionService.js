import api, { ApiError } from "../../lib/api";

/**
 * Service for handling visual recognition tasks using Cloudinary AI
 */
const visualRecognitionService = {
  /**
   * Recognizes product details from an image file
   * @param {File} imageFile - The image file to analyze
   * @returns {Promise<Object>} - The recognition results
   */
  recognizeFromImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await api("/api/v1/scanner/visual-recognize", {
        method: "POST",
        body: formData,
      });
      return response;
    } catch (error) {
      console.error("[Visual Recognition] Image recognition error:", error);
      throw error;
    }
  },

  /**
   * Recognizes product details from a base64 encoded image string
   * @param {string} base64Data - The base64 data string
   * @returns {Promise<Object>} - The recognition results
   */
  recognizeFromBase64: async (base64Data) => {
    try {
      const response = await api("/api/v1/scanner/visual-recognize/base64", {
        method: "POST",
        body: JSON.stringify({ image: base64Data }),
      });
      return response;
    } catch (error) {
      console.error("[Visual Recognition] Base64 recognition error:", error);
      throw error;
    }
  },

  /**
   * Trains the AI model for a specific product using its image
   * @param {string} productId - The ID of the product
   * @param {File} imageFile - The training image
   * @returns {Promise<Object>} - The training results
   */
  trainProductRecognition: async (productId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await api(`/api/v1/scanner/visual-recognize/train/${productId}`, {
        method: "POST",
        body: formData,
      });
      return response;
    } catch (error) {
      console.error("[Visual Recognition] Training error:", error);
      throw error;
    }
  },

  /**
   * Gets category suggestions based on AI tagging
   * @returns {Promise<Object>} - Category suggestions
   */
  getSuggestions: async () => {
    try {
      const response = await api("/api/v1/scanner/visual-recognize/suggestions");
      return response;
    } catch (error) {
      console.error("[Visual Recognition] Suggestions error:", error);
      throw error;
    }
  }
};

export default visualRecognitionService;
