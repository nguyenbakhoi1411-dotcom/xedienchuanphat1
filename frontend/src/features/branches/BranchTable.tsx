"use client";

import { Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Branch } from "./types";

type BranchTableProps = {
  branches: Branch[];
  loading: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
};

export function BranchTable({ branches, loading, onEdit, onDelete }: BranchTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return <EmptyState title="Chua co chi nhanh" description="Thu thay doi tu khoa tim kiem hoac them chi nhanh moi." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Ma</th>
              <th className="px-4 py-3">Chi nhanh</th>
              <th className="px-4 py-3">Dia chi</th>
              <th className="px-4 py-3">Dien thoai</th>
              <th className="px-4 py-3">Trang thai</th>
              <th className="px-4 py-3 text-right">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {branches.map((branch) => (
              <tr key={branch.id} className="hover:bg-orange-50/40">
                <td className="px-4 py-3 font-medium text-text">{branch.code}</td>
                <td className="px-4 py-3 text-text">{branch.name}</td>
                <td className="max-w-sm px-4 py-3 text-slate-600">{branch.address}</td>
                <td className="px-4 py-3 text-slate-600">{branch.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span className={branch.status === "ACTIVE" ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700" : "rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"}>
                    {branch.status === "ACTIVE" ? "Hoat dong" : "Tam ngung"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="h-9 w-9 px-0" onClick={() => onEdit(branch)} aria-label="Sua chi nhanh">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="h-9 w-9 px-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(branch)} aria-label="Xoa chi nhanh">
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
