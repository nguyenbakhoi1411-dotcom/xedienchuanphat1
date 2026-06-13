"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { CashFlowPoint } from "./types";

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <h2 className="text-base font-semibold text-text">Bieu do dong tien</h2>
      <p className="mt-1 text-sm text-slate-500">Tien vao va tien ra theo thang.</p>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${Number(value) / 1_000_000}M`} width={54} tick={{ fill: "#64748B", fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0" }} />
            <Bar dataKey="cashIn" name="Tien vao" fill="#F97316" radius={[6, 6, 0, 0]} />
            <Bar dataKey="cashOut" name="Tien ra" fill="#64748B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
