"use client";

import { useState, useEffect } from "react";
import { Calendar, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { useBranches } from "@/features/branches/hooks";
import { Button } from "@/components/ui/Button";

type FilterValues = {
  fromDate: string;
  toDate: string;
  branchId: number | "ALL";
  compareWithPrevious: boolean;
};

type FinancialReportFiltersProps = {
  initialValues?: FilterValues;
  onApply: (values: FilterValues) => void;
};

export function FinancialReportFilters({ initialValues, onApply }: FinancialReportFiltersProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [branchId, setBranchId] = useState<number | "ALL">("ALL");
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);

  // Load branches
  const { data: branchesData } = useBranches({ keyword: "", page: 0, pageSize: 100 });

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    setFromDate(initialValues?.fromDate ?? fmt(firstDay));
    setToDate(initialValues?.toDate ?? fmt(today));
    setBranchId(initialValues?.branchId ?? "ALL");
    setCompareWithPrevious(initialValues?.compareWithPrevious ?? false);
  }, [initialValues]);

  const handleApply = () => {
    if (!fromDate || !toDate) {
      toast.error("Vui lòng chọn đầy đủ thời gian");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("Từ ngày không thể lớn hơn đến ngày");
      return;
    }
    onApply({
      fromDate,
      toDate,
      branchId,
      compareWithPrevious
    });
  };

  const handleExport = (type: "excel" | "pdf" | "print") => {
    toast.info("Tính năng đang phát triển");
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 flex-1">
          {/* From Date */}
          <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
            <span>Từ ngày</span>
            <div className="relative mt-1">
              <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </label>

          {/* To Date */}
          <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
            <span>Đến ngày</span>
            <div className="relative mt-1">
              <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </label>

          {/* Branch Select */}
          <label className="space-y-1 text-xs font-semibold uppercase text-slate-500">
            <span>Chi nhánh</span>
            <select
              value={branchId}
              onChange={(e) => {
                const val = e.target.value;
                setBranchId(val === "ALL" ? "ALL" : Number(val));
              }}
              className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">Tất cả chi nhánh</option>
              {branchesData?.items?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          {/* Compare toggle */}
          <div className="flex items-center h-9 md:mt-5">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={compareWithPrevious}
                onChange={(e) => setCompareWithPrevious(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-3 text-xs font-semibold uppercase text-slate-500">So sánh kỳ trước</span>
            </label>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end">
          <Button onClick={handleApply} className="h-9 px-6 bg-primary text-white hover:bg-primary/95 transition-colors">
            Áp dụng
          </Button>
        </div>
      </div>

      {/* Export operations */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400 italic">Xuất dữ liệu:</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-8 text-xs font-medium border-slate-250 flex items-center gap-1.5" onClick={() => handleExport("excel")}>
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            📊 Excel
          </Button>
          <Button variant="secondary" className="h-8 text-xs font-medium border-slate-250 flex items-center gap-1.5" onClick={() => handleExport("pdf")}>
            <FileText className="h-3.5 w-3.5 text-red-500" />
            📄 PDF
          </Button>
          <Button variant="secondary" className="h-8 text-xs font-medium border-slate-250 flex items-center gap-1.5" onClick={() => handleExport("print")}>
            <Printer className="h-3.5 w-3.5 text-blue-500" />
            🖨️ In
          </Button>
        </div>
      </div>
    </section>
  );
}
