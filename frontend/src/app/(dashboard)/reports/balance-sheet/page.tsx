"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Scale, ArrowRight, ChevronDown, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { FinancialReportFilters } from "@/features/reports/FinancialReportFilters";
import { useFinancialBalanceSheet } from "@/features/reports/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

function fmt(n: number | null | undefined) {
  if (n == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " đ";
}

export default function BalanceSheetPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmtDate = (d: Date) => d.toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    fromDate: fmtDate(firstDay),
    toDate: fmtDate(today),
    branchId: "ALL" as number | "ALL",
    compareWithPrevious: false
  });

  const { data: reportData, isLoading, isError } = useFinancialBalanceSheet({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    branchId: filters.branchId,
    compareWithPrevious: filters.compareWithPrevious
  });

  // Collapsed group state
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (code: string) => {
    const next = new Set(collapsedGroups);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setCollapsedGroups(next);
  };

  // Determine check banner details
  const checks = useMemo(() => {
    if (!reportData) return { isBalanced: true, difference: 0, total: 0 };
    const diff = Math.abs(reportData.totalAssets - reportData.totalResources);
    return {
      isBalanced: diff === 0,
      difference: diff,
      total: reportData.totalAssets
    };
  }, [reportData]);

  // Filters out descendants of collapsed parent accounts
  const filterVisibleRows = (rows: any[] = []) => {
    return rows.filter((r) => {
      // Check if any ancestor of this row is collapsed
      for (const collapsed of collapsedGroups) {
        if (r.code !== collapsed && r.code.startsWith(collapsed)) {
          return false;
        }
      }
      return true;
    });
  };

  const visibleAssets = useMemo(() => filterVisibleRows(reportData?.assets), [reportData, collapsedGroups]);
  const visibleResources = useMemo(() => filterVisibleRows(reportData?.resources), [reportData, collapsedGroups]);

  return (
    <div className="space-y-6 p-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/reports" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ChevronLeft className="h-4 w-4" /> Quay lại báo cáo
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Scale className="h-6 w-6 text-slate-700" /> Bảng Cân Đối Kế Toán
        </h1>
        <p className="text-sm text-slate-500">
          Mẫu số B01-DN: Báo cáo tài chính tổng hợp phản ánh tổng quát tình hình tài sản và nguồn vốn hình thành tài sản.
        </p>
      </div>

      {/* Shared Filters */}
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
          {/* Balance Check Banner */}
          {checks.isBalanced ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-emerald-800 text-sm font-medium">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>✓ Bảng cân đối: Tổng TS = Tổng NV = {fmt(checks.total)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50/50 p-4 text-red-800 text-sm font-medium">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
              <span>⚠ Chênh lệch tài sản và nguồn vốn: {fmt(checks.difference)}</span>
            </div>
          )}

          {/* Tree Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT COLUMN: TÀI SẢN */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">A - TÀI SẢN</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2 w-[70px]">Mã số</th>
                      <th className="px-4 py-2">Chỉ tiêu tài sản</th>
                      <th className="px-4 py-2 text-right w-[110px]">Kỳ này</th>
                      {filters.compareWithPrevious && (
                        <th className="px-4 py-2 text-right w-[110px]">Kỳ trước</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleAssets.map((row) => {
                      const isCollapsed = collapsedGroups.has(row.code);
                      const hasChildren = !row.isDetail;
                      return (
                        <tr
                          key={row.code}
                          className={`hover:bg-slate-50/20 transition-colors ${
                            !row.isDetail ? "bg-slate-50/30 font-semibold text-slate-900" : "text-slate-600"
                          }`}
                        >
                          <td className="px-4 py-2.5 font-mono text-slate-400">{row.code}</td>
                          <td className="px-4 py-2.5">
                            <div
                              className="flex items-center gap-1 cursor-pointer"
                              style={{ paddingLeft: `${(row.level - 1) * 12}px` }}
                              onClick={() => !row.isDetail && toggleGroup(row.code)}
                            >
                              {!row.isDetail ? (
                                isCollapsed ? (
                                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
                                )
                              ) : (
                                <span className="w-3 shrink-0" />
                              )}
                              <span>{row.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold">{fmt(row.thisPeriod)}</td>
                          {filters.compareWithPrevious && (
                            <td className="px-4 py-2.5 text-right text-slate-400">{fmt(row.prevPeriod)}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="bg-indigo-50/80 border-t border-slate-200 px-5 py-3.5 font-bold text-indigo-900 flex justify-between text-sm">
                <span>TỔNG CỘNG TÀI SẢN</span>
                <span>{fmt(reportData.totalAssets)}</span>
              </div>
            </div>

            {/* RIGHT COLUMN: NGUỒN VỐN */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">B - NGUỒN VỐN</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2 w-[70px]">Mã số</th>
                      <th className="px-4 py-2">Chỉ tiêu nguồn vốn</th>
                      <th className="px-4 py-2 text-right w-[110px]">Kỳ này</th>
                      {filters.compareWithPrevious && (
                        <th className="px-4 py-2 text-right w-[110px]">Kỳ trước</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleResources.map((row) => {
                      const isCollapsed = collapsedGroups.has(row.code);
                      const hasChildren = !row.isDetail;
                      return (
                        <tr
                          key={row.code}
                          className={`hover:bg-slate-50/20 transition-colors ${
                            !row.isDetail ? "bg-slate-50/30 font-semibold text-slate-900" : "text-slate-600"
                          }`}
                        >
                          <td className="px-4 py-2.5 font-mono text-slate-400">{row.code}</td>
                          <td className="px-4 py-2.5">
                            <div
                              className="flex items-center gap-1 cursor-pointer"
                              style={{ paddingLeft: `${(row.level - 1) * 12}px` }}
                              onClick={() => !row.isDetail && toggleGroup(row.code)}
                            >
                              {!row.isDetail ? (
                                isCollapsed ? (
                                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
                                )
                              ) : (
                                <span className="w-3 shrink-0" />
                              )}
                              <span>{row.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold">{fmt(row.thisPeriod)}</td>
                          {filters.compareWithPrevious && (
                            <td className="px-4 py-2.5 text-right text-slate-400">{fmt(row.prevPeriod)}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="bg-indigo-50 border-t border-slate-200 px-5 py-3.5 font-bold text-slate-900 flex justify-between text-sm">
                <span>TỔNG CỘNG NGUỒN VỐN</span>
                <span>{fmt(reportData.totalResources)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
