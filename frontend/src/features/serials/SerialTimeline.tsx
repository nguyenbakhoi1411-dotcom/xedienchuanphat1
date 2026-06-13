"use client";

import { CheckCircle2, GitMerge, PackageCheck, PackageX, RefreshCw, Shield, Truck, Wrench } from "lucide-react";
import type { SerialHistoryEntry, SerialStatus } from "./types";
import { SerialStatusBadge } from "./SerialStatusBadge";

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  IMPORTED: { icon: <PackageCheck className="h-4 w-4" />, label: "Nhập kho", color: "bg-emerald-100 text-emerald-700" },
  RESERVED: { icon: <Shield className="h-4 w-4" />, label: "Đặt cọc / giữ xe", color: "bg-amber-100 text-amber-700" },
  UNRESERVED: { icon: <RefreshCw className="h-4 w-4" />, label: "Huỷ giữ xe", color: "bg-slate-100 text-slate-600" },
  SOLD: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Bán hàng", color: "bg-blue-100 text-blue-700" },
  RETURNED: { icon: <PackageX className="h-4 w-4" />, label: "Hoàn trả", color: "bg-rose-100 text-rose-700" },
  TRANSFERRED: { icon: <Truck className="h-4 w-4" />, label: "Chuyển kho", color: "bg-indigo-100 text-indigo-700" },
  RECEIVED: { icon: <PackageCheck className="h-4 w-4" />, label: "Nhận kho", color: "bg-indigo-100 text-indigo-700" },
  DEFECTIVE: { icon: <PackageX className="h-4 w-4" />, label: "Đánh dấu lỗi", color: "bg-red-100 text-red-700" },
  WARRANTY_ACTIVATED: { icon: <Shield className="h-4 w-4" />, label: "Kích hoạt bảo hành", color: "bg-purple-100 text-purple-700" },
  SENT_TO_REPAIR: { icon: <Wrench className="h-4 w-4" />, label: "Gửi sửa chữa", color: "bg-orange-100 text-orange-700" },
  REPAIRED: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Sửa xong", color: "bg-emerald-100 text-emerald-700" },
  STATUS_UPDATED: { icon: <GitMerge className="h-4 w-4" />, label: "Cập nhật trạng thái", color: "bg-slate-100 text-slate-600" },
};

interface Props {
  entries: SerialHistoryEntry[];
}

export function SerialTimeline({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        Chưa có lịch sử thay đổi
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-200" />

      {entries.map((entry, index) => {
        const cfg = ACTION_CONFIG[entry.action] ?? {
          icon: <GitMerge className="h-4 w-4" />,
          label: entry.action,
          color: "bg-slate-100 text-slate-600",
        };
        const isFirst = index === 0;
        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Icon dot */}
            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${cfg.color}`}>
              {cfg.icon}
            </div>

            {/* Content */}
            <div className={`flex-1 rounded-xl border border-border bg-white p-3 shadow-soft ${isFirst ? "ring-2 ring-indigo-200" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
                  {entry.sourceDocumentType && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {entry.sourceDocumentType}
                      {entry.sourceDocumentId && ` #${entry.sourceDocumentId}`}
                    </p>
                  )}
                </div>
                <time className="shrink-0 text-xs text-slate-400">
                  {new Date(entry.createdAt).toLocaleString("vi-VN")}
                </time>
              </div>

              {/* Status transition */}
              {entry.oldStatus && entry.newStatus && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <SerialStatusBadge status={entry.oldStatus as SerialStatus} />
                  <span className="text-slate-400">→</span>
                  <SerialStatusBadge status={entry.newStatus as SerialStatus} />
                </div>
              )}

              {/* Transfer info */}
              {(entry.branchFromId || entry.branchToId) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Truck className="h-3.5 w-3.5" />
                  <span>
                    Chi nhánh #{entry.branchFromId} → Chi nhánh #{entry.branchToId}
                    {entry.warehouseFromId && ` (Kho #${entry.warehouseFromId}`}
                    {entry.warehouseToId && ` → Kho #${entry.warehouseToId})`}
                  </span>
                </div>
              )}

              {/* Note */}
              {entry.note && (
                <p className="mt-2 text-xs text-slate-500 italic">{entry.note}</p>
              )}

              <p className="mt-1.5 text-xs text-slate-400">bởi {entry.createdBy}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
