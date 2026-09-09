"use client";

import { Edit3, PackagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import type { Supplier } from "./types";

type SupplierTableProps = {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onPurchase: (supplier: Supplier) => void;
};

export function SupplierTable({ suppliers, loading, onEdit, onDelete, onPurchase }: SupplierTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return <EmptyState title="Chưa có nhà cung cấp" description="Them nha cung cap de tao don nhap hang va theo doi cong no." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase text-slate-500">
              <th className="px-4 py-3">Ma</th>
              <th className="px-4 py-3">Nha cung cap</th>
              <th className="px-4 py-3">MST</th>
              <th className="px-4 py-3">Lien he</th>
              <th className="px-4 py-3">Dia chi</th>
              <th className="px-4 py-3 text-right">Số tiền nợ</th>
              <th className="px-4 py-3">Trang thai</th>
              <th className="px-4 py-3 text-right">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-orange-50/40">
                <td className="px-4 py-3 font-medium text-text">{supplier.code}</td>
                <td className="px-4 py-3 text-text">{supplier.name}</td>
                <td className="px-4 py-3 text-slate-600">{supplier.taxCode || "-"}</td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{supplier.contactPerson || "-"}</div>
                  <div className="mt-1 text-xs">{supplier.phone || "-"}</div>
                </td>
                <td className="max-w-sm px-4 py-3 text-slate-600">{supplier.address || "-"}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">
                  {formatCurrency(supplier.currentDebt || 0)}
                </td>
                <td className="px-4 py-3">
                  <span className={supplier.status === "ACTIVE" ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700" : "rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"}>
                    {supplier.status === "ACTIVE" ? "Hoat dong" : "Tam ngung"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="h-9 w-9 px-0" onClick={() => onPurchase(supplier)} aria-label="Tao don nhap">
                      <PackagePlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="h-9 w-9 px-0" onClick={() => onEdit(supplier)} aria-label="Sua nha cung cap">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="h-9 w-9 px-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(supplier)} aria-label="Xoa nha cung cap">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
