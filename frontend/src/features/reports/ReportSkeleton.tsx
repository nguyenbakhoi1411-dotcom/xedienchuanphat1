import { Skeleton } from "@/components/ui/Skeleton";

export function ReportSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-80" />
    </div>
  );
}
