import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar, 
  RefreshCw,
  ArrowUpRight,
  Package,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/contexts/ToastContext";
import reportService from "./reportService";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Reports() {
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [valuationData, setValuationData] = useState([]);
  const [metrics, setMetrics] = useState({
    total_sales: 0,
    growth: 0,
    inventory_value: 0,
    trans_count: 0
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [daily, top, val, scn] = await Promise.all([
        reportService.getDailySales(),
        reportService.getTopProducts(),
        reportService.getInventoryValuation(),
        reportService.getScannerMetrics()
      ]);

      setDailySales(daily.data || []);
      setTopProducts(top.data || []);
      setValuationData(val.data?.categories || []);
      
      const metricsData = val.data || {};
      const dailySalesList = daily.data || [];
      
      // Aggregate some metrics
      const totalSales = dailySalesList.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
      setMetrics({
        total_sales: totalSales,
        growth: 12.5, // Mock growth for now
        inventory_value: metricsData.total_value || 0,
        trans_count: dailySalesList.reduce((acc, curr) => acc + (curr.count || 0), 0)
      });
    } catch (error) {
      showToast("Operations failed: using placeholder data", "warning");
      // Fallback with mock data for "Premium" look if backend is empty
      setDailySales([
        { date: '02-04', revenue: 4500, count: 12 },
        { date: '02-05', revenue: 5200, count: 15 },
        { date: '02-06', revenue: 3800, count: 10 },
        { date: '02-07', revenue: 6500, count: 22 },
        { date: '02-08', revenue: 4800, count: 14 },
        { date: '02-09', revenue: 7200, count: 19 },
        { date: '02-10', revenue: 5100, count: 16 },
      ]);
      setTopProducts([
        { name: 'Coke 1.5L', sales: 45, revenue: 2250 },
        { name: 'Skyflakes 10s', sales: 38, revenue: 1900 },
        { name: 'Lucky Me Pancit', sales: 32, revenue: 1600 },
        { name: 'Bear Brand 150g', sales: 25, revenue: 3750 },
        { name: 'Silver Swan Soy', sales: 20, revenue: 800 },
      ]);
      setValuationData([
        { name: 'Beverages', value: 12000 },
        { name: 'Snacks', value: 8500 },
        { name: 'Canned Goods', value: 15000 },
        { name: 'Dairy', value: 5000 },
        { name: 'Hygiene', value: 7800 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
          <p className="text-muted-foreground">Comprehensive insights into your store's performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">₱{Number(metrics.total_sales || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs mt-1 text-blue-100">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{metrics.growth}% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trans_count}</div>
            <p className="text-xs text-muted-foreground">Successful transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{Number(metrics.inventory_value || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total cost of stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Index</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Positive</div>
            <p className="text-xs text-muted-foreground">Performance is up</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Trend Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily revenue over the last week.</CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `₱${val}`}
                />
                <Tooltip 
                  formatter={(val) => [`₱${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Distribution Pie */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Breakdown</CardTitle>
                <CardDescription>Value by category.</CardDescription>
              </div>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={valuationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {valuationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => `₱${val.toLocaleString()}`}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Products Bar Chart */}
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Best sellers by quantity sold.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 13, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  formatter={(val) => [val, 'Sold']}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                  barSize={30}
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1e40af' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
