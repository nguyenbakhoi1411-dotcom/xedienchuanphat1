"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { BranchRevenuePoint } from "./types";

export function RevenueByBranchChart({ data }: { data: BranchRevenuePoint[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <h2 className="text-base font-semibold text-text">Doanh thu theo chi nhánh</h2>
      <p className="mt-1 text-sm text-slate-500">So sánh doanh thu giữa các chi nhánh.</p>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Không có dữ liệu chi nhánh" description="Chi nhánh này chưa phát sinh doanh thu." />
        </div>
      ) : (
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="branchName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
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
              <Bar dataKey="revenue" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
