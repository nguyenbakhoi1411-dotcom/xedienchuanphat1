"use client";

import { AlertCircle, CheckCircle2, Clock, Plus, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "./api";
import type { CreateDepositPayload, Deposit } from "./types";

const VND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE: { label: "Đang hiệu lực", color: "bg-emerald-100 text-emerald-700", icon: <Clock className="h-3.5 w-3.5" /> },
  CONVERTED: { label: "Đã chuyển đơn", color: "bg-blue-100 text-blue-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REFUNDED: { label: "Đã hoàn cọc", color: "bg-purple-100 text-purple-700", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  FORFEITED: { label: "Mất cọc", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3.5 w-3.5" /> },
  EXPIRED: { label: "Hết hạn", color: "bg-slate-100 text-slate-500", icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

interface Props {
  branchId?: number;
  customerId?: number;
}

export function DepositPanel({ branchId, customerId }: Props) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<CreateDepositPayload>>({ paymentMethod: "CASH" });
  const [confirmRefund, setConfirmRefund] = useState<number | null>(null);

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: customerId ? ["deposits-customer", customerId] : ["deposits", branchId],
    queryFn: () =>
      customerId ? salesApi.depositsByCustomer(customerId) : salesApi.listDeposits(branchId),
  });

  const createMut = useMutation({
    mutationFn: (payload: CreateDepositPayload) => salesApi.createDeposit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["deposits-customer"] });
      setShowForm(false);
      setForm({ paymentMethod: "CASH" });
    },
  });

  const refundMut = useMutation({
    mutationFn: (id: number) => salesApi.refundDeposit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["deposits-customer"] });
      setConfirmRefund(null);
    },
  });

  const activeCount = deposits.filter((d) => d.status === "ACTIVE").length;
  const totalActive = deposits.filter((d) => d.status === "ACTIVE").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Tổng phiếu cọc" value={String(deposits.length)} />
        <StatCard label="Đang hiệu lực" value={String(activeCount)} accent="emerald" />
        <StatCard label="Tổng tiền đang cọc" value={VND(totalActive)} accent="blue" />
        <StatCard label="Đã chuyển đơn" value={String(deposits.filter((d) => d.status === "CONVERTED").length)} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Danh sách đặt cọc</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo phiếu cọc
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-indigo-700">Phiếu đặt cọc mới</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Khách hàng ID *</span>
              <input
                type="number"
                value={form.customerId ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, customerId: Number(e.target.value) }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="ID khách"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Số tiền cọc *</span>
              <input
                type="number"
                value={form.amount ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="VD: 5000000"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Phương thức</span>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as "CASH" | "BANK_TRANSFER" | "MOMO" }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="CASH">Tiền mặt</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="MOMO">MoMo</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Serial xe (tuỳ chọn)</span>
              <input
                type="number"
                value={form.serialId ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, serialId: e.target.value ? Number(e.target.value) : undefined }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="ID serial"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Hạn cọc</span>
              <input
                type="date"
                value={form.expiredAt ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, expiredAt: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
            <label className="col-span-full flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Ghi chú</span>
              <input
                type="text"
                value={form.note ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="VD: Đặt cọc xe CP S1 màu đỏ"
              />
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                if (!form.customerId || !form.amount) return;
                createMut.mutate({
                  customerId: form.customerId,
                  branchId: branchId ?? 1,
                  amount: form.amount,
                  serialId: form.serialId,
                  expiredAt: form.expiredAt,
                  paymentMethod: form.paymentMethod ?? "CASH",
                  note: form.note,
                });
              }}
              disabled={createMut.isPending || !form.customerId || !form.amount}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              {createMut.isPending ? "Đang lưu..." : "Tạo phiếu cọc"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse h-32 rounded-xl bg-slate-100" />
      ) : deposits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-400 text-sm">
          Chưa có phiếu đặt cọc nào
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Mã cọc</th>
                <th className="px-4 py-3">Khách</th>
                <th className="px-4 py-3">Ngày cọc</th>
                <th className="px-4 py-3">Hạn</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {deposits.map((deposit) => {
                const cfg = STATUS_CONFIG[deposit.status] ?? STATUS_CONFIG["ACTIVE"];
                const isExpired = deposit.expiredAt && new Date(deposit.expiredAt) < new Date();
                return (
                  <tr key={deposit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-indigo-700">{deposit.depositCode}</td>
                    <td className="px-4 py-3 text-slate-700">KH #{deposit.customerId}</td>
                    <td className="px-4 py-3 text-slate-500">{deposit.depositDate}</td>
                    <td className="px-4 py-3">
                      {deposit.expiredAt ? (
                        <span className={isExpired ? "text-red-500 font-medium" : "text-slate-500"}>
                          {deposit.expiredAt}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{VND(deposit.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {deposit.status === "ACTIVE" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setConfirmRefund(deposit.id)}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Hoàn cọc
                          </button>
                        </div>
                      )}
                      {deposit.status === "CONVERTED" && deposit.convertedToOrderId && (
                        <span className="text-xs text-blue-600">→ ĐH #{deposit.convertedToOrderId}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm refund dialog */}
      {confirmRefund !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-6 shadow-2xl w-full max-w-sm">
            <p className="text-base font-semibold text-slate-800 mb-2">Xác nhận hoàn cọc</p>
            <p className="text-sm text-slate-500 mb-5">
              Phiếu cọc #{confirmRefund} sẽ được chuyển sang trạng thái <strong>REFUNDED</strong>.
              Hệ thống sẽ tạo phiếu chi hoàn tiền cho khách.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => refundMut.mutate(confirmRefund)}
                disabled={refundMut.isPending}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {refundMut.isPending ? "Đang xử lý..." : "Xác nhận hoàn cọc"}
              </button>
              <button
                onClick={() => setConfirmRefund(null)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "emerald" | "blue" }) {
  const colorMap = { emerald: "text-emerald-700 bg-emerald-50", blue: "text-blue-700 bg-blue-50" };
  const cls = accent ? colorMap[accent] : "text-slate-700 bg-white";
  return (
    <div className={`rounded-xl border border-border p-4 shadow-soft ${cls}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
