import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Package, RefreshCw, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import productService from "./productService";
import { useToast } from "@/contexts/ToastContext";
import { ProductForm } from "./ProductForm";

export function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;
  const { showToast } = useToast();

  const fetchProducts = async (currentSearch = searchTerm, currentPage = page) => {
    setLoading(true);
    try {
      const data = await productService.getAll({
        page: currentPage,
        limit,
        search: currentSearch
      });
      
      const invList = data.data || [];
      setProducts(invList);
      
      // Update pagination info if available from backend
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || invList.length);
      } else {
        // Fallback for simple list responses
        setTotalPages(1);
        setTotalCount(invList.length);
      }
    } catch (error) {
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simple debounce for search
    const handler = setTimeout(() => {
      setPage(1);
      fetchProducts(searchTerm, 1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(searchTerm, page);
    }
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await productService.delete(id);
      showToast("Product deleted successfully", "success");
      fetchProducts();
    } catch (error) {
      showToast("Failed to delete product", "error");
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        showToast("Product updated successfully", "success");
      } else {
        await productService.create(formData);
        showToast("Product created successfully", "success");
      }
      setIsSheetOpen(false);
      setEditingProduct(null);
      fetchProducts(); 
    } catch (error) {
      showToast(editingProduct ? "Failed to update product" : "Failed to create product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  };

  const openAddSheet = () => {
    setEditingProduct(null);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your inventory, categories, and stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openAddSheet}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>All Products</CardTitle>
              <CardDescription>A list of all products in your store.</CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          {product.name}
                          {product.barcode && (
                            <div className="text-[10px] text-muted-foreground uppercase font-mono">
                              {product.barcode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {product.category || "Uncategorized"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        ₱{Number(product.unit_price || product.price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold ${Number(product.stock_quantity || product.stock || 0) <= Number(product.low_stock_threshold || product.min_stock_level || 5) ? 'text-destructive' : ''}`}>
                          {product.stock_quantity || product.stock || 0}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          / {product.unit || 'pcs'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {products.length} of {totalCount} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <div className="text-sm font-medium px-2">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingProduct ? "Edit Product" : "Add New Product"}</SheetTitle>
            <SheetDescription>
              {editingProduct 
                ? "Update the product details below. All fields are required except description." 
                : "Enter the details for the new product. All fields are required except description."}
            </SheetDescription>
          </SheetHeader>
          <ProductForm 
            product={editingProduct} 
            onSubmit={handleSave} 
            onCancel={() => setIsSheetOpen(false)} 
            loading={saving}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
