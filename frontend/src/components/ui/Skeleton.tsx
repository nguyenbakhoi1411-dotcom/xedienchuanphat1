import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  lines?: number;
  rounded?: boolean;
}

export function Skeleton({ className, lines = 1, rounded = false }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "skeleton-shimmer rounded-lg",
              rounded && "rounded-full",
              i === lines - 1 ? "w-3/4" : "w-full",
              className ?? "h-4"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-lg",
        rounded && "rounded-full",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8" rounded />
      </div>
      <Skeleton className="h-8 w-36 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <Skeleton className="h-8 w-8 flex-shrink-0" rounded />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 border-b border-border px-5 py-3 bg-slate-50/80">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-border/50 px-5 py-3.5">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn(
                "h-4 flex-1",
                j === 0 && "max-w-[100px]",
                j === cols - 1 && "max-w-[80px]"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
