"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { getPaymentMethodLabel, getVoucherStatusLabel } from "./accountingOptions";
import type { AccountingFilters, PageResponse, PaymentVoucher, ReceiptVoucher, VoucherType } from "./types";

export function VoucherTable({
  type,
  data,
  params,
  loading,
  onPageChange
}: {
  type: VoucherType;
  data?: PageResponse<ReceiptVoucher | PaymentVoucher>;
  params: AccountingFilters;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  if (loading) return <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;
  if (!data || data.items.length === 0) return <div className="p-4"><EmptyState title="Khong co chung tu" description="Tao phieu moi hoac thay doi bo loc." /></div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">So phieu</th>
              <th className="px-4 py-3">Ngay</th>
              <th className="px-4 py-3">{type === "RECEIPT" ? "Khach hang" : "Nha cung cap"}</th>
              <th className="px-4 py-3">Phuong thuc</th>
              <th className="px-4 py-3">Trang thai</th>
              <th className="px-4 py-3 text-right">So tien</th>
              <th className="px-4 py-3">Ly do</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((item) => {
              const isReceipt = "receiptDate" in item;
              return (
                <tr key={item.id} className="hover:bg-orange-50/60">
                  <td className="px-4 py-3 font-semibold text-text">{item.voucherNo}</td>
                  <td className="px-4 py-3 text-slate-600">{isReceipt ? item.receiptDate : item.paymentDate}</td>
                  <td className="px-4 py-3 text-slate-700">{isReceipt ? item.customerName : item.supplierName}</td>
                  <td className="px-4 py-3 text-slate-600">{getPaymentMethodLabel(item.paymentMethod)}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">{getVoucherStatusLabel(item.status)}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-text">{formatCurrency(item.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} totalItems={data.totalItems} params={params} onPageChange={onPageChange} />
    </>
  );
}

function Pagination({ page, totalPages, totalItems, params, onPageChange }: { page: number; totalPages: number; totalItems: number; params: AccountingFilters; onPageChange: (page: number) => void }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>Trang {page} / {totalPages} - {totalItems} chung tu</span>
      <div className="flex gap-2">
        <button className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page <= 1} onClick={() => onPageChange(params.page - 1)}>Truoc</button>
        <button className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page >= totalPages} onClick={() => onPageChange(params.page + 1)}>Sau</button>
      </div>
    </div>
  );
}
