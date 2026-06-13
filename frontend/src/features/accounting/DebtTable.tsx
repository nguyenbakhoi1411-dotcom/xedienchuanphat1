"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import type { DebtFilters, DebtRow, PageResponse } from "./types";

export function DebtTable({ data, params, loading, onPageChange }: { data?: PageResponse<DebtRow>; params: DebtFilters; loading: boolean; onPageChange: (page: number) => void }) {
  if (loading) return <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;
  if (!data || data.items.length === 0) return <div className="p-4"><EmptyState title="Khong co cong no" /></div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Doi tac</th><th className="px-4 py-3">Loai</th><th className="px-4 py-3 text-right">Dau ky</th><th className="px-4 py-3 text-right">Phat sinh tang</th><th className="px-4 py-3 text-right">Phat sinh giam</th><th className="px-4 py-3 text-right">Cuoi ky</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-orange-50/60">
                <td className="px-4 py-3"><div className="font-semibold text-text">{item.partyName}</div><div className="text-xs text-slate-500">{item.phone}</div></td>
                <td className="px-4 py-3"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-primary">{item.partyType === "CUSTOMER" ? "Khach hang" : "Nha cung cap"}</span></td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.openingBalance)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.debitAmount)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.creditAmount)}</td>
                <td className="px-4 py-3 text-right font-semibold text-text">{formatCurrency(item.endingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Trang {data.page} / {data.totalPages} - {data.totalItems} dong cong no</span>
        <div className="flex gap-2">
          <button className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page <= 1} onClick={() => onPageChange(params.page - 1)}>Truoc</button>
          <button className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page >= data.totalPages} onClick={() => onPageChange(params.page + 1)}>Sau</button>
        </div>
      </div>
    </>
  );
}
