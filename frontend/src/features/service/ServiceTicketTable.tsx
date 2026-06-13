"use client";

import { Eye } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import type { PageResponse, ServiceTicket, TicketListParams } from "./types";

export function ServiceTicketTable({
  data,
  params,
  loading,
  onPageChange,
  onView
}: {
  data?: PageResponse<ServiceTicket>;
  params: TicketListParams;
  loading: boolean;
  onPageChange: (page: number) => void;
  onView: (ticket: ServiceTicket) => void;
}) {
  if (loading) return <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;
  if (!data || data.items.length === 0) return <div className="p-4"><EmptyState title="Khong co phieu sua chua" description="Thu thay doi bo loc hoac tao phieu moi." /></div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">So phieu</th>
              <th className="px-4 py-3">Khach hang</th>
              <th className="px-4 py-3">Serial</th>
              <th className="px-4 py-3">Ky thuat vien</th>
              <th className="px-4 py-3">Trang thai</th>
              <th className="px-4 py-3 text-right">Chi phi</th>
              <th className="px-4 py-3">Cap nhat</th>
              <th className="px-4 py-3 text-right">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-orange-50/60">
                <td className="px-4 py-3 font-semibold text-text">{ticket.ticketNo}</td>
                <td className="px-4 py-3 text-slate-700">{ticket.customerName}<div className="text-xs text-slate-500">{ticket.phone}</div></td>
                <td className="px-4 py-3 text-slate-600">{ticket.serialNumber}</td>
                <td className="px-4 py-3 text-slate-600">{ticket.technicianUsername ?? "-"}</td>
                <td className="px-4 py-3"><ServiceStatusBadge status={ticket.status} /></td>
                <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(ticket.totalCost)}</td>
                <td className="px-4 py-3 text-slate-500">{ticket.updatedAt}</td>
                <td className="px-4 py-3 text-right">
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-primary" onClick={() => onView(ticket)} aria-label="Xem chi tiet">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Trang {data.page} / {data.totalPages} - {data.totalItems} phieu</span>
        <div className="flex gap-2">
          <button className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page <= 1} onClick={() => onPageChange(params.page - 1)}>Truoc</button>
          <button className="h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:opacity-50" disabled={params.page >= data.totalPages} onClick={() => onPageChange(params.page + 1)}>Sau</button>
        </div>
      </div>
    </>
  );
}
