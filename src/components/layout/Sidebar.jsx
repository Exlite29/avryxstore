import { Button } from "@/components/ui/button";

export function Sidebar() {
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
  );
}
