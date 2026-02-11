import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ProductForm({ product, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    unit_price: "",
    stock_quantity: "",
    low_stock_threshold: "5",
    unit: "pcs",
    description: ""
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        barcode: product.barcode || "",
        category: product.category || "",
        unit_price: product.unit_price || product.price || "",
        stock_quantity: product.stock_quantity || product.stock || "",
        low_stock_threshold: product.low_stock_threshold || product.min_stock_level || "5",
        unit: product.unit || "pcs",
        description: product.description || ""
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
            value={formData.barcode}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />
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
          />
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
