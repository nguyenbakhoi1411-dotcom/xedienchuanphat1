"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, BarChart3 } from "lucide-react";
import { FinancialReportFilters } from "@/features/reports/FinancialReportFilters";
import { useFinancialProfitLoss } from "@/features/reports/hooks";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function fmt(n: number | null | undefined) {
  if (n == null) return "0 đ";
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("vi-VN").format(Math.round(abs)) + " đ";
  return n < 0 ? `(${formatted})` : formatted;
}

export default function ProfitLossPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmtDate = (d: Date) => d.toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    fromDate: fmtDate(firstDay),
    toDate: fmtDate(today),
    branchId: "ALL" as number | "ALL",
    compareWithPrevious: false
  });

  const { data: reportData, isLoading, isError } = useFinancialProfitLoss({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    branchId: filters.branchId
  });

  const tableRows = useMemo(() => {
    if (!reportData) return [];
    return [
      {
        label: "Doanh thu thuần",
        thisVal: reportData.revenueThis,
        prevVal: reportData.revenuePrev,
        highlight: "bold",
        italic: false
      },
      {
        label: "Giá vốn hàng bán",
        thisVal: -reportData.cogsThis,
        prevVal: -reportData.cogsPrev,
        highlight: "normal",
        italic: true
      },
      {
        label: "LỢI NHUẬN GỘP",
        thisVal: reportData.grossProfitThis,
        prevVal: reportData.grossProfitPrev,
        highlight: "gop",
        italic: false
      },
      {
        label: "Chi phí bán hàng",
        thisVal: -reportData.sellingExpenseThis,
        prevVal: -reportData.sellingExpensePrev,
        highlight: "normal",
        italic: false
      },
      {
        label: "Chi phí QLDN",
        thisVal: -reportData.adminExpenseThis,
        prevVal: -reportData.adminExpensePrev,
        highlight: "normal",
        italic: false
      },
      {
        label: "LỢI NHUẬN TRƯỚC LÃI VÀ THUẾ (EBIT)",
        thisVal: reportData.ebitThis,
        prevVal: reportData.ebitPrev,
        highlight: "ebit",
        italic: false
      },
      {
        label: "Chi phí lãi vay",
        thisVal: -reportData.interestExpenseThis,
        prevVal: -reportData.interestExpensePrev,
        highlight: "normal",
        italic: false
      },
      {
        label: "LỢI NHUẬN TRƯỚC THUẾ",
        thisVal: reportData.profitBeforeTaxThis,
        prevVal: reportData.profitBeforeTaxPrev,
        highlight: "before-tax",
        italic: false
      },
      {
        label: "Thuế TNDN",
        thisVal: -reportData.taxThis,
        prevVal: -reportData.taxPrev,
        highlight: "normal",
        italic: false
      },
      {
        label: "LỢI NHUẬN SAU THUẾ",
        thisVal: reportData.netProfitThis,
        prevVal: reportData.netProfitPrev,
        highlight: "after-tax",
        italic: false
      }
    ];
  }, [reportData]);

  const chartData = useMemo(() => {
    if (!reportData) return [];
    return [
      {
        name: "LN Gộp",
        "Kỳ này": reportData.grossProfitThis,
        "Kỳ trước": reportData.grossProfitPrev
      },
      {
        name: "EBIT",
        "Kỳ này": reportData.ebitThis,
        "Kỳ trước": reportData.ebitPrev
      },
      {
        name: "LNST",
        "Kỳ này": reportData.netProfitThis,
        "Kỳ trước": reportData.netProfitPrev
      }
    ];
  }, [reportData]);

  const getGrowth = (thisVal: number, prevVal: number) => {
    const t = Math.abs(thisVal);
    const p = Math.abs(prevVal);
    if (p === 0) return 0;
    return ((t - p) / p) * 100;
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

  const getRowClass = (hl: string) => {
    switch (hl) {
      case "bold":
        return "font-bold text-slate-900";
      case "gop":
      case "ebit":
        return "bg-blue-50/70 font-bold text-blue-900";
      case "before-tax":
        return "bg-amber-50/70 font-bold text-amber-900";
      case "after-tax":
        return "bg-emerald-50/70 font-bold text-emerald-900";
      default:
        return "text-slate-600";
    }
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
          <TrendingUp className="h-6 w-6 text-slate-700" /> Báo Cáo Kết Quả Hoạt Động Kinh Doanh
        </h1>
        <p className="text-sm text-slate-500">
          Mẫu số B02-DN: Phản ánh tổng quát tình hình và kết quả hoạt động kinh doanh của doanh nghiệp từ doanh thu, chi phí tới lợi nhuận.
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
        <div className="space-y-8">
          {/* Main Profit Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Chỉ tiêu kinh doanh</th>
                    <th className="px-6 py-3 text-right w-[150px]">Kỳ này</th>
                    <th className="px-6 py-3 text-right w-[150px]">Kỳ trước</th>
                    <th className="px-6 py-3 text-center w-[120px]">% Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableRows.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/30 transition-colors ${getRowClass(row.highlight)}`}>
                      <td className="px-6 py-4">
                        <span className={row.italic ? "italic text-red-500" : ""}>{row.label}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {fmt(row.thisVal)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        {fmt(row.prevVal)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getGrowthElement(row.thisVal, row.prevVal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-slate-500" /> So sánh các chỉ tiêu quan trọng
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(val: number) => [fmt(val), ""]}
                    contentStyle={{ borderRadius: "8px", borderColor: "#e2e8f0" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="Kỳ này" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={36} />
                  <Bar dataKey="Kỳ trước" fill="#d1d5db" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
