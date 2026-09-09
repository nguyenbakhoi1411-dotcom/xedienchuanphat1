"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Receipt, 
  Calculator,
  Download,
  Upload,
  Settings
} from "lucide-react";
import { cn } from "@/lib/cn";
import { VATReportTab } from "@/features/accounting/components/invoices/VATReportTab";

// MOCK COMPONENTS FOR OTHER TABS TO ENSURE COMPONENT WORKS
const OutputInvoicesTab = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
    <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-slate-900 mb-1">Quản lý Hóa đơn Bán ra</h3>
    <p>Chức năng đang được phát triển hoặc hiển thị từ component thật.</p>
  </div>
);

const InputInvoicesTab = () => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center text-slate-500">
    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-slate-900 mb-1">Quản lý Hóa đơn Mua vào</h3>
    <p>Chức năng đang được phát triển hoặc hiển thị từ component thật.</p>
  </div>
);

export default function InvoiceDashboard() {
  const [activeTab, setActiveTab] = useState<"output" | "input" | "vat">("vat");

  const tabs = [
    {
      id: "output",
      label: "Hóa đơn Bán ra",
      icon: <Upload className="w-4 h-4" />,
    },
    {
      id: "input",
      label: "Hóa đơn Mua vào",
      icon: <Download className="w-4 h-4" />,
    },
    {
      id: "vat",
      label: "Báo cáo Thuế GTGT",
      icon: <Calculator className="w-4 h-4" />,
    }
  ] as const;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-blue-600" />
            Quản lý Hóa đơn Điện tử
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý hóa đơn bán ra, mua vào và báo cáo thuế theo NĐ123/TT78
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm">
            <Settings className="w-4 h-4" />
            Cấu hình Hóa đơn
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex-1 sm:flex-none justify-center",
              activeTab === tab.id
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === "output" && <OutputInvoicesTab />}
        {activeTab === "input" && <InputInvoicesTab />}
        {activeTab === "vat" && <VATReportTab />}
      </div>
    </div>
  );
}
