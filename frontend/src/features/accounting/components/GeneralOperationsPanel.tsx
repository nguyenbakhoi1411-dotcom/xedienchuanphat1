"use client";
import { useState } from "react";
import { LayoutDashboard, FileText, Settings, RefreshCcw, FileEdit, BookOpen } from "lucide-react";
import { AccountingProcessFlowTab } from "./tabs/AccountingProcessFlowTab";
import { AdvanceSettlementTab } from "./tabs/AdvanceSettlementTab";
import { ProfitLossTransferTab } from "./tabs/ProfitLossTransferTab";
import { OtherVoucherTab } from "./tabs/OtherVoucherTab";

export type GeneralOpsTab = "process" | "advance_settlement" | "profit_loss" | "other_voucher";

const TABS = [
  { key: "process", label: "Quy trình", icon: LayoutDashboard },
  { key: "advance_settlement", label: "Quyết toán tạm ứng", icon: FileEdit },
  { key: "profit_loss", label: "Kết chuyển lãi lỗ", icon: RefreshCcw },
  { key: "other_voucher", label: "Chứng từ nghiệp vụ khác", icon: FileText },
] as const;

export function GeneralOperationsPanel() {
  const [activeTab, setActiveTab] = useState<GeneralOpsTab>("process");

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="flex overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
               <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as GeneralOpsTab)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "process" && <AccountingProcessFlowTab onNavigate={setActiveTab} />}
        {activeTab === "advance_settlement" && <AdvanceSettlementTab />}
        {activeTab === "profit_loss" && <ProfitLossTransferTab />}
        {activeTab === "other_voucher" && <OtherVoucherTab />}
      </div>
    </div>
  );
}
