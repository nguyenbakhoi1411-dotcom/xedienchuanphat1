"use client";

import { Search } from "lucide-react";
import { customerSourceOptions, customerTypeOptions } from "./customerOptions";
import type { CustomerListParams } from "./types";

export function CustomerFilters({ value, onChange }: { value: CustomerListParams; onChange: (value: CustomerListParams) => void }) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={value.keyword}
          onChange={(event) => onChange({ ...value, keyword: event.target.value, page: 1 })}
          placeholder="Tim theo ten, so dien thoai, email"
          className="w-full border-0 bg-transparent text-sm outline-none"
        />
      </div>
      <select className={selectClass} value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value as CustomerListParams["type"], page: 1 })}>
        <option value="ALL">Tat ca loai</option>
        {customerTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <select className={selectClass} value={value.source} onChange={(event) => onChange({ ...value, source: event.target.value as CustomerListParams["source"], page: 1 })}>
        <option value="ALL">Tat ca nguon</option>
        {customerSourceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
  );
}

const selectClass = "h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
