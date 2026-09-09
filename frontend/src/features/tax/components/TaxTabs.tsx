"use client";
import { useState } from "react";
import { OverviewTab } from "./tabs/OverviewTab";
import { InputInvoicesTab } from "./tabs/InputInvoicesTab";
import { OutputInvoicesTab } from "./tabs/OutputInvoicesTab";
import { VatDeclarationTab } from "./tabs/VatDeclarationTab";
import { TaxDeclarationFormTab } from "./tabs/TaxDeclarationFormTab";
import { TaxSettingsTab } from "./tabs/TaxSettingsTab";
import { cn } from "@/lib/cn";
import { FileText, ArrowRightLeft, FileOutput, ShieldCheck, Settings, LayoutDashboard } from "lucide-react";

export type TaxTabKey = 
  | "overview" 
  | "input_invoices" 
  | "output_invoices" 
  | "vat_declaration" 
  | "tax_declaration_form" 
  | "settings";

const TABS = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { key: "input_invoices", label: "Hóa đơn đầu vào", icon: FileText },
  { key: "output_invoices", label: "Hóa đơn đầu ra", icon: FileOutput },
  { key: "vat_declaration", label: "Khấu trừ thuế", icon: ArrowRightLeft },
  { key: "tax_declaration_form", label: "Tờ khai thuế", icon: ShieldCheck },
  { key: "settings", label: "Thiết lập", icon: Settings },
] as const;

export function TaxTabs() {
  const [activeTab, setActiveTab] = useState<TaxTabKey>("overview");

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-xl bg-white/90">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            Phân hệ Thuế (Tax)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý hóa đơn, khấu trừ và lập tờ khai thuế GTGT theo chuẩn MISA AMIS.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex px-6 overflow-x-auto hide-scrollbar gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 rounded-t-lg group overflow-hidden",
                  isActive 
                    ? "text-blue-700 bg-blue-50/50" 
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.5)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] overflow-hidden">
          {activeTab === "overview" && <OverviewTab onNavigate={setActiveTab} />}
          {activeTab === "input_invoices" && <InputInvoicesTab />}
          {activeTab === "output_invoices" && <OutputInvoicesTab />}
          {activeTab === "vat_declaration" && <VatDeclarationTab />}
          {activeTab === "tax_declaration_form" && <TaxDeclarationFormTab />}
          {activeTab === "settings" && <TaxSettingsTab />}
        </div>
      </div>
    </div>
  );
}
