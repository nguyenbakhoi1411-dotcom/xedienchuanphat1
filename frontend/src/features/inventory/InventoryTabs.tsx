"use client";

import { Boxes, ClipboardList, PackagePlus, Repeat } from "lucide-react";
import { cn } from "@/lib/cn";
import type { InventoryTab } from "./types";

const tabs: Array<{ value: InventoryTab; label: string; icon: typeof Boxes }> = [
  { value: "stock", label: "Ton kho", icon: Boxes },
  { value: "import", label: "Nhap kho", icon: PackagePlus },
  { value: "transfer", label: "Chuyen kho", icon: Repeat },
  { value: "history", label: "Lich su", icon: ClipboardList }
];

export function InventoryTabs({ value, onChange }: { value: InventoryTab; onChange: (value: InventoryTab) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg border border-border bg-white p-1 shadow-soft">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              active ? "bg-primary text-white" : "text-slate-600 hover:bg-orange-50 hover:text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
