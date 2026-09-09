"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { InventoryListParams, InventoryDTO, PageResponse } from "./types";

type InventoryStockTableProps = {
  data?: PageResponse<InventoryDTO>;
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
        <EmptyState title="Không có dữ liệu tồn kho" description="Thu thay doi bo loc hoac tao giao dich nhap kho." />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Sản phẩm</th>
              <th className="px-4 py-3 font-semibold">Đơn vị tính</th>
              <th className="px-4 py-3 text-right font-semibold">Tồn kho</th>
              <th className="px-4 py-3 text-right font-semibold">Mức tối thiểu</th>
              <th className="px-4 py-3 text-right font-semibold">Giá vốn TB</th>
              <th className="px-4 py-3 text-right font-semibold">Giá trị tồn</th>
              <th className="px-4 py-3 font-semibold">Cảnh báo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((item) => {
              const tonKho = item.ton_kho_hien_tai;
              const toiThieu = item.ton_kho_toi_thieu;
              
              let rowClass = "hover:bg-slate-50";
              let badge = null;
              
              if (tonKho === 0) {
                rowClass = cn(rowClass, "bg-red-50 border-l-4 border-red-500");
                badge = <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">Hết hàng</span>;
              } else if (tonKho > 0 && tonKho <= toiThieu) {
                rowClass = cn(rowClass, "bg-amber-50 border-l-4 border-amber-400");
                badge = <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"><AlertTriangle className="h-3.5 w-3.5" />Sắp hết</span>;
              } else {
                badge = <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">Còn hàng</span>;
              }

              return (
                <tr key={item.san_pham_id} className={rowClass}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-text">{item.ten_san_pham}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.ma_san_pham} · {item.loai_san_pham}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.don_vi_tinh}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text">{tonKho}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{toiThieu}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.gia_von_binh_quan)}</td>
                  <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(item.gia_tri_ton_kho)}</td>
                  <td className="px-4 py-3">{badge}</td>
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
