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

export function DashboardHome() {
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    dailySales: 0,
    lowStock: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salesResponse, invResponse] = await Promise.all([
          salesService.getDailySummary(),
          inventoryService.getAll()
        ]);
        
        const salesData = salesResponse.data || {};
        const invData = invResponse.data || [];
        
        const inventory = Array.isArray(invData) ? invData : (invData.inventory || []);
        const lowStockCount = inventory.filter(item => Number(item.stock_quantity || item.stock || 0) <= Number(item.low_stock_threshold || item.min_stock_level || 5)).length;
        
        setStats({
          dailyRevenue: salesData.total_revenue || 0,
          dailySales: salesData.sale_count || 0,
          lowStock: lowStockCount,
          totalProducts: inventory.length
        });
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">Welcome back to your Avryx Store command center.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">₱{Number(stats.dailyRevenue).toLocaleString()}</div>
            <p className="text-xs opacity-70">+12% from yesterday</p>
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
            <CardTitle className="text-sm font-medium">Active Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Unique items listed</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-sm border-none bg-muted/30">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do right now.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="default" className="h-20 flex flex-col gap-1 shadow-md">
              <Link href="/scanner">
                <Scan className="h-5 w-5" />
                <span>Open POS Scan</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col gap-1 bg-background border-2 shadow-sm">
              <Link href="/products">
                <PlusCircle className="h-5 w-5" />
                <span>Add Product</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col gap-1 bg-background border-2 shadow-sm">
              <Link href="/sales">
                <History className="h-5 w-5" />
                <span>View Recent Sales</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col gap-1 bg-background border-2 shadow-sm">
              <Link href="/reports">
                <FileBarChart className="h-5 w-5" />
                <span>Analytics Report</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Updates / Notifications */}
        <Card className="border-none shadow-sm h-full">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Health and performance metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-background group cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Revenue Target</div>
                  <div className="text-xs text-muted-foreground">78% of weekly goal reached</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-background group cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Inventory Sync</div>
                  <div className="text-xs text-muted-foreground">All systems operational</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="pt-2">
              <Button asChild variant="link" className="px-0 text-primary">
                <Link href="/reports" className="flex items-center gap-1">
                  View full details <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
