"use client";
import { useState } from "react";
import { SalesProcessFlowTab } from "./tabs/SalesProcessFlowTab";
import { QuoteTab } from "./tabs/QuoteTab";
import { SalesOrderTab } from "./tabs/SalesOrderTab";
import { SalesContractTab } from "./tabs/SalesContractTab";
import { SalesVoucherTab } from "./tabs/SalesVoucherTab";
import { SalesInvoiceTab } from "./tabs/SalesInvoiceTab";
import { SalesDiscountTab } from "./tabs/SalesDiscountTab";
import { SalesReturnTab } from "./tabs/SalesReturnTab";
import { cn } from "@/lib/cn";
import { 
  FileText, Package, Briefcase, 
  Receipt, FileCheck, LayoutDashboard,
  RefreshCcw, Percent
} from "lucide-react";

export type SalesTabKey = 
  | "process" 
  | "quote" 
  | "sales_order" 
  | "contract" 
  | "voucher" 
  | "invoice"
  | "discount"
  | "return";

const TABS = [
  { key: "process", label: "Nghiệp vụ", icon: LayoutDashboard },
  { key: "quote", label: "Báo giá", icon: FileText },
  { key: "sales_order", label: "Đơn đặt hàng", icon: Package },
  { key: "contract", label: "Hợp đồng", icon: Briefcase },
  { key: "voucher", label: "Chứng từ bán hàng", icon: Receipt },
  { key: "invoice", label: "Hóa đơn", icon: FileCheck },
  { key: "return", label: "Trả lại hàng bán", icon: RefreshCcw },
  { key: "discount", label: "Giảm giá hàng bán", icon: Percent },
] as const;

export function SalesTabs() {
  const [activeTab, setActiveTab] = useState<SalesTabKey>("process");

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-xl bg-white/90">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shadow-inner">
              <Package className="w-6 h-6" />
            </div>
            Phân hệ Bán hàng
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý toàn bộ quy trình bán hàng ERP từ Báo giá đến Hóa đơn.</p>
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
                    ? "text-emerald-700 bg-emerald-50/50" 
                    : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full shadow-[0_-2px_8px_rgba(16,185,129,0.5)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 max-w-[1600px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] overflow-hidden">
          {activeTab === "process" && <SalesProcessFlowTab onNavigate={setActiveTab} />}
          {activeTab === "quote" && <QuoteTab />}
          {activeTab === "sales_order" && <SalesOrderTab />}
          {activeTab === "contract" && <SalesContractTab />}
          {activeTab === "voucher" && <SalesVoucherTab />}
          {activeTab === "invoice" && <SalesInvoiceTab />}
          {activeTab === "discount" && <SalesDiscountTab />}
          {activeTab === "return" && <SalesReturnTab />}
        </div>
      </div>
    </div>
  );
}
