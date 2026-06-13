"use client";

import { Search } from "lucide-react";
import { branchOptions, roleOptions, statusOptions } from "./userOptions";
import type { UserListParams } from "./types";

export function UserFilters({ value, onChange }: { value: UserListParams; onChange: (value: UserListParams) => void }) {
  return (
    <div className="flex flex-col gap-2 xl:flex-row">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={value.keyword}
          onChange={(event) => onChange({ ...value, keyword: event.target.value, page: 1 })}
          placeholder="Tim ma NV, ten, email, so dien thoai"
          className="w-full border-0 bg-transparent text-sm outline-none"
        />
      </div>
      <select className={selectClass} value={value.branchId} onChange={(event) => onChange({ ...value, branchId: event.target.value === "ALL" ? "ALL" : Number(event.target.value), page: 1 })}>
        <option value="ALL">Tat ca chi nhanh</option>
        {branchOptions.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
      </select>
      <select className={selectClass} value={value.role} onChange={(event) => onChange({ ...value, role: event.target.value as UserListParams["role"], page: 1 })}>
        <option value="ALL">Tat ca vai tro</option>
        {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
      </select>
      <select className={selectClass} value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value as UserListParams["status"], page: 1 })}>
        <option value="ALL">Tat ca trang thai</option>
        {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
      </select>
    </div>
  );
}

const selectClass = "h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
