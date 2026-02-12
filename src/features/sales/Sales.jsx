import { useState, useEffect } from "react";
import { 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  CircleCheck, 
  CircleX, 
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw,
  TrendingUp,
  CreditCard
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
import { useToast } from "@/contexts/ToastContext";
import salesService from "./salesService";

export function Sales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ total_revenue: 0, sale_count: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;
  
  const { showToast } = useToast();

  const fetchData = async (currentSearch = searchTerm, currentPage = page) => {
    setLoading(true);
    try {
      const [salesData, summaryData] = await Promise.all([
        salesService.getAll({
          page: currentPage,
          limit,
          search: currentSearch
        }),
        salesService.getDailySummary()
      ]);

      const salesList = salesData.data || salesData || [];
      setSales(salesList);
      const sData = summaryData.data || summaryData || {};
      setSummary({
        total_revenue: sData.total_revenue || sData.revenue || 0,
        sale_count: sData.sale_count || sData.count || 0
      });

      if (salesData.pagination) {
        setTotalPages(salesData.pagination.totalPages || 1);
        setTotalCount(salesData.pagination.total || salesList.length);
      } else {
        setTotalPages(1);
        setTotalCount(salesList.length);
      }
    } catch (error) {
      showToast("Failed to fetch sales history", "error");
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

  const handleViewDetails = async (sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  const handleCancelSale = async () => {
    if (!window.confirm("Are you sure you want to cancel this sale? This will revert inventory levels.")) return;
    
    setCancelling(true);
    try {
      await salesService.cancel(selectedSale.id, "User requested cancellation");
      showToast("Sale cancelled successfully", "success");
      setIsDetailsOpen(false);
      fetchData(); // Refresh history
    } catch (error) {
      showToast("Failed to cancel sale", "error");
    } finally {
      setCancelling(false);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
          <p className="text-muted-foreground">Monitor and manage all store transactions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh History
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-blue-50 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-700">₱{Number(summary.total_revenue || 0).toLocaleString()}</div>
            <p className="text-xs text-blue-600/70 font-medium">Calculated from completed sales</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.sale_count || 0}</div>
            <p className="text-xs text-muted-foreground">Successful sales today</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Average Sale</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-700">
              ₱{summary.sale_count > 0 ? (summary.total_revenue / summary.sale_count).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
            </div>
            <p className="text-xs text-green-600/70 font-medium">Per transaction on average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>A list of the latest sales from your store.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Sale ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Sale ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Loading sales...</TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No sales recorded today.</TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-xs uppercase font-bold">#{sale.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{new Date(sale.created_at).toLocaleDateString()}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(sale.created_at).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        ₱{Number(sale.total_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {sale.status === "cancelled" ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            <CircleX className="h-3 w-3 mr-1" /> Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <CircleCheck className="h-3 w-3 mr-1" /> Success
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(sale)}>
                          <Eye className="h-4 w-4" />
                        </Button>
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
              Showing {sales.length} of {totalCount} transactions
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

      {/* Sale Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>Detailed breakdown for Sale #{selectedSale?.id}</SheetDescription>
          </SheetHeader>
          
          {selectedSale && (
            <div className="space-y-6 py-6">
              <div className="space-y-1">
                <div className="text-xs uppercase text-muted-foreground font-semibold">Summary</div>
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground">DATE</div>
                    <div className="text-sm font-medium">{new Date(selectedSale.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground">TIME</div>
                    <div className="text-sm font-medium">{new Date(selectedSale.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase text-muted-foreground font-semibold">Items Purchased</div>
                <div className="space-y-2">
                  {(selectedSale.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed pb-2 last:border-0">
                      <div>
                        <div className="font-medium">{item.product_name || "Product Item"}</div>
                        <div className="text-xs text-muted-foreground">₱{Number(item.unit_price || item.price || 0).toLocaleString()} x {item.quantity}</div>
                      </div>
                      <div className="font-bold font-mono">
                        ₱{(Number(item.unit_price || item.price || 0) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₱{Number(selectedSale.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-black">
                  <span>TOTAL PAID</span>
                  <span className="text-blue-600">₱{Number(selectedSale.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {selectedSale.status !== "cancelled" && (
                <div className="pt-6">
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white"
                    onClick={handleCancelSale}
                    disabled={cancelling}
                  >
                    {cancelling ? "Processing..." : "Refund / Cancel Sale"}
                    <Trash2 className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
