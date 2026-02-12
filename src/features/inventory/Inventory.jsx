import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Boxes, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Search,
  History,
  Settings2,
  PackageCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useToast } from "@/contexts/ToastContext";
import inventoryService from "./inventoryService";
import productService from "../products/productService";

export function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [valuation, setValuation] = useState({ total_value: 0, item_count: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState("add"); // add, remove, adjust
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;
  
  const { showToast } = useToast();

  const fetchData = async (currentSearch = searchTerm, currentPage = page) => {
    setLoading(true);
    try {
      const [invData, valData] = await Promise.all([
        inventoryService.getAll({
          page: currentPage,
          limit,
          search: currentSearch
        }),
        inventoryService.getValuation()
      ]);
      
      const invList = invData.inventory || invData.data || (Array.isArray(invData) ? invData : []);
      setInventory(invList);
      const vData = valData.data || valData || {};
      setValuation({
        total_value: vData.total_value || vData.value || 0,
        item_count: vData.item_count || vData.count || 0
      });
      
      if (invData.pagination) {
        setTotalPages(invData.pagination.totalPages || 1);
        setTotalCount(invData.pagination.total || invList.length);
      } else {
        setTotalPages(1);
        setTotalCount(invList.length);
      }
    } catch (error) {
      showToast("Failed to fetch inventory data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchData(searchTerm, 1);
    }, 600);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) {
      fetchData(searchTerm, page);
    }
  }, [page]);

  const handleOpenAdjustment = (product, type) => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentValue("");
    setAdjustmentReason("");
    setIsAdjustmentOpen(true);
  };

  const handleAdjustStock = async () => {
    if (!selectedProduct?.id) {
      showToast("No product selected or invalid product ID", "error");
      return;
    }

    if (!adjustmentValue || isNaN(adjustmentValue)) {
      showToast("Please enter a valid number", "error");
      return;
    }

    setSaving(true);
    try {
      const data = {
        quantity: Number(adjustmentValue),
        reason: adjustmentReason || `Manual ${adjustmentType}`
      };

      if (adjustmentType === "add") {
        await inventoryService.addStock(selectedProduct.id, data);
      } else if (adjustmentType === "remove") {
        await inventoryService.removeStock(selectedProduct.id, data);
      } else {
        await inventoryService.adjustStock(selectedProduct.id, data);
      }

      showToast(`Stock ${adjustmentType}ed successfully`, "success");
      setIsAdjustmentOpen(false);
      fetchData(); // Refresh data
    } catch (error) {
      showToast(error.message || "Failed to adjust stock", "error");
    } finally {
      setSaving(false);
    }
  };

  const lowStockCount = inventory.filter(item => Number(item.stock_quantity || item.stock || 0) <= Number(item.low_stock_threshold || item.min_stock_level || 5)).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Monitor stock levels, valuation, and product movements.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valuation.item_count || 0}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-destructive' : ''}`}>
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Items requiring restock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Valuation</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₱{Number(valuation.total_value || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Based on current stock price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Status</CardTitle>
            <PackageCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">Inventory sync active</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Inventory List</CardTitle>
              <CardDescription>Detailed overview of all stock levels.</CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock Level</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                  </TableRow>
                ) : inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No inventory records found.</TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => {
                    const isLow = Number(item.stock_quantity || item.stock || 0) <= Number(item.low_stock_threshold || item.min_stock_level || 5);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.barcode}</div>
                        </TableCell>
                        <TableCell>{item.category || "General"}</TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={isLow ? "text-destructive font-bold" : ""}>
                            {item.stock_quantity || item.stock || 0}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1">/ {item.unit || "pcs"}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isLow ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              In Stock
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenAdjustment(item, "add")} title="Add Stock">
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenAdjustment(item, "remove")} title="Remove Stock">
                              <ArrowDownRight className="h-4 w-4 text-destructive" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenAdjustment(item, "adjust")} title="Manual Adjustment">
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {inventory.length} of {totalCount} records
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

      {/* Adjustment Sheet */}
      <Sheet open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="capitalize">{adjustmentType} Stock</SheetTitle>
            <SheetDescription>
              {selectedProduct?.name} (Current: {selectedProduct?.stock_quantity || selectedProduct?.stock || 0} {selectedProduct?.unit})
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="adjustmentValue">Quantity to {adjustmentType}</Label>
              <Input
                id="adjustmentValue"
                type="number"
                placeholder="0"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustmentReason">Reason (Optional)</Label>
              <Input
                id="adjustmentReason"
                placeholder="e.g. Restock, Damaged, Correction"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAdjustmentOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button 
                onClick={handleAdjustStock} 
                disabled={saving || !adjustmentValue}
                className={adjustmentType === 'remove' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                {saving ? "Processing..." : `Confirm ${adjustmentType}`}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
