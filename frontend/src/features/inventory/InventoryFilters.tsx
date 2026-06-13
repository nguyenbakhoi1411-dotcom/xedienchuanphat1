"use client";

import { Search } from "lucide-react";
import { branchOptions, transactionTypeOptions } from "./inventoryOptions";
import type { InventoryHistoryParams, InventoryListParams } from "./types";

type InventoryFiltersProps =
  | {
      mode: "stock";
      value: InventoryListParams;
      onChange: (value: InventoryListParams) => void;
    }
  | {
      mode: "history";
      value: InventoryHistoryParams;
      onChange: (value: InventoryHistoryParams) => void;
    };

export function InventoryFilters(props: InventoryFiltersProps) {
  function updateKeyword(keyword: string) {
    if (props.mode === "stock") {
      props.onChange({ ...props.value, keyword, page: 1 });
      return;
    }
    props.onChange({ ...props.value, keyword, page: 1 });
  }

  function updateBranch(branchId: "ALL" | number) {
    if (props.mode === "stock") {
      props.onChange({ ...props.value, branchId, page: 1 });
      return;
    }
    props.onChange({ ...props.value, branchId, page: 1 });
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={props.value.keyword}
          onChange={(event) => updateKeyword(event.target.value)}
          placeholder="Tim san pham, ma san pham hoac so phieu"
          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <select
        value={props.value.branchId}
        onChange={(event) =>
          updateBranch(event.target.value === "ALL" ? "ALL" : Number(event.target.value))
        }
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
      >
        <option value="ALL">Tat ca chi nhanh</option>
        {branchOptions.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>

      {props.mode === "stock" ? (
        <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={props.value.lowStockOnly}
            onChange={(event) => props.onChange({ ...props.value, lowStockOnly: event.target.checked, page: 1 })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          Chi ton kho thap
        </label>
      ) : (
        <select
          value={props.value.type}
          onChange={(event) => props.onChange({ ...props.value, type: event.target.value as InventoryHistoryParams["type"], page: 1 })}
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
        >
          <option value="ALL">Tat ca giao dich</option>
          {transactionTypeOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
