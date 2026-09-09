"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Truck, Plus, RefreshCw, Search, Filter,
  Package, Building2, Wallet, RotateCcw,
  ClipboardList, ChevronDown, ArrowUpRight
} from "lucide-react";
import {
  useSuppliers,
  usePurchaseOrders,
  usePayables,
  usePurchaseReturns,
  useCreateSupplier,
  useUpdateSupplier,
  useDeactivateSupplier,
  useCreatePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useCancelPurchaseOrder,
  usePayable,
  usePayPayable,
  useAPAgingReport,
  useOverduePayments,
  usePayPurchaseOrder,
  useActivateSupplier,
} from "@/features/purchasing/hooks";
import type {
  PurchaseOrderStatus,
  PayableStatus,
  Supplier,
  PurchaseOrder,
} from "@/features/purchasing/types";
import {
  PO_STATUS_LABELS,
  PO_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYABLE_STATUS_LABELS,
  PAYABLE_STATUS_COLORS,
} from "@/features/purchasing/types";
import { cn } from "@/lib/cn";
import { SupplierModal } from "@/components/purchase/SupplierModal";
import { OverdueAlert } from "@/components/purchase/OverdueAlert";

// Format VND currency
const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " ₫";

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "—";

const isOverdue = (dateStr?: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

// ── TAB TYPES ────────────────────────────────────────────────────────────────
type Tab = "suppliers" | "orders" | "receipts" | "payables" | "returns";

// ── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", className)}>
      {children}
    </span>
  );
}

// ── SUPPLIERS TAB ─────────────────────────────────────────────────────────────
function SuppliersTab() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [showInactive, setShowInactive] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useSuppliers(keyword, page, 20);
  const deactivate = useDeactivateSupplier();
  const activate = useActivateSupplier();

  const suppliers = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Modal */}
      <SupplierModal
        isOpen={showCreateModal || !!editingSupplier}
        supplier={editingSupplier}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSupplier(null);
        }}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0); }}
            placeholder="Tìm theo tên, mã, MST..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              showInactive ? "border-slate-300 bg-slate-100 text-slate-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            {showInactive ? "Ẩn đã ngưng" : "Xem đã ngưng"}
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm NCC
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Mã / Tên NCC</th>
                <th className="px-4 py-3 text-left">MST</th>
                <th className="px-4 py-3 text-left">Điện thoại</th>
                <th className="px-4 py-3 text-left">Tỉnh/TP</th>
                <th className="px-4 py-3 text-right">Công nợ hiện tại</th>
                <th className="px-4 py-3 text-center">Hạn TT (ngày)</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Chưa có nhà cung cấp nào</td></tr>
              ) : suppliers.map(s => (
                <tr key={s.id} className={cn(
                  "hover:bg-slate-50 transition-colors",
                  s.status === "INACTIVE" && "opacity-60"
                )}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.code}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.taxCode || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.tinhThanh || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("font-medium tabular-nums", s.currentDebt > 0 ? "text-red-600" : "text-slate-600")}>
                      {fmtVND(s.currentDebt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{s.paymentTermsDays}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge className={s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
                      {s.status === "ACTIVE" ? "Hoạt động" : "Ngưng"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => setEditingSupplier(s)}
                        className="rounded p-1 hover:bg-blue-50 text-blue-600 transition-colors text-xs"
                        title="Sửa"
                      >✏️</button>
                      {s.status === "ACTIVE" ? (
                        <button
                          onClick={() => deactivate.mutate(s.id)}
                          className="rounded p-1 hover:bg-red-50 text-red-500 transition-colors text-xs"
                          title="Ngưng"
                        >🚫</button>
                      ) : (
                        <button
                          onClick={() => activate.mutate(s.id)}
                          className="rounded p-1 hover:bg-emerald-50 text-emerald-600 transition-colors text-xs"
                          title="Kích hoạt"
                        >✅</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              {data.totalItems} nhà cung cấp · Trang {page + 1}/{data.totalPages}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="rounded px-2 py-1 text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-50">◀</button>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="rounded px-2 py-1 text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-50">▶</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PURCHASE ORDERS TAB ───────────────────────────────────────────────────────
function PurchaseOrdersTab() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | undefined>();
  const [page, setPage] = useState(0);
  const [payingPo, setPayingPo] = useState<PurchaseOrder | null>(null);
  const [payAmount, setPayAmount] = useState("");

  const { data, isLoading, refetch } = usePurchaseOrders({ status: statusFilter, page, size: 20 });
  const submit = useSubmitPurchaseOrder();
  const approve = useApprovePurchaseOrder();
  const cancel = useCancelPurchaseOrder();
  const pay = usePayPurchaseOrder();

  const orders = data?.items || [];

  const statusOptions: Array<{ value: PurchaseOrderStatus | undefined; label: string }> = [
    { value: undefined, label: "Tất cả" },
    { value: "DRAFT", label: "Nháp" },
    { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "PARTIALLY_RECEIVED", label: "Nhập 1 phần" },
    { value: "RECEIVED", label: "Đã nhập đủ" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => { setStatusFilter(opt.value); setPage(0); }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                statusFilter === opt.value
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >{opt.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50 transition-colors">
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </button>
          <button
            onClick={() => router.push("/purchasing/new")}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tạo đơn mua
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left">Ngày đặt</th>
                <th className="px-4 py-3 text-left">Hạn TT</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-right">Còn lại</th>
                <th className="px-4 py-3 text-center">TT đơn hàng</th>
                <th className="px-4 py-3 text-center">TT thanh toán</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Chưa có đơn mua hàng</td></tr>
              ) : orders.map(po => {
                const hanTTOverdue = isOverdue(po.hanThanhToan) && po.trangThaiThanhToan !== "PAID";
                return (
                  <tr key={po.id} className={cn(
                    "transition-colors hover:bg-slate-50",
                    hanTTOverdue && "bg-red-50/40"
                  )}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/purchasing/${po.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {po.purchaseOrderNo}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{po.supplierName}</div>
                      {po.supplierPhone && <div className="text-xs text-slate-500">{po.supplierPhone}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(po.purchaseDate)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm", hanTTOverdue ? "font-semibold text-red-600" : "text-slate-600")}>
                        {po.hanThanhToan ? fmtDate(po.hanThanhToan) : "—"}
                        {hanTTOverdue && " ⚠️"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800 tabular-nums">
                      {fmtVND(po.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={cn(po.conLaiPhaiTra > 0 ? "text-red-600 font-medium" : "text-emerald-600")}>
                        {fmtVND(po.conLaiPhaiTra || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge className={PO_STATUS_COLORS[po.status]}>
                        {PO_STATUS_LABELS[po.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {po.trangThaiThanhToan ? (
                        <StatusBadge className={PAYMENT_STATUS_COLORS[po.trangThaiThanhToan]}>
                          {PAYMENT_STATUS_LABELS[po.trangThaiThanhToan]}
                        </StatusBadge>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => router.push(`/purchasing/${po.id}`)}
                          className="rounded p-1 hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Xem chi tiết"
                        ><ArrowUpRight className="h-3.5 w-3.5" /></button>
                        {po.status === "DRAFT" && (
                          <button
                            onClick={() => submit.mutate(po.id)}
                            className="rounded px-2 py-0.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                            title="Gửi duyệt"
                          >Gửi duyệt</button>
                        )}
                        {po.status === "PENDING_APPROVAL" && (
                          <button
                            onClick={() => approve.mutate(po.id)}
                            className="rounded px-2 py-0.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >Duyệt</button>
                        )}
                        {(po.status === "APPROVED" || po.status === "PARTIALLY_RECEIVED" || po.status === "RECEIVED") && po.conLaiPhaiTra > 0 && (
                          <button
                            onClick={() => { setPayingPo(po); setPayAmount(String(Math.round(po.conLaiPhaiTra))); }}
                            className="rounded px-2 py-0.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >TT NCC</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">{data.totalItems} đơn · Trang {page + 1}/{data.totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded px-2 py-1 text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-50">◀</button>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="rounded px-2 py-1 text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-50">▶</button>
            </div>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {payingPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Thanh toán nhà cung cấp</h3>
            <p className="text-sm text-slate-500 mb-4">Đơn hàng: <strong>{payingPo.purchaseOrderNo}</strong></p>
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tổng đơn:</span>
                  <span className="font-medium">{fmtVND(payingPo.totalAmount)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-600">Đã thanh toán:</span>
                  <span className="font-medium text-emerald-600">{fmtVND(payingPo.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Còn lại:</span>
                  <span className="font-bold text-red-600">{fmtVND(payingPo.conLaiPhaiTra || 0)}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Số tiền thanh toán (₫)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Nhập số tiền..."
                />
              </div>
              <div className="mt-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                <strong>Bút toán:</strong> Nợ TK 331 (NCC) / Có TK 1111 (Tiền mặt) hoặc TK 1121 (Ngân hàng)
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPayingPo(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >Hủy</button>
              <button
                onClick={() => {
                  const amount = parseFloat(payAmount);
                  if (!isNaN(amount) && amount > 0) {
                    pay.mutate({ id: payingPo.id, amount }, {
                      onSuccess: () => setPayingPo(null),
                    });
                  }
                }}
                disabled={pay.isPending}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {pay.isPending ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GOODS RECEIPTS TAB ────────────────────────────────────────────────────────
function GoodsReceiptsTab() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
      <h3 className="text-base font-semibold text-slate-700">Phiếu nhập kho</h3>
      <p className="mt-1 text-sm text-slate-500">
        Phiếu nhập kho được tạo từ trang chi tiết Đơn mua hàng sau khi đơn được duyệt.
      </p>
      <button
        onClick={() => {}}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <ArrowUpRight className="h-4 w-4" />
        Xem tất cả phiếu nhập kho (Kho)
      </button>
    </div>
  );
}

// ── PAYABLES TAB ─────────────────────────────────────────────────────────────
function PayablesTab() {
  const [statusFilter, setStatusFilter] = useState<PayableStatus | undefined>();
  const [page, setPage] = useState(0);

  const { data, isLoading } = usePayables({ status: statusFilter, page, size: 20 });
  const { data: agingData } = useAPAgingReport();

  const payables = data?.items || [];
  const aging = agingData || [];

  const totalByBucket = {
    current: aging.reduce((s, r) => s + r.current, 0),
    d1_30: aging.reduce((s, r) => s + r.days1_30, 0),
    d31_60: aging.reduce((s, r) => s + r.days31_60, 0),
    d61_90: aging.reduce((s, r) => s + r.days61_90, 0),
    over90: aging.reduce((s, r) => s + r.over90, 0),
    total: aging.reduce((s, r) => s + r.total, 0),
  };

  return (
    <div className="space-y-4">
      {/* Aging Summary Cards */}
      {aging.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Chưa đến hạn", value: totalByBucket.current, color: "text-slate-700" },
            { label: "1–30 ngày", value: totalByBucket.d1_30, color: "text-amber-600" },
            { label: "31–60 ngày", value: totalByBucket.d31_60, color: "text-orange-600" },
            { label: "61–90 ngày", value: totalByBucket.d61_90, color: "text-red-500" },
            { label: ">90 ngày", value: totalByBucket.over90, color: "text-red-700 font-bold" },
          ].map(b => (
            <div key={b.label} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500 mb-1">{b.label}</div>
              <div className={cn("text-sm font-semibold tabular-nums", b.color)}>
                {fmtVND(b.value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter + Table */}
      <div className="flex gap-1.5 flex-wrap">
        {(["OPEN", "PARTIAL", "PAID", "OVERDUE"] as PayableStatus[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? undefined : s)}
            className={cn("rounded-full px-3 py-1 text-xs border font-medium transition-colors",
              statusFilter === s ? "border-blue-500 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}>
            {PAYABLE_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Mã công nợ</th>
                <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left">Ngày phát sinh</th>
                <th className="px-4 py-3 text-left">Đến hạn</th>
                <th className="px-4 py-3 text-right">Nguyên gốc</th>
                <th className="px-4 py-3 text-right">Còn lại</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Đang tải...</td></tr>
              ) : payables.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Không có công nợ phải trả</td></tr>
              ) : payables.map(p => (
                <tr key={p.id} className={cn("hover:bg-slate-50 transition-colors", p.daysOverdue > 0 && "bg-red-50/30")}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.payableCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.supplierName}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(p.invoiceDate)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm", p.daysOverdue > 0 ? "text-red-600 font-semibold" : "text-slate-600")}>
                      {p.dueDate ? fmtDate(p.dueDate) : "—"}
                      {p.daysOverdue > 0 && ` (quá ${p.daysOverdue} ngày)`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{fmtVND(p.originalAmount)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={p.remainingAmount > 0 ? "text-red-600 font-medium" : "text-emerald-600"}>
                      {fmtVND(p.remainingAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge className={PAYABLE_STATUS_COLORS[p.status]}>
                      {PAYABLE_STATUS_LABELS[p.status]}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── PURCHASE RETURNS TAB ──────────────────────────────────────────────────────
function PurchaseReturnsTab() {
  const { data, isLoading } = usePurchaseReturns();
  const returns = data?.items || [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Mã phiếu</th>
              <th className="px-4 py-3 text-left">Nhà cung cấp</th>
              <th className="px-4 py-3 text-left">Ngày trả</th>
              <th className="px-4 py-3 text-right">Tổng tiền</th>
              <th className="px-4 py-3 text-center">Phương thức hoàn</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Đang tải...</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chưa có phiếu trả hàng nào</td></tr>
            ) : returns.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-700">{r.returnCode}</td>
                <td className="px-4 py-3 text-slate-700">NCC #{r.supplierId}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(r.returnDate)}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{fmtVND(r.totalAmount)}</td>
                <td className="px-4 py-3 text-center text-xs text-slate-600">
                  {r.refundMethod === "CASH_REFUND" ? "💵 Tiền mặt" : "📉 Trừ công nợ"}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge className={
                    r.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                    r.status === "CANCELLED" ? "bg-slate-100 text-slate-500" :
                    "bg-amber-100 text-amber-700"
                  }>
                    {r.status === "COMPLETED" ? "Hoàn tất" : r.status === "CANCELLED" ? "Đã hủy" : "Nháp"}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const TABS: Array<{ key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "suppliers", label: "Nhà cung cấp", icon: Building2 },
  { key: "orders", label: "Đơn mua hàng", icon: Truck },
  { key: "receipts", label: "Nhập kho", icon: Package },
  { key: "payables", label: "Công nợ phải trả", icon: Wallet },
  { key: "returns", label: "Trả hàng NCC", icon: RotateCcw },
];

export default function PurchasingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mua hàng</h1>
                <p className="text-xs text-slate-500">Quản lý nhà cung cấp, đơn mua, nhập kho, công nợ phải trả</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        <OverdueAlert />

        {/* Tabs */}
        <div className="mb-5 border-b border-slate-200">
          <nav className="-mb-px flex gap-0 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "suppliers" && <SuppliersTab />}
          {activeTab === "orders" && <PurchaseOrdersTab />}
          {activeTab === "receipts" && <GoodsReceiptsTab />}
          {activeTab === "payables" && <PayablesTab />}
          {activeTab === "returns" && <PurchaseReturnsTab />}
        </div>
      </div>
    </div>
  );
}
