"use client";

import type { ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { getCustomerSourceLabel, getCustomerTypeLabel } from "./customerOptions";
import type { Customer, CustomerListParams, CustomerType, PageResponse } from "./types";

type CustomerTableProps = {
  data?: PageResponse<Customer>;
  params: CustomerListParams;
  loading: boolean;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
};

const typeTone: Record<CustomerType, "green" | "slate" | "orange" | "blue" | "red"> = {
  NEW: "green",
  NORMAL: "slate",
  RETAIL: "slate",
  VIP: "orange",
  WHOLESALE: "blue",
  POTENTIAL: "green",
  HIGH_RISK_DEBT: "red"
};

export function CustomerTable({ data, params, loading, onPageChange, onView, onEdit }: CustomerTableProps) {
  if (loading) {
    return <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12" />)}</div>;
  }
  if (!data || data.items.length === 0) {
    return <div className="p-4"><EmptyState title="Khong co khach hang" description="Thu thay doi bo loc hoac them khach hang moi." /></div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="erp-table min-w-[980px]">
          <thead>
            <tr>
              <th className="px-4 py-3 font-semibold">Khach hang</th>
              <th className="px-4 py-3 font-semibold">Lien he</th>
              <th className="px-4 py-3 font-semibold">Loai</th>
              <th className="px-4 py-3 font-semibold">Nguon</th>
              <th className="px-4 py-3 text-right font-semibold">Da mua</th>
              <th className="px-4 py-3 text-right font-semibold">Cong no</th>
              <th className="px-4 py-3 font-semibold">Cap nhat</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((customer) => (
              <tr key={customer.id} className="hover:bg-orange-50/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-text">{customer.fullName}</div>
                  <div className="mt-1 text-xs text-slate-500">{customer.customerCode}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{customer.phone}</div>
                  <div className="mt-1 text-xs">{customer.email || "-"}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={typeTone[customer.type]}>{getCustomerTypeLabel(customer.type)}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{getCustomerSourceLabel(customer.source)}</td>
                <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(customer.totalSpent)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(customer.debtAmount)}</td>
                <td className="px-4 py-3 text-slate-500">{customer.updatedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton label="Xem chi tiet" onClick={() => onView(customer)}><Eye className="h-4 w-4" /></IconButton>
                    <IconButton label="Sua" onClick={() => onEdit(customer)}><Pencil className="h-4 w-4" /></IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Trang {data.page} / {data.totalPages} - {data.totalItems} khach hang</span>
        <div className="flex gap-2">
          <Button variant="secondary" className="h-9 px-3" disabled={params.page <= 1} onClick={() => onPageChange(params.page - 1)}>Truoc</Button>
          <Button variant="secondary" className="h-9 px-3" disabled={params.page >= data.totalPages} onClick={() => onPageChange(params.page + 1)}>Sau</Button>
        </div>
      </div>
    </>
  );
}

function IconButton({ label, children, onClick }: { label: string; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-primary">
      {children}
    </button>
  );
}
