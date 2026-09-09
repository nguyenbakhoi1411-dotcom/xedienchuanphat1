"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PackageSearch, FileX, SearchX, BarChart3 } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: "package" | "file" | "search" | "chart" | ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
};

const icons = {
  package: PackageSearch,
  file: FileX,
  search: SearchX,
  chart: BarChart3,
};

export function EmptyState({
  title = "Không có dữ liệu",
  description = "Chưa có dữ liệu nào để hiển thị.",
  icon = "package",
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  const IconComponent = typeof icon === "string" && icon in icons ? icons[icon as keyof typeof icons] : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 gap-3" : "py-16 gap-4",
        className
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl",
          compact ? "h-14 w-14" : "h-20 w-20"
        )}
        style={{
          background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
          border: "1px solid #FED7AA",
        }}
      >
        {IconComponent ? (
          <IconComponent
            className={cn(compact ? "h-6 w-6" : "h-9 w-9")}
            style={{ color: "#F97316" }}
          />
        ) : (
          icon
        )}
      </div>

      {/* Text */}
      <div className="max-w-xs">
        <h3
          className={cn(
            "font-semibold text-slate-700",
            compact ? "text-sm" : "text-base"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className={cn("mt-1 text-slate-400", compact ? "text-xs" : "text-sm")}>
            {description}
          </p>
        )}
      </div>

      {/* Action */}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
