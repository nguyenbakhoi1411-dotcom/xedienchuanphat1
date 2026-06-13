"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { RevenueMonthPoint } from "./types";

export function RevenueByMonthChart({ data }: { data: RevenueMonthPoint[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">Doanh thu theo tháng</h2>
          <p className="mt-1 text-sm text-slate-500">Tổng doanh thu từng tháng trong năm.</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Chưa có dữ liệu doanh thu" description="Thử thay đổi chi nhánh hoặc khoảng thời gian." />
        </div>
      ) : (
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickFormatter={(value) => `${Number(value) / 1_000_000}M`}
                width={54}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]}
                contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#F97316"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
