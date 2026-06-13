"use client";

import { Search } from "lucide-react";
import { paymentMethodOptions, voucherStatusOptions } from "./accountingOptions";
import type { AccountingFilters as AccountingFiltersType, DebtFilters } from "./types";

type Props =
  | { mode: "voucher"; value: AccountingFiltersType; onChange: (value: AccountingFiltersType) => void }
  | { mode: "debt"; value: DebtFilters; onChange: (value: DebtFilters) => void };

export function AccountingFilters(props: Props) {
  function updateKeyword(keyword: string) {
    if (props.mode === "voucher") props.onChange({ ...props.value, keyword, page: 1 });
    else props.onChange({ ...props.value, keyword, page: 1 });
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={props.value.keyword} onChange={(event) => updateKeyword(event.target.value)} placeholder="Tim so phieu, doi tac" className="w-full border-0 bg-transparent text-sm outline-none" />
      </div>
      {props.mode === "voucher" ? (
        <>
          <select className={selectClass} value={props.value.status} onChange={(event) => props.onChange({ ...props.value, status: event.target.value as AccountingFiltersType["status"], page: 1 })}>
            <option value="ALL">Tat ca trang thai</option>
            {voucherStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select className={selectClass} value={props.value.method} onChange={(event) => props.onChange({ ...props.value, method: event.target.value as AccountingFiltersType["method"], page: 1 })}>
            <option value="ALL">Tat ca phuong thuc</option>
            {paymentMethodOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </>
      ) : (
        <select className={selectClass} value={props.value.partyType} onChange={(event) => props.onChange({ ...props.value, partyType: event.target.value as DebtFilters["partyType"], page: 1 })}>
          <option value="ALL">Tat ca cong no</option>
          <option value="CUSTOMER">Khach hang</option>
          <option value="SUPPLIER">Nha cung cap</option>
        </select>
      )}
    </div>
  );
}

const selectClass = "h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
