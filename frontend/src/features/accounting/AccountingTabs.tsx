"use client";

import {
  Banknote, BarChart3, BookOpen, Building2, CreditCard,
  FileSpreadsheet, FileText, HandCoins, ListTree, Receipt, Wallet
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { AccountingTab } from "./types";

const tabs: Array<{ value: AccountingTab; label: string; icon: typeof BarChart3; group?: string }> = [
  { value: "overview",     label: "Tổng quan",    icon: BarChart3,     group: "main" },
  { value: "general_operations", label: "Tổng hợp", icon: BookOpen,    group: "main" },
  { value: "accounts",     label: "Hệ TK",        icon: ListTree,      group: "main" },
  { value: "journal",      label: "Bút toán",     icon: BookOpen,      group: "main" },
  { value: "recurring-journals", label: "BT định kỳ", icon: BookOpen,  group: "advanced" },
  { value: "cost-centers", label: "Trung tâm CP", icon: Building2,     group: "advanced" },
  { value: "receipts",     label: "Phiếu thu",    icon: HandCoins,     group: "voucher" },
  { value: "payments",     label: "Phiếu chi",    icon: CreditCard,    group: "voucher" },
  { value: "debts",        label: "Công nợ",      icon: FileText,      group: "voucher" },
  { value: "expenses",     label: "Chi phí",      icon: Wallet,        group: "asset" },
  { value: "fixed-assets", label: "TSCĐ",         icon: Building2,     group: "asset" },
  { value: "reports",      label: "Báo cáo TC",   icon: FileSpreadsheet, group: "report" },
  { value: "cashflow",     label: "Dòng tiền",    icon: Banknote,      group: "report" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Kế toán",
  advanced: "Nâng cao",
  voucher: "Chứng từ",
  asset: "Chi phí / TSCĐ",
  report: "Báo cáo",
};

export function AccountingTabs({
  value,
  onChange,
}: {
  value: AccountingTab;
  onChange: (value: AccountingTab) => void;
}) {
  const groups = Array.from(new Set(tabs.map((t) => t.group ?? "main")));

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        overflowX: "auto",
        background: "rgba(15,23,42,0.6)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "4px",
        flexWrap: "nowrap",
      }}
    >
      {groups.map((group, gi) => (
        <div key={group} style={{ display: "flex", alignItems: "center" }}>
          {gi > 0 && (
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
          )}
          {tabs
            .filter((t) => (t.group ?? "main") === group)
            .map((tab) => {
              const Icon = tab.icon;
              const active = value === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onChange(tab.value)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 13px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    background: active
                      ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))"
                      : "transparent",
                    color: active ? "#a5b4fc" : "#64748b",
                    borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
        </div>
      ))}
    </div>
  );
}
