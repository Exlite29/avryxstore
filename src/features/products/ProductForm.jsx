import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Upload, X } from "lucide-react";
import productService from "./productService";

const DRAFT_KEY = "avryx_product_form_draft";
const COMMON_UNITS = ["pcs", "kg", "g", "box", "pack", "dozen", "bottle", "can", "sachet", "liter"];

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export function ProductForm({ product, onSubmit, onCancel, loading, barcodeRef, presetBarcode }) {
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    unit_price: "",
    stock_quantity: "",
    low_stock_threshold: "5",
    unit: "pcs",
    description: "",
    image_url: ""
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const isDraft = !product;
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    // Restore a previously saved draft when creating a new product
    if (!isDraft) return;
    const draft = loadDraft();
    if (draft) {
      const { barcode: draftBarcode, ...rest } = draft;
      setFormData((prev) => ({
        ...prev,
        ...rest,
        // A barcode scanned into the form should always win over a stale draft
        barcode: presetBarcode || draftBarcode || prev.barcode
      }));
      setImagePreview(draft.image_url || null);
      setDraftSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (presetBarcode) {
      setFormData((prev) => ({ ...prev, barcode: presetBarcode }));
      barcodeRef?.current?.focus();
    }
  }, [presetBarcode, barcodeRef]);

  useEffect(() => {
    if (!product) return;
    setFormData({
      name: product.name || "",
      barcode: product.barcode || "",
      category: product.category || "",
      unit_price: product.unit_price || product.price || "",
      stock_quantity: product.stock_quantity || product.stock || "",
      low_stock_threshold: product.low_stock_threshold || product.min_stock_level || "5",
      unit: product.unit || "pcs",
      description: product.description || "",
      image_url: product.image_url || ""
    });
    if (product.image_url) {
      setImagePreview(product.image_url);
    }
  }, [product]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await productService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Autosave the draft (new product only) so an in-progress entry survives a refresh
  useEffect(() => {
    if (!isDraft) return;
    setDraftSaved(false);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        setDraftSaved(true);
      } catch {
        // Storage unavailable; the draft simply won't persist
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData, isDraft]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore storage errors on clear
    }
    setDraftSaved(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First save/update the product
    try {
      const savedProduct = await onSubmit(formData);
      
      // A new product was created successfully, so the draft is no longer needed
      if (isDraft) {
        clearDraft();
      }
      
      // If there's a file selected and we have a product ID, upload it
      const productId = product?.id || savedProduct?.id || savedProduct?.data?.id;
      
      if (selectedFile && productId) {
        setUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append("image", selectedFile);
        await productService.uploadImages(productId, imageFormData);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter product name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            name="barcode"
            placeholder="Barcode"
            ref={barcodeRef}
            value={formData.barcode}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <div className="relative">
            <Input
              id="category"
              name="category"
              placeholder="Select or type category"
              value={formData.category}
              onChange={handleChange}
              list="category-list"
              autoComplete="off"
            />
             <datalist id="category-list">
               {categories.map((cat, index) => (
                 <option key={index} value={cat} />
               ))}
             </datalist>
             {categoriesLoading && <Skeleton className="h-3 w-24" role="status" aria-label="Loading categories" />}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit_price">Price (₱)</Label>
          <Input
            id="unit_price"
            name="unit_price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.unit_price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            name="unit"
            placeholder="pcs, kg, etc."
            value={formData.unit}
            onChange={handleChange}
            list="unit-list"
            autoComplete="off"
          />
          <datalist id="unit-list">
            {COMMON_UNITS.map((unit) => (
              <option key={unit} value={unit} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Initial Stock</Label>
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            placeholder="0"
            value={formData.stock_quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="low_stock_threshold">Min Stock Level</Label>
          <Input
            id="low_stock_threshold"
            name="low_stock_threshold"
            type="number"
            placeholder="5"
            value={formData.low_stock_threshold}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <div className="flex flex-col gap-4">
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden group">
              <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Label 
              htmlFor="image-upload" 
              className="w-full aspect-video rounded-lg border-2 border-dashed border-input bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <Input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </Label>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Optional description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {isDraft && draftSaved && (
          <span className="mr-auto self-center text-xs text-muted-foreground">Draft autosaved</span>
        )}
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploadingImage}>
          {(loading || uploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {uploadingImage ? "Uploading Image..." : (product ? "Update Product" : "Save Product")}
        </Button>
      </div>
    </form>
  );
}
