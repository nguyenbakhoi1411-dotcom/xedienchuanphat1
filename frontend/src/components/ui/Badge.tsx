import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "orange" | "green" | "blue" | "slate" | "amber" | "red";

const toneClass: Record<BadgeTone, string> = {
  orange: "border-orange-200 bg-orange-50 text-primary",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700"
};

export function Badge({
  children,
  tone = "slate",
  className
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return <span className={cn("erp-badge", toneClass[tone], className)}>{children}</span>;
}
