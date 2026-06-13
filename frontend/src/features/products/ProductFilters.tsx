"use client";

import { Search } from "lucide-react";
import { categoryOptions, statusOptions } from "./productOptions";
import type { ProductListParams } from "./types";

type ProductFiltersProps = {
  value: ProductListParams;
  onChange: (value: ProductListParams) => void;
};

export function ProductFilters({ value, onChange }: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={value.keyword}
          onChange={(event) => onChange({ ...value, keyword: event.target.value, page: 1 })}
          placeholder="Tim theo ten hoac ma san pham"
          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <select
        value={value.category}
        onChange={(event) => onChange({ ...value, category: event.target.value as ProductListParams["category"], page: 1 })}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
      >
        <option value="ALL">Tat ca loai</option>
        {categoryOptions.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>

      <select
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value as ProductListParams["status"], page: 1 })}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
      >
        <option value="ALL">Tat ca trang thai</option>
        {statusOptions.filter((item) => item.value !== "DELETED").map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </div>
  );
}
