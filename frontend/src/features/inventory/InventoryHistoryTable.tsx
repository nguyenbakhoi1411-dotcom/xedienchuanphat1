"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { getTransactionTypeLabel } from "./inventoryOptions";
import type { InventoryHistoryParams, InventoryTransaction, InventoryTransactionType, PageResponse } from "./types";

type InventoryHistoryTableProps = {
  data?: PageResponse<InventoryTransaction>;
  params: InventoryHistoryParams;
  loading: boolean;
  onPageChange: (page: number) => void;
};

const typeClass: Record<InventoryTransactionType, string> = {
  IMPORT: "bg-green-50 text-green-700",
  EXPORT: "bg-red-50 text-red-700",
  TRANSFER_IN: "bg-blue-50 text-blue-700",
  TRANSFER_OUT: "bg-blue-50 text-blue-700",
  STOCKTAKE: "bg-orange-50 text-primary",
  SALE: "bg-violet-50 text-violet-700",
  RETURN: "bg-slate-100 text-slate-700"
};

export function InventoryHistoryTable({ data, params, loading, onPageChange }: InventoryHistoryTableProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12" />)}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="p-4">
        <EmptyState title="Chua co lich su giao dich" description="Cac giao dich nhap, xuat, chuyen va kiem kho se hien thi tai day." />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">So phieu</th>
              <th className="px-4 py-3 font-semibold">Loai</th>
              <th className="px-4 py-3 font-semibold">San pham</th>
              <th className="px-4 py-3 font-semibold">Tu kho</th>
              <th className="px-4 py-3 font-semibold">Den kho</th>
              <th className="px-4 py-3 text-right font-semibold">So luong</th>
              <th className="px-4 py-3 font-semibold">Ngay</th>
              <th className="px-4 py-3 font-semibold">Ghi chu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((item) => (
              <tr key={item.id} className="hover:bg-orange-50/60">
                <td className="px-4 py-3 font-medium text-text">{item.transactionNo}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", typeClass[item.type])}>
                    {getTransactionTypeLabel(item.type)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-text">{item.productName}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.productCode}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.fromBranchName ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{item.toBranchName ?? "-"}</td>
                <td className="px-4 py-3 text-right font-semibold text-text">{item.quantity}</td>
                <td className="px-4 py-3 text-slate-500">{item.transactionDate}</td>
                <td className="px-4 py-3 text-slate-600">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Trang {data.page} / {data.totalPages} · {data.totalItems} giao dich</span>
        <div className="flex gap-2">
          <button type="button" className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page <= 1} onClick={() => onPageChange(params.page - 1)}>Truoc</button>
          <button type="button" className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page >= data.totalPages} onClick={() => onPageChange(params.page + 1)}>Sau</button>
        </div>
      </div>
    </>
  );
}
