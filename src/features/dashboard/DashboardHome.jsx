import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp,
  Scan,
  PlusCircle,
  History,
  FileBarChart,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  Activity
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import salesService from "../sales/salesService";
import inventoryService from "../inventory/inventoryService";
import reportService from "../reports/reportService";

export function DashboardHome() {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    dailySales: 0,
    lowStock: 0,
    totalUnits: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salesResponse, invReportResponse, recentResponse] = await Promise.all([
          salesService.getDailySummary(),
          reportService.getInventoryReports(),
          salesService.getAll({ limit: 5 })
        ]);
        
        // Robust data extraction for summary
        const salesData = salesResponse.data || salesResponse || {};
        const invSummary = invReportResponse?.summary || {};
        
        setStats({
          dailyRevenue: salesData.total_revenue || salesData.revenue || 0,
          dailySales: salesData.sale_count || salesData.count || 0,
          lowStock: invSummary.lowStockCount || 0,
          totalUnits: invSummary.totalValue ? (invSummary.totalUnits || 0) : (invSummary.total_units || 0)
        });

        setRecentSales(recentResponse.data || []);
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">Welcome back to your Avryx Store command center.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button asChild size="sm" variant="outline">
              <Link to="/sales">
                Full History
              </Link>
           </Button>
           <Button asChild size="sm">
              <Link to="/scanner">
                New Sale
              </Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">₱{Number(stats.dailyRevenue).toLocaleString()}</div>
            <p className="text-xs opacity-70">Current daily total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Completed</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailySales}</div>
            <p className="text-xs text-muted-foreground">Transactions today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Item Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total items in stock</p>
          </CardContent>
        </Card>
        <Card className={stats.lowStock > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Activity className={`h-4 w-4 ${stats.lowStock > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStock > 0 ? "text-destructive" : ""}`}>{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Table */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Your latest transactions at a glance.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              <Link to="/sales">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">ID</th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Time</th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Total</th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <tr key={sale.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-2 align-middle font-mono font-medium text-[10px] uppercase">
                          #{sale.transaction_number || sale.id.slice(0, 8)}
                        </td>
                        <td className="p-2 align-middle text-muted-foreground">
                          {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2 align-middle font-bold text-primary">
                          ₱{Number(sale.total_amount || sale.total).toLocaleString()}
                        </td>
                        <td className="p-2 align-middle">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {sale.status === 'completed' ? 'PAID' : 'REV'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-muted-foreground py-10">
                        No recent sales found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-sm border-none bg-muted/30">
            <CardHeader>
              <CardTitle>Tools</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Button asChild variant="default" className="h-14 flex items-center justify-start gap-3 px-4 shadow-md bg-blue-600 hover:bg-blue-700">
                <Link to="/scanner">
                  <Scan className="h-5 w-5" />
                  <span className="font-bold">Point of Sale</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 flex items-center justify-start gap-3 px-4 bg-background border-2 shadow-sm">
                <Link to="/inventory">
                  <Package className="h-5 w-5" />
                  <span className="font-bold">Inventory Monitor</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 flex items-center justify-start gap-3 px-4 bg-background border-2 shadow-sm">
                <Link to="/reports">
                  <FileBarChart className="h-5 w-5" />
                  <span className="font-bold">Full Analytics</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Health Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-muted-foreground">Server: v1.0.4 Online</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                 <span className="text-xs font-bold text-muted-foreground">Cloud Sync: Multi-zone</span>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
