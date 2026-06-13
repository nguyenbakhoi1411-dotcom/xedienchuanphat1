"use client";

import type { ReactNode } from "react";
import { Lock, Pencil, Unlock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { getBranchNames, getRoleLabel, getStatusLabel } from "./userOptions";
import type { EmployeeUser, PageResponse, UserListParams, UserStatus } from "./types";

type Props = {
  data?: PageResponse<EmployeeUser>;
  params: UserListParams;
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (user: EmployeeUser) => void;
  onToggleStatus: (user: EmployeeUser) => void;
};

const statusClass: Record<UserStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  LOCKED: "bg-red-50 text-red-700"
};

export function UserTable({ data, params, loading, onPageChange, onEdit, onToggleStatus }: Props) {
  if (loading) return <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12" />)}</div>;
  if (!data || data.items.length === 0) return <div className="p-4"><EmptyState title="Khong co nhan vien" description="Thu thay doi bo loc hoac them nhan vien moi." /></div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-background text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nhan vien</th>
              <th className="px-4 py-3">Lien he</th>
              <th className="px-4 py-3">Chi nhanh</th>
              <th className="px-4 py-3">Vai tro</th>
              <th className="px-4 py-3">Trang thai</th>
              <th className="px-4 py-3">Dang nhap gan nhat</th>
              <th className="px-4 py-3 text-right">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((user) => (
              <tr key={user.id} className="hover:bg-orange-50/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-text">{user.fullName}</div>
                  <div className="mt-1 text-xs text-slate-500">{user.employeeCode}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{user.email}</div>
                  <div className="mt-1 text-xs">{user.phone}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{getBranchNames(user.branchIds)}</td>
                <td className="px-4 py-3">
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {user.roles.map((role) => <span key={role} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-primary">{getRoleLabel(role)}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusClass[user.status])}>
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.lastLoginAt ?? "Chua dang nhap"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton label="Sua nhan vien" onClick={() => onEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton label={user.status === "ACTIVE" ? "Khoa tai khoan" : "Mo tai khoan"} danger={user.status === "ACTIVE"} onClick={() => onToggleStatus(user)}>
                      {user.status === "ACTIVE" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Trang {data.page} / {data.totalPages} - {data.totalItems} nhan vien</span>
        <div className="flex gap-2">
          <button type="button" className={pageButtonClass} disabled={params.page <= 1} onClick={() => onPageChange(params.page - 1)}>Truoc</button>
          <button type="button" className={pageButtonClass} disabled={params.page >= data.totalPages} onClick={() => onPageChange(params.page + 1)}>Sau</button>
        </div>
      </div>
    </>
  );
}

function IconButton({ label, danger, children, onClick }: { label: string; danger?: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors", danger ? "text-red-600 hover:bg-red-50" : "text-slate-500 hover:bg-orange-50 hover:text-primary")}
    >
      {children}
    </button>
  );
}

const pageButtonClass = "h-9 rounded-lg border border-border bg-white px-3 font-medium text-text disabled:cursor-not-allowed disabled:opacity-50";
