import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Login } from "@/features/auth/Login";
import { DashboardHome } from "@/features/dashboard/DashboardHome";
import { Clients } from "@/features/clients/Clients";
import { Settings } from "@/features/settings/Settings";
import { Products } from "@/features/products/Products";
import { Scanner } from "@/features/scanner/Scanner";
import { Inventory } from "@/features/inventory/Inventory";
import { Sales } from "@/features/sales/Sales";
import { Reports } from "@/features/reports/Reports";
import { PageLoading } from "@/components/layout/PageLoading";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  component: DashboardLayout,
  pendingComponent: PageLoading,
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "dashboard",
  component: DashboardHome,
});

const productsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "products",
  component: Products,
});

const scannerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "scanner",
  component: Scanner,
});

const inventoryRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "inventory",
  component: Inventory,
});

const salesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "sales",
  component: Sales,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "reports",
  component: Reports,
});

const clientsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "clients",
  component: Clients,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "settings",
  component: Settings,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    throw redirect({
      to: isAuthenticated ? "/dashboard" : "/login",
    });
  },
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    throw redirect({
      to: isAuthenticated ? "/dashboard" : "/login",
    });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    productsRoute,
    scannerRoute,
    inventoryRoute,
    salesRoute,
    reportsRoute,
    clientsRoute,
    settingsRoute,
  ]),
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: PageLoading,
});
