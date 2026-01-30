import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block w-64 min-h-screen">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="">My App</span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col justify-between py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Button variant="ghost" className="justify-start w-full" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" className="justify-start w-full" asChild>
              <Link to="/clients">Clients</Link>
            </Button>
          </nav>
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-auto">
            <Button variant="ghost" className="justify-start w-full" asChild>
              <Link to="/settings">Settings</Link>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
