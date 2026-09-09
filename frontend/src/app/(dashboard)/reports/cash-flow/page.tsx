"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Coins, ArrowRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { FinancialReportFilters } from "@/features/reports/FinancialReportFilters";
import { useFinancialCashFlow } from "@/features/reports/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

function fmt(n: number | null | undefined) {
  if (n == null) return "0 đ";
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("vi-VN").format(Math.round(abs)) + " đ";
  return n < 0 ? `(${formatted})` : formatted;
}

export default function CashFlowPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmtDate = (d: Date) => d.toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    fromDate: fmtDate(firstDay),
    toDate: fmtDate(today),
    branchId: "ALL" as number | "ALL",
    compareWithPrevious: false
  });

  const { data: reportData, isLoading, isError } = useFinancialCashFlow({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    branchId: filters.branchId
  });

  const getGrowth = (thisVal: number, prevVal: number) => {
    if (prevVal === 0) return 0;
    return ((thisVal - prevVal) / prevVal) * 100;
  };

  const getGrowthElement = (thisVal: number, prevVal: number) => {
    const pct = getGrowth(thisVal, prevVal);
    if (pct > 0) {
      return <span className="text-emerald-600 font-semibold">+{pct.toFixed(1)}%</span>;
    }
    if (pct < 0) {
      return <span className="text-red-500 font-semibold">{pct.toFixed(1)}%</span>;
    }
    return <span className="text-slate-400">0%</span>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Back Link */}
      <div className="flex items-center gap-3">
        <Link href="/reports" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ChevronLeft className="h-4 w-4" /> Quay lại báo cáo
        </Link>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Coins className="h-6 w-6 text-slate-700" /> Báo Cáo Lưu Chuyển Tiền Tệ
        </h1>
        <p className="text-sm text-slate-500">
          Mẫu số B03-DN: Theo dõi và phân tích sự biến động dòng tiền mặt và tiền gửi ngân hàng đi vào và đi ra của doanh nghiệp.
        </p>
      </div>

      {/* Filters */}
      <FinancialReportFilters
        initialValues={filters}
        onApply={(vals) => setFilters(vals)}
      />

      {isLoading ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError || !reportData ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">Không tìm thấy dữ liệu cho kỳ báo cáo đã chọn.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Cash In */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Tổng thu (Dòng tiền vào)</span>
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <ArrowDownLeft className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-2xl font-bold text-slate-900">{fmt(reportData.cashInThis)}</div>
                <div className="text-xs text-slate-400">
                  So với kỳ trước: {fmt(reportData.cashInPrev)}
                </div>
              </div>
            </div>

            {/* Cash Out */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Tổng chi (Dòng tiền ra)</span>
                <span className="rounded-lg bg-red-50 p-2 text-red-600">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-2xl font-bold text-slate-900">{fmt(reportData.cashOutThis)}</div>
                <div className="text-xs text-slate-400">
                  So với kỳ trước: {fmt(reportData.cashOutPrev)}
                </div>
              </div>
            </div>

            {/* Net Flow */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Lưu chuyển tiền thuần (Ròng)</span>
                <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Coins className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <div className={`text-2xl font-bold ${reportData.netCashFlowThis >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                  {fmt(reportData.netCashFlowThis)}
                </div>
                <div className="text-xs text-slate-400">
                  So với kỳ trước: {fmt(reportData.netCashFlowPrev)}
                </div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Chỉ tiêu lưu chuyển</th>
                    <th className="px-6 py-3 text-right w-[150px]">Kỳ này</th>
                    <th className="px-6 py-3 text-right w-[150px]">Kỳ trước</th>
                    <th className="px-6 py-3 text-center w-[120px]">% Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Cash In row */}
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">1. Dòng tiền vào từ hoạt động kinh doanh (Thu tiền)</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{fmt(reportData.cashInThis)}</td>
                    <td className="px-6 py-4 text-right text-slate-400">{fmt(reportData.cashInPrev)}</td>
                    <td className="px-6 py-4 text-center">{getGrowthElement(reportData.cashInThis, reportData.cashInPrev)}</td>
                  </tr>

                  {/* Cash Out row */}
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">2. Dòng tiền ra từ hoạt động kinh doanh (Chi tiền)</td>
                    <td className="px-6 py-4 text-right font-bold text-red-500">({fmt(reportData.cashOutThis)})</td>
                    <td className="px-6 py-4 text-right text-slate-400">({fmt(reportData.cashOutPrev)})</td>
                    <td className="px-6 py-4 text-center">{getGrowthElement(reportData.cashOutThis, reportData.cashOutPrev)}</td>
                  </tr>

                  {/* Net row */}
                  <tr className="bg-blue-50/40 font-bold text-blue-900">
                    <td className="px-6 py-4">3. Lưu chuyển tiền thuần trong kỳ (Net Cash Flow)</td>
                    <td className="px-6 py-4 text-right">{fmt(reportData.netCashFlowThis)}</td>
                    <td className="px-6 py-4 text-right text-blue-900/60">{fmt(reportData.netCashFlowPrev)}</td>
                    <td className="px-6 py-4 text-center">{getGrowthElement(reportData.netCashFlowThis, reportData.netCashFlowPrev)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
