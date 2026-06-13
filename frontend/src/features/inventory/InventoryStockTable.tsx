"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { InventoryListParams, InventoryStock, PageResponse } from "./types";

type InventoryStockTableProps = {
  data?: PageResponse<InventoryStock>;
  params: InventoryListParams;
  loading: boolean;
  onPageChange: (page: number) => void;
};

export function InventoryStockTable({ data, params, loading, onPageChange }: InventoryStockTableProps) {
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
        <EmptyState title="Khong co du lieu ton kho" description="Thu thay doi bo loc hoac tao giao dich nhap kho." />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">San pham</th>
              <th className="px-4 py-3 font-semibold">Chi nhanh</th>
              <th className="px-4 py-3 font-semibold">Kho</th>
              <th className="px-4 py-3 text-right font-semibold">Ton kho</th>
              <th className="px-4 py-3 text-right font-semibold">Giu cho</th>
              <th className="px-4 py-3 text-right font-semibold">Kha dung</th>
              <th className="px-4 py-3 text-right font-semibold">Muc toi thieu</th>
              <th className="px-4 py-3 text-right font-semibold">Gia von TB</th>
              <th className="px-4 py-3 text-right font-semibold">Gia tri ton</th>
              <th className="px-4 py-3 font-semibold">Canh bao</th>
              <th className="px-4 py-3 font-semibold">Cap nhat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((item) => {
              const lowStock = item.availableQuantity <= item.minimumStock;
              return (
                <tr key={item.id} className={cn("hover:bg-orange-50/60", lowStock && "bg-red-50/30")}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-text">{item.productName}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.productCode} · {item.category}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.branchName}</td>
                  <td className="px-4 py-3 text-slate-700">{item.warehouseName || "Kho chinh"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text">{item.quantityOnHand}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{item.reservedQuantity}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text">{item.availableQuantity}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{item.minimumStock}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.averageCost)}</td>
                  <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(item.averageCost * item.quantityOnHand)}</td>
                  <td className="px-4 py-3">
                    {lowStock ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Ton thap
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        Du hang
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.updatedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.totalItems} onPageChange={onPageChange} disabledPrev={params.page <= 1} disabledNext={params.page >= data.totalPages} />
    </>
  );
}

function Pagination({ page, totalPages, totalItems, disabledPrev, disabledNext, onPageChange }: { page: number; totalPages: number; totalItems: number; disabledPrev: boolean; disabledNext: boolean; onPageChange: (page: number) => void }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>Trang {page} / {totalPages} · {totalItems} dong ton kho</span>
      <div className="flex gap-2">
        <button type="button" className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={disabledPrev} onClick={() => onPageChange(page - 1)}>Truoc</button>
        <button type="button" className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={disabledNext} onClick={() => onPageChange(page + 1)}>Sau</button>
      </div>
    </div>
  );
}
