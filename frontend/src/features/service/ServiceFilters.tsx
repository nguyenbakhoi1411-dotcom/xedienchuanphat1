"use client";

import { Search } from "lucide-react";
import { ticketStatusOptions } from "./serviceOptions";
import type { TicketListParams } from "./types";

export function ServiceFilters({ value, onChange }: { value: TicketListParams; onChange: (value: TicketListParams) => void }) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={value.keyword}
          onChange={(event) => onChange({ ...value, keyword: event.target.value, page: 1 })}
          placeholder="Tim ma phieu, khach hang, serial xe"
          className="w-full border-0 bg-transparent text-sm outline-none"
        />
      </div>
      <select
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
        value={value.status}
        onChange={(event) => onChange({ ...value, status: event.target.value as TicketListParams["status"], page: 1 })}
      >
        <option value="ALL">Tat ca trang thai</option>
        {ticketStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
  );
}
