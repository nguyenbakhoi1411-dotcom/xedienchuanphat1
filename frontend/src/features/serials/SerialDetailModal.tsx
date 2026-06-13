"use client";

import {
  AlertTriangle, ArrowRightLeft, Bike, Calendar, DollarSign, FileText,
  Hash, Shield, User, Wrench, X
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serviceApi } from "@/features/service/api";
import { formatCurrency } from "@/lib/format";
import { serialsApi } from "./api";
import { SerialStatusBadge } from "./SerialStatusBadge";
import { SerialTimeline } from "./SerialTimeline";
import type { ProductSerial, SerialStatus, TransferSerialPayload } from "./types";
import { SERIAL_STATUS_LABELS } from "./types";

interface Props {
  serial: ProductSerial;
  onClose: () => void;
  onUpdated: (updated: ProductSerial) => void;
}

type ActionMode =
  | "idle" | "timeline"
  | "transfer" | "defective" | "warranty" | "repair" | "return_repair";

const VND = (n?: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

export function SerialDetailModal({ serial, onClose, onUpdated }: Props) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<ActionMode>("idle");
  const [transferForm, setTransferForm] = useState<Partial<TransferSerialPayload>>({});
  const [defectReason, setDefectReason] = useState("");
  const [repairTicket, setRepairTicket] = useState("");
  const [returnNote, setReturnNote] = useState("");

  const { data: history = [] } = useQuery({
    queryKey: ["serial-history", serial.id],
    queryFn: () => serialsApi.getHistory(serial.id),
    enabled: mode === "timeline",
  });

  const { data: serviceHistory = [] } = useQuery({
    queryKey: ["serial-service-history", serial.id],
    queryFn: () => serviceApi.historyByVehicle(serial.id),
    enabled: mode === "timeline",
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["serials"] });

  const transferMut = useMutation({
    mutationFn: (payload: TransferSerialPayload) => serialsApi.transfer(serial.id, payload),
    onSuccess: (updated) => { onUpdated(updated); invalidate(); toast.success("Đã chuyển kho"); setMode("idle"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const defectiveMut = useMutation({
    mutationFn: () => serialsApi.markDefective(serial.id, defectReason),
    onSuccess: (updated) => { onUpdated(updated); invalidate(); toast.success("Đã đánh dấu lỗi"); setMode("idle"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const warrantyMut = useMutation({
    mutationFn: () => serialsApi.sendToWarranty(serial.id),
    onSuccess: (updated) => { onUpdated(updated); invalidate(); toast.success("Đã đưa vào bảo hành"); setMode("idle"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const repairMut = useMutation({
    mutationFn: () => serialsApi.sendToRepair(serial.id, repairTicket),
    onSuccess: (updated) => { onUpdated(updated); invalidate(); toast.success("Đã đưa vào sửa chữa"); setMode("idle"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const returnRepairMut = useMutation({
    mutationFn: () => serialsApi.returnFromRepair(serial.id, returnNote),
    onSuccess: (updated) => { onUpdated(updated); invalidate(); toast.success("Đã nhận về từ sửa chữa"); setMode("idle"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSell = !["SOLD", "DEFECTIVE", "DAMAGED", "REPAIRING", "SERVICE", "WARRANTY", "RETURNED_TO_SUPPLIER"].includes(serial.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Serial xe điện</p>
              <h2 className="text-base font-bold text-white font-mono">{serial.serialNumber}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SerialStatusBadge status={serial.status} />
            <button onClick={onClose} className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — Info */}
          <div className="w-1/2 overflow-y-auto border-r border-slate-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Thông tin xe</h3>

            <InfoRow icon={<Bike className="h-4 w-4" />} label="Sản phẩm" value={serial.productName} />
            <InfoRow icon={<Hash className="h-4 w-4" />} label="Số khung" value={serial.frameNumber} mono />
            <InfoRow icon={<Hash className="h-4 w-4" />} label="Số máy" value={serial.engineNumber} mono />
            <InfoRow icon={<Hash className="h-4 w-4" />} label="Số pin" value={serial.batterySerial} mono />
            <InfoRow icon={<Hash className="h-4 w-4" />} label="Số motor" value={serial.motorSerial} mono />
            <InfoRow icon={<Hash className="h-4 w-4" />} label="Số sạc" value={serial.chargerNumber} mono />

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <InfoRow icon={<FileText className="h-4 w-4" />} label="Màu sắc" value={serial.color} />
              <InfoRow icon={<FileText className="h-4 w-4" />} label="Phiên bản" value={serial.version} />
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Ngày nhập" value={serial.importDate} />
              <InfoRow icon={<DollarSign className="h-4 w-4" />} label="Giá vốn" value={VND(serial.purchaseCost)} />
              <InfoRow icon={<User className="h-4 w-4" />} label="Chi nhánh" value={`Chi nhánh #${serial.branchId}`} />
              {serial.warehouseId && <InfoRow icon={<FileText className="h-4 w-4" />} label="Kho" value={`Kho #${serial.warehouseId}`} />}
            </div>

            {serial.currentCustomerId && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Thông tin khách hàng</p>
                <InfoRow icon={<User className="h-4 w-4" />} label="Chủ xe" value={`KH #${serial.currentCustomerId}`} />
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Ngày bán" value={serial.soldDate} />
                <InfoRow icon={<Shield className="h-4 w-4" />} label="Bảo hành" value={serial.warrantyStartDate && serial.warrantyEndDate ? `${serial.warrantyStartDate} → ${serial.warrantyEndDate}` : null} />
              </div>
            )}

            {serial.defectReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-red-700">Lý do lỗi</p>
                <p className="text-xs text-red-600 mt-0.5">{serial.defectReason}</p>
              </div>
            )}

            {serial.note && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-500">Ghi chú</p>
                <p className="text-xs text-slate-600 mt-0.5">{serial.note}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Thao tác</p>
              <div className="flex flex-wrap gap-2">
                <ActionBtn onClick={() => setMode(mode === "timeline" ? "idle" : "timeline")} active={mode === "timeline"}>
                  📋 Lịch sử
                </ActionBtn>
                <ActionBtn onClick={() => setMode("transfer")} disabled={serial.status === "SOLD"}>
                  <ArrowRightLeft className="h-3.5 w-3.5" /> Chuyển kho
                </ActionBtn>
                {canSell && serial.status !== "DEFECTIVE" && serial.status !== "DAMAGED" && (
                  <ActionBtn onClick={() => setMode("defective")} danger>
                    <AlertTriangle className="h-3.5 w-3.5" /> Đánh dấu lỗi
                  </ActionBtn>
                )}
                {["IN_STOCK", "SOLD", "RESERVED"].includes(serial.status) && (
                  <ActionBtn onClick={() => warrantyMut.mutate()} loading={warrantyMut.isPending}>
                    <Shield className="h-3.5 w-3.5" /> Bảo hành
                  </ActionBtn>
                )}
                {["IN_STOCK", "DEFECTIVE", "DAMAGED", "WARRANTY"].includes(serial.status) && (
                  <ActionBtn onClick={() => setMode("repair")}>
                    <Wrench className="h-3.5 w-3.5" /> Sửa chữa
                  </ActionBtn>
                )}
                {["REPAIRING", "SERVICE"].includes(serial.status) && (
                  <ActionBtn onClick={() => setMode("return_repair")}>
                    <Wrench className="h-3.5 w-3.5" /> Trả sau sửa
                  </ActionBtn>
                )}
              </div>
            </div>
          </div>

          {/* Right — Actions / Timeline */}
          <div className="w-1/2 overflow-y-auto p-5">
            {mode === "idle" && (
              <div className="flex h-full items-center justify-center text-slate-300 text-sm">
                Chọn thao tác bên trái hoặc xem lịch sử
              </div>
            )}

            {mode === "timeline" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Lịch sử thay đổi</h3>
                <SerialTimeline entries={history} />
                <h3 className="pt-3 text-sm font-semibold text-slate-700">Bao hanh / sua chua</h3>
                <div className="space-y-2">
                  {serviceHistory.map((ticket) => {
                    const repeat = serviceHistory.filter((item) => item.issueDescription === ticket.issueDescription).length > 1;
                    return (
                      <div key={ticket.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-800">{ticket.ticketNo}</p>
                          {repeat && <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">Lap lai</span>}
                        </div>
                        <p className="mt-1 text-slate-600">{ticket.issueDescription}</p>
                        <p className="mt-1 text-slate-500">KTV: {ticket.technicianUsername ?? "-"} | Chi phi: {formatCurrency(ticket.totalCost)}</p>
                        {ticket.items.length > 0 && (
                          <p className="mt-1 text-slate-500">Phu tung: {ticket.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === "transfer" && (
              <ActionPanel title="Chuyển kho / chi nhánh" icon={<ArrowRightLeft className="h-4 w-4" />}>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 font-medium">Chi nhánh đích *</span>
                  <input
                    type="number"
                    value={transferForm.toBranchId ?? ""}
                    onChange={(e) => setTransferForm((f) => ({ ...f, toBranchId: Number(e.target.value) }))}
                    className="erp-input"
                    placeholder="ID chi nhánh"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 font-medium">Kho đích (tùy chọn)</span>
                  <input
                    type="number"
                    value={transferForm.toWarehouseId ?? ""}
                    onChange={(e) => setTransferForm((f) => ({ ...f, toWarehouseId: e.target.value ? Number(e.target.value) : undefined }))}
                    className="erp-input"
                    placeholder="ID kho"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 font-medium">Lý do</span>
                  <input
                    value={transferForm.reason ?? ""}
                    onChange={(e) => setTransferForm((f) => ({ ...f, reason: e.target.value }))}
                    className="erp-input"
                    placeholder="Lý do chuyển kho"
                  />
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (!transferForm.toBranchId) { toast.error("Chọn chi nhánh đích"); return; }
                      transferMut.mutate(transferForm as TransferSerialPayload);
                    }}
                    disabled={transferMut.isPending}
                    className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {transferMut.isPending ? "Đang chuyển..." : "Xác nhận chuyển kho"}
                  </button>
                  <button onClick={() => setMode("idle")} className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
                </div>
              </ActionPanel>
            )}

            {mode === "defective" && (
              <ActionPanel title="Đánh dấu xe lỗi" icon={<AlertTriangle className="h-4 w-4" />} danger>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 font-medium">Lý do lỗi</span>
                  <textarea
                    value={defectReason}
                    onChange={(e) => setDefectReason(e.target.value)}
                    className="erp-input min-h-24 py-2 resize-none"
                    placeholder="Mô tả lỗi của xe..."
                  />
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => defectiveMut.mutate()}
                    disabled={defectiveMut.isPending}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {defectiveMut.isPending ? "Đang xử lý..." : "Xác nhận lỗi"}
                  </button>
                  <button onClick={() => setMode("idle")} className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
                </div>
              </ActionPanel>
            )}

            {mode === "repair" && (
              <ActionPanel title="Gửi xe sửa chữa" icon={<Wrench className="h-4 w-4" />}>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 font-medium">Mã phiếu sửa chữa</span>
                  <input
                    value={repairTicket}
                    onChange={(e) => setRepairTicket(e.target.value)}
                    className="erp-input"
                    placeholder="VD: SC-2024-001"
                  />
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => repairMut.mutate()}
                    disabled={repairMut.isPending}
                    className="flex-1 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {repairMut.isPending ? "Đang xử lý..." : "Gửi sửa chữa"}
                  </button>
                  <button onClick={() => setMode("idle")} className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
                </div>
              </ActionPanel>
            )}

            {mode === "return_repair" && (
              <ActionPanel title="Nhận về sau sửa chữa" icon={<Wrench className="h-4 w-4" />}>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-slate-600 font-medium">Ghi chú kết quả</span>
                  <textarea
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    className="erp-input min-h-20 py-2 resize-none"
                    placeholder="VD: Đã thay pin, xe chạy bình thường..."
                  />
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => returnRepairMut.mutate()}
                    disabled={returnRepairMut.isPending}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {returnRepairMut.isPending ? "Đang xử lý..." : "Nhận về kho"}
                  </button>
                  <button onClick={() => setMode("idle")} className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
                </div>
              </ActionPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function ActionPanel({ title, icon, children, danger }: { title: string; icon: React.ReactNode; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-xl border ${danger ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-slate-50/60"} p-4 space-y-3`}>
      <div className={`flex items-center gap-2 ${danger ? "text-red-700" : "text-slate-700"}`}>
        {icon}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {children}
    </div>
  );
}

function ActionBtn({
  children, onClick, disabled, loading, active, danger
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; active?: boolean; danger?: boolean;
}) {
  const base = "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40";
  const variant = danger
    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
    : active
    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
  return (
    <button className={`${base} ${variant}`} onClick={onClick} disabled={disabled || loading}>
      {loading ? "..." : children}
    </button>
  );
}
