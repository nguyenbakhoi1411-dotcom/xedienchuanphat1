"use client";

import React, { useState, useCallback, useRef } from "react";
import { accountingApi } from "@/features/accounting/api";
import ReportFilterBar from "@/components/reports/ReportFilterBar";
import TrialBalance from "@/components/reports/TrialBalance";
import IncomeStatement from "@/components/reports/IncomeStatement";
import CashFlow from "@/components/reports/CashFlow";
import DebtAging from "@/components/reports/DebtAging";
import JournalLedger from "@/components/reports/JournalLedger";
import GeneralLedger from "@/components/reports/GeneralLedger";
import BalanceSheet from "@/components/reports/BalanceSheet";
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Banknote,
  Clock,
  FileText,
  ChevronRight,
  ListOrdered,
  Scale,
  Download,
  Loader2,
} from "lucide-react";

// ─── Utils ──────────────────────────────────────────────────────────────────

function thisMonthRange(): [string, string] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const from = `${y}-${m}-01`;
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return [from, `${y}-${m}-${String(lastDay).padStart(2, "0")}`];
}

// ─── Sidebar config ─────────────────────────────────────────────────────────

type ReportKey =
  | "trial-balance"
  | "balance-sheet"
  | "income-statement"
  | "cash-flow"
  | "debt-aging-customer"
  | "debt-aging-supplier"
  | "journal-ledger"
  | "general-ledger";

interface ReportItem {
  key: ReportKey;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
}

const REPORTS: ReportItem[] = [
  { key: "trial-balance", label: "Bảng CĐPS", sublabel: "Cân đối số phát sinh", icon: Scale, color: "text-violet-600" },
  { key: "balance-sheet", label: "BCĐKT", sublabel: "Bảng cân đối kế toán", icon: BarChart3, color: "text-blue-600" },
  { key: "income-statement", label: "KQKD", sublabel: "Kết quả hoạt động KD", icon: TrendingUp, color: "text-emerald-600" },
  { key: "cash-flow", label: "LCTT", sublabel: "Lưu chuyển tiền tệ", icon: Banknote, color: "text-cyan-600" },
  { key: "debt-aging-customer", label: "Tuổi nợ KH", sublabel: "Công nợ phải thu", icon: Clock, color: "text-amber-600" },
  { key: "debt-aging-supplier", label: "Tuổi nợ NCC", sublabel: "Công nợ phải trả", icon: Clock, color: "text-orange-600" },
  { key: "journal-ledger", label: "Sổ Nhật ký", sublabel: "Nhật ký chung TK", icon: BookOpen, color: "text-indigo-600" },
  { key: "general-ledger", label: "Sổ Cái TK", sublabel: "Sổ cái tài khoản", icon: ListOrdered, color: "text-rose-600" },
];

// ─── State per-report ────────────────────────────────────────────────────────

interface ReportState {
  data: any;
  incomeData: any;
  profitLossData: any;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const emptyState = (): ReportState => ({
  data: null,
  incomeData: null,
  profitLossData: null,
  loading: false,
  error: null,
  lastFetched: null,
});

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FinancialReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportKey>("trial-balance");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as ReportKey;
    if (type && REPORTS.some(r => r.key === type)) {
      setActiveReport(type);
    }
  }, []);

  const [fromDate, setFromDate] = useState(thisMonthRange()[0]);
  const [toDate, setToDate] = useState(thisMonthRange()[1]);
  const [generalLedgerAccount, setGeneralLedgerAccount] = useState<string | undefined>();
  const [reportState, setReportState] = useState<Record<ReportKey, ReportState>>(() =>
    Object.fromEntries(REPORTS.map((r) => [r.key, emptyState()])) as Record<ReportKey, ReportState>
  );
  const [exporting, setExporting] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback(
    (key: ReportKey, patch: Partial<ReportState>) =>
      setReportState((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } })),
    []
  );

  const fetchReport = useCallback(async () => {
    const key = activeReport;
    updateState(key, { loading: true, error: null });
    try {
      if (key === "trial-balance") {
        const data = await accountingApi.trialBalanceRaw(fromDate, toDate);
        updateState(key, { data, loading: false, lastFetched: new Date().toISOString() });
      } else if (key === "balance-sheet") {
        const data = await accountingApi.balanceSheetRaw(fromDate, toDate);
        updateState(key, { data, loading: false, lastFetched: new Date().toISOString() });
      } else if (key === "income-statement") {
        const [incomeData, profitLossData] = await Promise.all([
          accountingApi.incomeStatementRaw(fromDate, toDate),
          accountingApi.profitLossRaw(fromDate, toDate),
        ]);
        updateState(key, { incomeData, profitLossData, loading: false, lastFetched: new Date().toISOString() });
      } else if (key === "cash-flow") {
        const data = await accountingApi.cashFlowRaw(fromDate, toDate);
        updateState(key, { data, loading: false, lastFetched: new Date().toISOString() });
      } else if (key === "debt-aging-customer") {
        const data = await accountingApi.customerDebtAgingRaw();
        updateState(key, { data, loading: false, lastFetched: new Date().toISOString() });
      } else if (key === "debt-aging-supplier") {
        const data = await accountingApi.supplierDebtAgingRaw();
        updateState(key, { data, loading: false, lastFetched: new Date().toISOString() });
      } else if (key === "general-ledger") {
        if (!generalLedgerAccount) {
          updateState(key, { loading: false, error: "Vui lòng chọn tài khoản" });
          return;
        }
        const data = await accountingApi.generalLedgerRaw(generalLedgerAccount, fromDate, toDate);
        updateState(key, { data, loading: false, lastFetched: new Date().toISOString() });
      } else {
        // journal-ledger handles its own fetching inside the component
        updateState(key, { loading: false, lastFetched: new Date().toISOString() });
      }
    } catch (err: any) {
      updateState(key, {
        loading: false,
        error: err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi tải báo cáo",
      });
    }
  }, [activeReport, fromDate, toDate, generalLedgerAccount, updateState]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      // Trigger browser print dialog for current view
      window.print();
    } finally {
      setExporting(false);
    }
  }, []);

  const current = reportState[activeReport];
  const activeItem = REPORTS.find((r) => r.key === activeReport)!;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:block">
      {/* ── Sidebar ── */}
      <aside className="w-64 flex-none bg-white border-r border-gray-200 flex flex-col print:hidden">
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Báo cáo Tài chính</h1>
              <p className="text-xs text-gray-500">MISA AMIS / TT200</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {REPORTS.map((item) => {
            const Icon = item.icon;
            const isActive = activeReport === item.key;
            const st = reportState[item.key];
            return (
              <button
                key={item.key}
                onClick={() => setActiveReport(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all ${
                  isActive
                    ? "bg-violet-50 border border-violet-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 flex-none ${isActive ? item.color : "text-gray-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{item.sublabel}</p>
                </div>
                {st.loading && <Loader2 className="w-3 h-3 text-violet-500 animate-spin flex-none" />}
                {st.lastFetched && !st.loading && !st.error && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-none" title="Đã tải" />
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-violet-400 flex-none" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Chuẩn Thông tư 200/2014/TT-BTC</p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter bar */}
        <ReportFilterBar
          fromDate={fromDate}
          toDate={toDate}
          onChange={(f, t) => { setFromDate(f); setToDate(t); }}
          onApply={fetchReport}
          onExport={handleExport}
          loading={current.loading}
        />

        {/* Report heading */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            {React.createElement(activeItem.icon, { className: `w-5 h-5 ${activeItem.color}` })}
            <div>
              <h2 className="text-base font-semibold text-gray-900">{activeItem.sublabel}</h2>
              {current.lastFetched && (
                <p className="text-xs text-gray-400">
                  Cập nhật {new Date(current.lastFetched).toLocaleTimeString("vi-VN")} •{" "}
                  {fromDate} → {toDate}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {exporting ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>In/Xuất</span>
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        {current.error && (
          <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{current.error}</span>
          </div>
        )}

        {/* Report content */}
        <div ref={mainRef} className="flex-1 overflow-y-auto px-6 py-4">
          {/* Empty state when not yet fetched */}
          {!current.lastFetched && !current.loading && activeReport !== "journal-ledger" && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                {React.createElement(activeItem.icon, { className: "w-8 h-8 text-gray-300" })}
              </div>
              <p className="text-base font-medium text-gray-500">Chọn kỳ và nhấn "Xem báo cáo"</p>
              <p className="text-sm text-gray-400 mt-1">Dữ liệu thời gian thực từ sổ cái</p>
            </div>
          )}

          {activeReport === "trial-balance" && (current.data || current.loading) && (
            <TrialBalance
              data={current.data}
              loading={current.loading}
              onAccountClick={(code) => {
                setGeneralLedgerAccount(code);
                setActiveReport("general-ledger");
              }}
            />
          )}

          {activeReport === "balance-sheet" && (current.data || current.loading) && (
            <BalanceSheet data={current.data} loading={current.loading} />
          )}

          {activeReport === "income-statement" && (current.incomeData !== null || current.loading) && (
            <IncomeStatement
              incomeData={current.incomeData}
              profitLossData={current.profitLossData}
              loading={current.loading}
            />
          )}

          {activeReport === "cash-flow" && (current.data || current.loading) && (
            <CashFlow data={current.data} loading={current.loading} />
          )}

          {activeReport === "debt-aging-customer" && (current.data || current.loading) && (
            <DebtAging
              data={current.data}
              loading={current.loading}
              type="customer"
              title="Tuổi Nợ Phải Thu (Khách Hàng)"
            />
          )}

          {activeReport === "debt-aging-supplier" && (current.data || current.loading) && (
            <DebtAging
              data={current.data}
              loading={current.loading}
              type="supplier"
              title="Tuổi Nợ Phải Trả (Nhà Cung Cấp)"
            />
          )}

          {activeReport === "journal-ledger" && (
            <JournalLedger fromDate={fromDate} toDate={toDate} />
          )}

          {activeReport === "general-ledger" && (
            <GeneralLedger
              fromDate={fromDate}
              toDate={toDate}
              initialAccountCode={generalLedgerAccount}
            />
          )}
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}
