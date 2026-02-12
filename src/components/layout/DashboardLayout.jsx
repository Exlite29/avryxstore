import { Outlet, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function DashboardLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const getTitle = (path) => {
    if (path === "/products") return "Products";
    if (path === "/scanner") return "Scanner";
    if (path === "/inventory") return "Inventory";
    if (path === "/sales") return "Sales";
    if (path === "/reports") return "Reports";
    if (path === "/settings") return "Settings";
    return "Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/login";
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <MobileNav />
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-xl pl-2">
              {getTitle(pathname)}
            </h1>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
