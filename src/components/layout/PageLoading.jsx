import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="p-6 pt-0">
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="p-6 pt-0">
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hidden lg:block">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="p-6 pt-0">
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
