"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ReportExportButtons } from "@/features/reports/ReportExportButtons";
import { ReportFilters } from "@/features/reports/ReportFilters";
import { ReportSkeleton } from "@/features/reports/ReportSkeleton";
import { ReportTable } from "@/features/reports/ReportTable";
import { useReport } from "@/features/reports/hooks";
import type { ReportFilters as ReportFiltersType, ReportSummaryCard, ReportType } from "@/features/reports/types";

const ReportChart = dynamic(
  () => import("@/features/reports/ReportChart").then((module) => module.ReportChart),
  { loading: () => <ReportSkeleton /> }
);

function defaultReportFilters(): ReportFiltersType {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    fromDate: formatDateInput(monthStart),
    toDate: formatDateInput(today),
    branchId: "all",
    employeeId: "all",
    productId: "all",
    customerId: "all",
    status: "all",
    productCategory: "all",
    page: 0,
    pageSize: 50
  };
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("SALES_REPORT");
  const [filters, setFilters] = useState<ReportFiltersType>(() => defaultReportFilters());
  const { data, isLoading, isError, refetch } = useReport(reportType, filters);

  const isInvalidRange = useMemo(() => filters.fromDate > filters.toDate, [filters.fromDate, filters.toDate]);
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Bao cao</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tong hop doanh thu, chi nhanh, nhan vien, san pham, ton kho, cong no, loi nhuan va bao hanh.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ReportExportButtons reportType={reportType} filters={filters} disabled={isLoading || isInvalidRange || !data} />
          <Button variant="secondary" onClick={() => void refetch()} disabled={isInvalidRange}>
            <RotateCcw className="h-4 w-4" />
            Lam moi
          </Button>
        </div>
      </section>

      <ReportFilters
        reportType={reportType}
        filters={filters}
        onReportTypeChange={(nextType) => {
          setReportType(nextType);
          setFilters((current) => ({ ...current, page: 0 }));
        }}
        onFiltersChange={setFilters}
      />

      {isInvalidRange ? (
        <EmptyState
          title="Khoang ngay khong hop le"
          description="Ngay bat dau phai nho hon hoac bang ngay ket thuc."
        />
      ) : isLoading ? (
        <ReportSkeleton />
      ) : isError || !data ? (
        <EmptyState
          title="Khong tai duoc bao cao"
          description="Vui long thu lai hoac kiem tra ket noi API."
          action={<Button onClick={() => void refetch()}>Tai lai</Button>}
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {data.summary.map((item) => (
              <SummaryCard key={item.key} item={item} />
            ))}
          </section>

          <ReportChart
            title={data.title}
            description={data.description}
            chartLabel={data.chartLabel}
            secondaryChartLabel={data.secondaryChartLabel}
            data={data.chart}
          />

          <ReportTable columns={data.tableColumns} rows={data.tableRows} />

          {data.performance?.message ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {data.performance.message}
            </section>
          ) : null}

          {pagination ? (
            <section className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Trang {pagination.page + 1}/{Math.max(pagination.totalPages, 1)} - {pagination.totalItems} dong
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filters.pageSize}
                  onChange={(event) => setFilters((current) => ({ ...current, page: 0, pageSize: Number(event.target.value) }))}
                  className="h-9 rounded-lg border border-border bg-white px-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
                >
                  {[25, 50, 100, 200].map((size) => (
                    <option key={size} value={size}>
                      {size}/trang
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  disabled={filters.page <= 0 || isLoading}
                  onClick={() => setFilters((current) => ({ ...current, page: Math.max(current.page - 1, 0) }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Truoc
                </Button>
                <Button
                  variant="secondary"
                  disabled={isLoading || pagination.page + 1 >= pagination.totalPages}
                  onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          ) : null}

          <p className="text-xs text-slate-500">
            Cap nhat luc {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(data.updatedAt))}
          </p>
        </>
      )}
    </div>
  );
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function SummaryCard({ item }: { item: ReportSummaryCard }) {
  const toneClass =
    item.tone === "orange"
      ? "bg-orange-50 text-primary"
      : item.tone === "green"
        ? "bg-emerald-50 text-emerald-700"
        : item.tone === "blue"
          ? "bg-blue-50 text-blue-700"
          : item.tone === "red"
            ? "bg-red-50 text-red-700"
            : "bg-slate-100 text-slate-700";

  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{item.label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-normal text-text">{item.value}</div>
      <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
    </article>
  );
}
