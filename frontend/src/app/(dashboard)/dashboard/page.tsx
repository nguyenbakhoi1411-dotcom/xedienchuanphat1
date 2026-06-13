"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { DashboardFilters } from "@/features/dashboard/DashboardFilters";
import { DashboardSkeleton } from "@/features/dashboard/DashboardSkeleton";
import { KpiCard } from "@/features/dashboard/KpiCard";
import { ReportChart } from "@/features/reports/ReportChart";
import { RevenueByBranchChart } from "@/features/dashboard/RevenueByBranchChart";
import { RevenueByMonthChart } from "@/features/dashboard/RevenueByMonthChart";
import { TopProductsTable } from "@/features/dashboard/TopProductsTable";
import { WarrantyTicketsTable } from "@/features/dashboard/WarrantyTicketsTable";
import { useDashboard } from "@/features/dashboard/hooks";
import type { DashboardFilters as DashboardFiltersType } from "@/features/dashboard/types";

const defaultFilters: DashboardFiltersType = {
  branchId: "all",
  employeeId: "all",
  productCategory: "all",
  fromDate: "",
  toDate: "",
  month: "all",
  timeRange: "THIS_MONTH"
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFiltersType>(defaultFilters);
  const { data, isLoading, isError, refetch } = useDashboard(filters);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Tổng quan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan doanh thu, kho hàng, công nợ và bảo hành của hệ thống Chuẩn Phát.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DashboardFilters value={filters} onChange={setFilters} />
          <Button variant="secondary" onClick={() => void refetch()}>
            <RotateCcw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </section>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError || !data ? (
        <EmptyState
          title="Không tải được tổng quan"
          description="Vui lòng thử lại hoặc kiểm tra kết nối API."
          action={<Button onClick={() => void refetch()}>Tải lại</Button>}
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((item) => (
              <KpiCard key={item.key} item={item} />
            ))}
          </section>

          <section className="grid gap-4 2xl:grid-cols-[1.35fr_0.9fr]">
            <RevenueByMonthChart data={data.revenueByMonth} />
            <RevenueByBranchChart data={data.revenueByBranch} />
          </section>

          <section className="grid gap-4 2xl:grid-cols-2">
            <ReportChart
              title="Lợi nhuận theo tháng"
              description="Lợi nhuận gộp 12 tháng gần nhất."
              chartLabel="Lợi nhuận"
              data={data.profitByMonth.map((item) => ({ label: item.month, primaryValue: item.profit }))}
            />
            <ReportChart
              title="Nhân viên bán hàng nổi bật"
              description="Xếp hạng theo doanh thu trong kỳ lọc."
              chartLabel="Doanh thu"
              secondaryChartLabel="Số đơn"
              data={data.topEmployees.map((item) => ({ label: item.employeeName, primaryValue: item.revenue, secondaryValue: item.orders }))}
            />
          </section>

          <section className="grid gap-4 2xl:grid-cols-2">
            <ReportChart
              title="Tỷ lệ nguồn khách"
              description="Nguồn khách hàng mới theo bộ lọc."
              chartLabel="Khách hàng"
              data={data.customerSources.map((item) => ({ label: item.source, primaryValue: item.customers }))}
            />
            <ReportChart
              title="Tình trạng bảo hành/sửa chữa"
              description="Số phiếu và chi phí theo trạng thái."
              chartLabel="Số phiếu"
              secondaryChartLabel="Chi phí"
              data={data.warrantyStatus.map((item) => ({ label: item.status, primaryValue: item.tickets, secondaryValue: item.cost }))}
            />
          </section>

          <section className="grid gap-4 2xl:grid-cols-[0.95fr_1.35fr]">
            <TopProductsTable data={data.topProducts} />
            <WarrantyTicketsTable data={data.warrantyTickets} />
          </section>
        </>
      )}
    </div>
  );
}
