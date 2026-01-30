
import { Outlet, RouterProvider, createRouter, createRoute, createRootRoute, useLocation } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Menu, Package2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './index.css'

// --- Components ---

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <a href="/dashboard">Sign in</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

const Sidebar = () => {
  return (
    <div className="hidden border-r bg-muted/40 md:block w-64 min-h-screen">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="">My App</span>
          </a>
        </div>
        <div className="flex-1 flex flex-col justify-between py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
             <Button variant="ghost" className="justify-start w-full" asChild>
                <a href="/dashboard">Dashboard</a>
             </Button>
             <Button variant="ghost" className="justify-start w-full" asChild>
                <a href="/clients">Clients</a>
             </Button>
          </nav>
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-auto">
             <Button variant="ghost" className="justify-start w-full" asChild>
                <a href="/settings">Settings</a>
             </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}

const MobileNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <a href="#" className="flex items-center gap-2 text-lg font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="sr-only">My App</span>
          </a>
          <a
            href="/dashboard"
            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </a>
          <a
            href="/clients"
            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            Clients
          </a>
          <a
            href="/settings"
            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            Settings
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

const DashboardLayout = () => {
  const location = useLocation()
  const pathname = location.pathname

  const getTitle = (path) => {
    if (path === '/clients') return 'Clients'
    if (path === '/settings') return 'Settings'
    return 'Dashboard'
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
             <MobileNav />
             <div className="w-full flex-1">
               <h1 className="text-lg font-semibold md:text-xl pl-2">{getTitle(pathname)}</h1>
             </div>
             <Button variant="secondary" size="sm" asChild>
                <a href="/login">Logout</a>
             </Button>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Outlet />
          </main>
      </div>
    </div>
  )
}

const data = [
  { name: 'Jan', total: 1000 },
  { name: 'Feb', total: 2000 },
  { name: 'Mar', total: 1500 },
  { name: 'Apr', total: 4000 },
  { name: 'May', total: 2500 },
  { name: 'Jun', total: 5000 },
]

const DashboardHome = () => {
  return (
    <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$12,234</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

const clientsData = [
  {
    invoice: "INV001",
    status: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    status: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    status: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    status: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    status: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    status: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    status: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

const Clients = () => {
    return (
        <div>
             <Card>
                <CardHeader>
                     <CardTitle>Clients & Invoices</CardTitle>
                     <CardDescription>A list of recent invoices from your clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Invoice</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientsData.map((invoice) => (
                          <TableRow key={invoice.invoice}>
                            <TableCell className="font-medium">{invoice.invoice}</TableCell>
                            <TableCell>{invoice.status}</TableCell>
                            <TableCell>{invoice.paymentMethod}</TableCell>
                            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </CardContent>
             </Card>
        </div>
    )
}

const Settings = () => {
    return (
        <div>
             <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid gap-2">
                        <Label>Username</Label>
                        <Input defaultValue="user@example.com" />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button>Save Changes</Button>
                </CardFooter>
             </Card>
        </div>
    )
}


// --- Router Setup ---

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

// Pathless layout route for authenticated pages
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: DashboardLayout,
})

const dashboardRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'dashboard',
    component: DashboardHome,
})

const clientsRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'clients',
    component: Clients,
})

const settingsRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: 'settings',
    component: Settings,
})

// Redirect root to dashboard
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <Login />, 
})

const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    layoutRoute.addChildren([
        dashboardRoute,
        clientsRoute,
        settingsRoute,
    ]),
])

const router = createRouter({ routeTree })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
