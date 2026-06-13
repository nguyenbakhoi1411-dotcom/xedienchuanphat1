"use client";

import { Banknote, CreditCard, HandCoins, Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { formatCurrency } from "@/lib/format";
import { AccountingKpiCard } from "./AccountingKpiCard";
import type { AccountingOverview } from "./types";

export function AccountingOverviewPanel({ data, loading }: { data?: AccountingOverview; loading: boolean }) {
  const user = useCurrentUser();
  const canViewCost = Boolean(user?.permissions.includes("VIEW_COST_PRICE"));
  const canViewProfit = Boolean(user?.permissions.includes("VIEW_PROFIT"));

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AccountingKpiCard label="Doanh thu" value={data.kpis.revenue} icon={TrendingUp} />
        {canViewProfit && <AccountingKpiCard label="Loi nhuan rong" value={data.kpis.netProfit} icon={HandCoins} tone="green" />}
        <AccountingKpiCard label="Phai thu" value={data.kpis.receivable} icon={Banknote} tone="blue" />
        <AccountingKpiCard label="Phai tra" value={data.kpis.payable} icon={CreditCard} tone="red" />
        <AccountingKpiCard label="Quy tien mat" value={data.kpis.cashBalance} icon={Wallet} tone="orange" />
        <AccountingKpiCard label="Tai khoan ngan hang" value={data.kpis.bankBalance} icon={Landmark} tone="slate" />
        <AccountingKpiCard label="Tien vao" value={data.kpis.cashIn} icon={TrendingUp} tone="green" />
        <AccountingKpiCard label="Tien ra" value={data.kpis.cashOut} icon={TrendingDown} tone="red" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <h2 className="text-base font-semibold text-text">Bao cao lai/lo co ban</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Doanh thu" value={data.profitLoss.revenue} />
            {canViewCost && <Row label="Gia von" value={data.profitLoss.costOfGoodsSold} />}
            {canViewProfit && <Row label="Loi nhuan gop" value={data.profitLoss.grossProfit} />}
            <Row label="Chi phi" value={data.profitLoss.expenses} />
            {canViewProfit && <Row label="Loi nhuan rong" value={data.profitLoss.netProfit} strong />}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <h2 className="text-base font-semibold text-text">Quy tien mat / ngan hang</h2>
          <div className="mt-4 space-y-3 text-sm">
            {data.cashFunds.map((fund) => <Row key={fund.id} label={fund.name} value={fund.balance} />)}
            {data.bankAccounts.map((account) => <Row key={account.id} label={`${account.bankName} - ${account.accountNumber}`} value={account.balance} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "border-t border-border pt-3 text-base font-semibold text-text" : "text-slate-600"}`}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
