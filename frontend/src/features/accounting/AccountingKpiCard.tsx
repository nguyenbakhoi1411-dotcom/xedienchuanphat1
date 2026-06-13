import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

export function AccountingKpiCard({ label, value, icon: Icon, tone = "orange" }: { label: string; value: number; icon: LucideIcon; tone?: "orange" | "green" | "blue" | "red" | "slate" }) {
  const toneClass = {
    orange: "bg-orange-50 text-primary",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700"
  }[tone];

  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold text-text">{formatCurrency(value)}</p>
    </article>
  );
}
