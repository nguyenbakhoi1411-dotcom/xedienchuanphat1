import {
  AlertTriangle,
  Banknote,
  CircleDollarSign,
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Siren
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { DashboardKpi } from "./types";

const iconMap = {
  todayRevenue: CircleDollarSign,
  monthRevenue: TrendingUp,
  orders: ShoppingCart,
  overdueDebt: CreditCard,
  lowStock: AlertTriangle,
  warrantyProcessing: ShieldCheck,
  careLeads: HeartHandshake,
  systemAlerts: Siren,
  receivable: Banknote
};

const toneClass = {
  orange: "bg-orange-50 text-primary",
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700"
};

export function KpiCard({ item }: { item: DashboardKpi }) {
  const Icon = iconMap[item.key as keyof typeof iconMap] ?? CircleDollarSign;

  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-text">{item.value}</p>
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClass[item.tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="truncate text-xs text-slate-500">{item.helper}</p>
        <span className={cn("shrink-0 rounded-full px-2 py-1 text-xs font-medium", toneClass[item.tone])}>
          {item.trend}
        </span>
      </div>
    </article>
  );
}
