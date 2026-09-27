import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Skeleton loader for stat cards
 */
export function SkeletonStatsCard({ className }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for a row in a table
 */
export function SkeletonTableRow({ columns = 5 }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function SkeletonTableRows({ rows = 5, columns = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonTableRow key={index} columns={columns} />
      ))}
    </>
  );
}

/**
 * Skeleton loader for table with header
 */
export function SkeletonTable({ rows = 5, columns = 5, showHeader = true }) {
  return (
    <div className="rounded-md border">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Skeleton loader for dashboard stats grid
 */
export function SkeletonDashboardStats({ count = 4 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatsCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for page header
 */
export function SkeletonPageHeader() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-72" />
    </div>
  );
}

/**
 * Skeleton loader for action buttons
 */
export function SkeletonActions({ count = 2 }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24" />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for search input
 */
export function SkeletonSearchInput() {
  return <Skeleton className="h-10 w-64" />;
}

export function SkeletonSearchResults({ rows = 3 }) {
  return (
    <div className="rounded-md border bg-background p-2 shadow-lg" role="status" aria-label="Loading search results">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b p-2 last:border-b-0">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for a single labelled form field
 */
export function SkeletonFormField({ className, labelWidth = "w-24" }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className={cn("h-4", labelWidth)} />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

/**
 * Skeleton loader for a pair of side-by-side form fields
 */
export function SkeletonFormFieldRow({ labelWidths = ["w-24", "w-20"] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SkeletonFormField labelWidth={labelWidths[0]} />
      <SkeletonFormField labelWidth={labelWidths[1]} />
    </div>
  );
}

/**
 * Skeleton loader for the product form, mirrors ProductForm's layout so the
 * edit sheet does not shift once the product details resolve.
 */
export function SkeletonProductForm() {
  return (
    <div className="space-y-4 py-4" role="status" aria-label="Loading product details">
      <SkeletonFormField labelWidth="w-28" />
      <SkeletonFormFieldRow labelWidths={["w-20", "w-20"]} />
      <SkeletonFormFieldRow labelWidths={["w-16", "w-12"]} />
      <SkeletonFormFieldRow labelWidths={["w-28", "w-28"]} />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-full aspect-video rounded-lg" />
      </div>
      <SkeletonFormField labelWidth="w-24" />
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for a key/value detail block
 */
export function SkeletonDetailRows({ rows = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for the sale details sheet
 */
export function SkeletonSaleDetails() {
  return (
    <div className="space-y-6 py-6" role="status" aria-label="Loading transaction details">
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-10 ml-auto" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-dashed pb-2 last:border-0"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t-2">
        <SkeletonDetailRows rows={2} />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
      </div>

      <Skeleton className="h-9 w-full" />
    </div>
  );
}

/**
 * Skeleton loader for chart
 */
export function SkeletonChart() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for recent sales table (dashboard)
 */
export function SkeletonRecentSalesTable() {
  return (
    <Card className="lg:col-span-2 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-16" />
      </CardHeader>
      <CardContent>
        <SkeletonTable rows={5} columns={4} />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for quick actions card
 */
export function SkeletonQuickActions() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-sm border-none bg-muted/30">
        <CardHeader>
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm flex-1">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Full page skeleton loader for reports page
 */
export function SkeletonReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <SkeletonPageHeader />
        <Skeleton className="h-9 w-28" />
      </div>

      <SkeletonDashboardStats count={4} />

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <SkeletonChart />
        </div>
        <div className="md:col-span-3">
          <SkeletonChart />
        </div>
        <div className="md:col-span-7">
          <SkeletonChart />
        </div>
      </div>
    </div>
  );
}
