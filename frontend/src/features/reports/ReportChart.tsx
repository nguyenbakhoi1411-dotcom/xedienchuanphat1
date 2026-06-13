"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { ReportChartPoint } from "./types";

type ReportChartProps = {
  title: string;
  description: string;
  chartLabel: string;
  secondaryChartLabel?: string;
  data: ReportChartPoint[];
};

export function ReportChart({ title, description, chartLabel, secondaryChartLabel, data }: ReportChartProps) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div>
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Khong co du lieu bieu do" description="Thu thay doi bo loc hoac khoang thoi gian." />
        </div>
      ) : (
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickFormatter={(value) => formatAxisValue(Number(value))}
                width={58}
              />
              <Tooltip
                formatter={(value, name) => [formatTooltipValue(Number(value)), name]}
                contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0" }}
              />
              <Bar dataKey="primaryValue" name={chartLabel} fill="#F97316" radius={[8, 8, 0, 0]} />
              {secondaryChartLabel && (
                <Line
                  type="monotone"
                  dataKey="secondaryValue"
                  name={secondaryChartLabel}
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#2563EB" }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function formatAxisValue(value: number) {
  if (value >= 1_000_000) {
    return `${value / 1_000_000}M`;
  }

  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatTooltipValue(value: number) {
  if (value >= 1_000_000) {
    return formatCurrency(value);
  }

  return new Intl.NumberFormat("vi-VN").format(value);
}
