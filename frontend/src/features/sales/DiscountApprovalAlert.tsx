"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "./api";
import type { SalesOrder } from "./types";

interface Props {
  order: SalesOrder;
  onUpdated?: (updated: SalesOrder) => void;
}

/**
 * DiscountApprovalAlert — hiển thị khi đơn hàng đang chờ duyệt giảm giá.
 * Người có quyền APPROVE_DISCOUNT có thể chấp thuận hoặc từ chối.
 */
export function DiscountApprovalAlert({ order, onUpdated }: Props) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"idle" | "approving" | "rejecting">("idle");

  const approveMut = useMutation({
    mutationFn: () => salesApi.approveDiscount(order.id, note),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      onUpdated?.(updated);
      setMode("idle");
      setNote("");
    },
  });

  const rejectMut = useMutation({
    mutationFn: () => salesApi.rejectDiscount(order.id, note),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      onUpdated?.(updated);
      setMode("idle");
      setNote("");
    },
  });

  if (order.discountApprovalStatus !== "PENDING") return null;

  const discountPct = order.subtotal > 0
    ? ((order.discountAmount / order.subtotal) * 100).toFixed(1)
    : "0";

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">
            Đơn hàng đang chờ duyệt giảm giá
          </p>
          <p className="mt-0.5 text-xs text-amber-700">
            Đơn <strong>{order.orderNo}</strong> có mức giảm giá{" "}
            <strong>{discountPct}%</strong> ({new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(order.discountAmount)})
            vượt ngưỡng cho phép. Cần người có quyền <strong>SALES_DISCOUNT_APPROVE</strong> phê duyệt.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      {mode === "idle" && (
        <div className="flex gap-2 pl-11">
          <button
            onClick={() => setMode("approving")}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            Duyệt giảm giá
          </button>
          <button
            onClick={() => setMode("rejecting")}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Từ chối
          </button>
        </div>
      )}

      {/* Approve form */}
      {mode === "approving" && (
        <div className="pl-11 space-y-2">
          <p className="text-xs font-medium text-slate-700">Lý do / ghi chú phê duyệt:</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Khách VIP, đã xác nhận với giám đốc"
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => approveMut.mutate()}
              disabled={approveMut.isPending}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {approveMut.isPending ? "Đang duyệt..." : "Xác nhận duyệt"}
            </button>
            <button onClick={() => setMode("idle")} className="rounded-lg border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Reject form */}
      {mode === "rejecting" && (
        <div className="pl-11 space-y-2">
          <p className="text-xs font-medium text-slate-700">Lý do từ chối (bắt buộc):</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Mức giảm quá cao, đề nghị điều chỉnh xuống ≤5%"
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => rejectMut.mutate()}
              disabled={rejectMut.isPending || !note.trim()}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {rejectMut.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
            <button onClick={() => setMode("idle")} className="rounded-lg border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              Huỷ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
