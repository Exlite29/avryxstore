import { useEffect } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Login } from "@/features/auth/Login";
import { DashboardHome } from "@/features/dashboard/DashboardHome";
import { Clients } from "@/features/clients/Clients";
import { Settings } from "@/features/settings/Settings";
import { PageLoading } from "@/components/layout/PageLoading";

// Root redirect component
function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/dashboard", replace: true });
  }, [navigate]);
  return null;
}

// Not found redirect component
function NotFoundRedirect() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

// Pathless layout route for authenticated pages
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

// Root index route - redirects to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: RootRedirect,
});

// Not found route - handles all unmatched paths
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: NotFoundRedirect,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  notFoundRoute,
  layoutRoute.addChildren([dashboardRoute, clientsRoute, settingsRoute]),
]);

export const router = createRouter({
  routeTree,
  basepath: "/",
  defaultPreload: "intent",
  defaultPendingComponent: PageLoading,
});

export { Login, DashboardHome, Clients, Settings, DashboardLayout };
