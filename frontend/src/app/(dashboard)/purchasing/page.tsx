"use client";

import {
  AlertTriangle,
  ArrowDownToLine,
  BadgeDollarSign,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  payableApi,
  purchaseOrderApi,
  purchaseReturnApi,
  supplierApi,
  supplierGroupApi,
} from "@/features/purchasing/api";
import type {
  AgingBucket,
  Payable,
  PayableStatus,
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseReturn,
  Supplier,
  SupplierGroup,
} from "@/features/purchasing/types";
import {
  PAYABLE_STATUS_COLORS,
  PAYABLE_STATUS_LABELS,
  PO_STATUS_COLORS,
  PO_STATUS_LABELS,
} from "@/features/purchasing/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number | undefined | null) =>
  n == null ? "—" : new Intl.NumberFormat("vi-VN").format(n);
const fmtM = (n: number | undefined | null) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
const fmtD = (d: string | undefined | null) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : "—";

type Tab = "suppliers" | "orders" | "payables" | "aging" | "returns";

// ─── Components ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string;
  icon: React.FC<{ className?: string }>; color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-full opacity-10 ${color}`} style={{ transform: "translate(30%,-30%)" }} />
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} bg-opacity-20`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-300">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function Badge({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border-b border-slate-100 px-4 py-3 text-slate-700 ${className}`}>{children}</td>;
}
function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return <tr><td colSpan={cols} className="py-16 text-center text-slate-400">{text}</td></tr>;
}
function Pagination({ page, total, onPageChange }: { page: number; total: number; onPageChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>Trang {page + 1}/{total}</span>
      <div className="flex gap-1">
        <button disabled={page === 0} onClick={() => onPageChange(page - 1)} className="rounded-lg border px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
        <button disabled={page >= total - 1} onClick={() => onPageChange(page + 1)} className="rounded-lg border px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ─── SUPPLIERS TAB ────────────────────────────────────────────────────────────
function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [groups, setGroups] = useState<SupplierGroup[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async (p: number, kw: string) => {
    setLoading(true);
    try {
      const res = await supplierApi.list(kw || undefined, p, 15);
      setSuppliers(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void supplierGroupApi.list().then(setGroups); }, []);
  useEffect(() => { void load(0, search); setPage(0); }, [load, search]);

  const totalDebt = suppliers.reduce((s, x) => s + x.currentDebt, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
          <div className="text-xs text-indigo-500 font-medium">Tổng NCC</div>
          <div className="text-xl font-bold text-indigo-700">{fmt(suppliers.length)}</div>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-3">
          <div className="text-xs text-red-500 font-medium">Tổng công nợ</div>
          <div className="text-base font-bold text-red-700">{fmtM(totalDebt)}</div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <div className="text-xs text-emerald-500 font-medium">Nhóm NCC</div>
          <div className="text-xl font-bold text-emerald-700">{groups.length}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm nhà cung cấp..."
            className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button onClick={() => load(page, search)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>
              <Th>Mã / Tên NCC</Th><Th>Nhóm</Th><Th>Liên hệ</Th>
              <Th>Hạn mức (ngày)</Th><Th>Công nợ HT</Th><Th>Hạn mức nợ</Th>
              <Th>Đánh giá</Th><Th>Trạng thái</Th>
            </tr></thead>
            <tbody>
              {loading ? <EmptyRow cols={8} text="Đang tải..." />
                : suppliers.length === 0 ? <EmptyRow cols={8} text="Không có nhà cung cấp" />
                : suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <Td>
                      <div className="font-semibold text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{s.code} {s.taxCode ? `• MST: ${s.taxCode}` : ""}</div>
                    </Td>
                    <Td><span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{s.groupName ?? "—"}</span></Td>
                    <Td>
                      <div className="text-sm">{s.contactPerson ?? "—"}</div>
                      <div className="text-xs text-slate-400">{s.phone ?? ""} {s.email ? `• ${s.email}` : ""}</div>
                    </Td>
                    <Td className="text-center">{s.paymentTermsDays} ngày</Td>
                    <Td className="font-mono">
                      <span className={s.currentDebt > 0 ? "font-bold text-red-600" : "text-slate-400"}>{fmtM(s.currentDebt)}</span>
                    </Td>
                    <Td className="font-mono text-slate-500">{s.creditLimit > 0 ? fmtM(s.creditLimit) : "Không giới hạn"}</Td>
                    <Td>
                      {s.rating ? (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < s.rating! ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                          ))}
                        </div>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </Td>
                    <Td>
                      <Badge label={s.status === "ACTIVE" ? "Hoạt động" : "Ngưng"} className={s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"} />
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p, search); }} />
      </div>
    </div>
  );
}

// ─── PURCHASE ORDERS TAB ──────────────────────────────────────────────────────
function PurchaseOrdersTab() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "">("");
  const [acting, setActing] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await purchaseOrderApi.list({ status: statusFilter || undefined, page: p, size: 15 });
      setOrders(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { void load(0); setPage(0); }, [load]);

  const doAction = async (id: number, action: () => Promise<PurchaseOrder>) => {
    setActing(id);
    try { await action(); await load(page); } finally { setActing(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PurchaseOrderStatus | "")}
          className="rounded-xl border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
          <option value="">Tất cả trạng thái</option>
          {(Object.entries(PO_STATUS_LABELS) as [PurchaseOrderStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>
              <Th>Số PO</Th><Th>Nhà cung cấp</Th><Th>Ngày đặt</Th>
              <Th>Giao hàng dự kiến</Th><Th>Tổng tiền</Th>
              <Th>Trạng thái</Th><Th>Thao tác</Th>
            </tr></thead>
            <tbody>
              {loading ? <EmptyRow cols={7} text="Đang tải..." />
                : orders.length === 0 ? <EmptyRow cols={7} text="Chưa có đơn mua hàng" />
                : orders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <Td>
                      <div className="font-mono font-semibold text-indigo-600">{po.purchaseOrderNo}</div>
                      <div className="text-xs text-slate-400">{po.createdBy ?? ""}</div>
                    </Td>
                    <Td className="font-medium">{po.supplierName}</Td>
                    <Td className="text-slate-500">{fmtD(po.purchaseDate)}</Td>
                    <Td className="text-slate-500">
                      {po.expectedDelivery ? (
                        <span className={new Date(po.expectedDelivery) < new Date() && po.status !== "RECEIVED" ? "text-red-600 font-medium" : ""}>
                          {fmtD(po.expectedDelivery)}
                        </span>
                      ) : "—"}
                    </Td>
                    <Td className="font-mono font-semibold">{fmtM(po.totalAmount)}</Td>
                    <Td><Badge label={PO_STATUS_LABELS[po.status]} className={PO_STATUS_COLORS[po.status]} /></Td>
                    <Td>
                      <div className="flex gap-1.5">
                        {po.status === "DRAFT" && (
                          <button onClick={() => void doAction(po.id, () => purchaseOrderApi.submit(po.id))} disabled={acting === po.id}
                            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                            <FileText className="h-3 w-3" /> Gửi duyệt
                          </button>
                        )}
                        {(po.status === "SUBMITTED" || po.status === "PENDING_APPROVAL") && (
                          <>
                            <button onClick={() => void doAction(po.id, () => purchaseOrderApi.approve(po.id))} disabled={acting === po.id}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                              <CheckCircle className="h-3 w-3" /> Duyệt
                            </button>
                            <button onClick={() => { const r = prompt("Lý do từ chối?") ?? ""; if (r !== null) void doAction(po.id, () => purchaseOrderApi.reject(po.id, r)); }} disabled={acting === po.id}
                              className="flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50">
                              <XCircle className="h-3 w-3" /> Từ chối
                            </button>
                          </>
                        )}
                        {(po.status === "DRAFT" || po.status === "SUBMITTED" || po.status === "PENDING_APPROVAL") && (
                          <button onClick={() => { const r = prompt("Lý do hủy?") ?? ""; void doAction(po.id, () => purchaseOrderApi.cancel(po.id, r)); }} disabled={acting === po.id}
                            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50">
                            <XCircle className="h-3 w-3" /> Hủy
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p); }} />
      </div>
    </div>
  );
}

// ─── PAYABLES TAB ─────────────────────────────────────────────────────────────
function PayablesTab() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PayableStatus | "">("");
  const [paying, setPaying] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await payableApi.list({ status: statusFilter || undefined, page: p, size: 15 });
      setPayables(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { void load(0); setPage(0); }, [load]);

  const totalRemaining = payables.reduce((s, p) => s + p.remainingAmount, 0);
  const overdueCount = payables.filter(p => p.daysOverdue > 0).length;

  const handlePay = async (payable: Payable) => {
    const input = prompt(`Thanh toán công nợ ${payable.payableCode}\nCòn lại: ${fmtM(payable.remainingAmount)}\n\nNhập số tiền:`);
    if (!input) return;
    const amount = parseFloat(input.replace(/[^0-9.]/g, ""));
    if (isNaN(amount) || amount <= 0) { alert("Số tiền không hợp lệ"); return; }
    setPaying(payable.id);
    try { await payableApi.pay({ payableId: payable.id, amount, paymentMethod: "CASH" }); await load(page); }
    finally { setPaying(null); }
  };

  return (
    <div className="space-y-4">
      {overdueCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{overdueCount}</strong> công nợ đang quá hạn thanh toán</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs text-slate-500">Tổng còn phải trả</div>
          <div className="text-lg font-bold text-red-600">{fmtM(totalRemaining)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs text-slate-500">Quá hạn</div>
          <div className="text-lg font-bold text-amber-600">{overdueCount} phiếu</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="text-xs text-slate-500">Tổng công nợ</div>
          <div className="text-lg font-bold text-slate-700">{payables.length} phiếu</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PayableStatus | "")}
          className="rounded-xl border border-slate-200 py-2 px-3 text-sm outline-none focus:border-indigo-400">
          <option value="">Tất cả trạng thái</option>
          {(Object.entries(PAYABLE_STATUS_LABELS) as [PayableStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>
              <Th>Mã CN</Th><Th>Nhà cung cấp</Th><Th>Nguồn</Th>
              <Th>Ngày hóa đơn</Th><Th>Hạn TT</Th>
              <Th>Gốc</Th><Th>Còn lại</Th>
              <Th>Quá hạn</Th><Th>Trạng thái</Th><Th>Thao tác</Th>
            </tr></thead>
            <tbody>
              {loading ? <EmptyRow cols={10} text="Đang tải..." />
                : payables.length === 0 ? <EmptyRow cols={10} text="Không có công nợ" />
                : payables.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <Td><span className="font-mono font-semibold text-indigo-600">{p.payableCode}</span></Td>
                    <Td className="font-medium">{p.supplierName}</Td>
                    <Td>
                      <div className="text-xs text-slate-500">{p.sourceType === "PURCHASE_RECEIPT" ? "Phiếu nhập" : p.sourceType}</div>
                      <div className="text-xs font-mono text-slate-400">{p.sourceNo ?? "—"}</div>
                    </Td>
                    <Td className="text-slate-500">{fmtD(p.invoiceDate)}</Td>
                    <Td>
                      {p.dueDate ? (
                        <span className={p.daysOverdue > 0 ? "font-bold text-red-600" : "text-slate-500"}>
                          {fmtD(p.dueDate)}
                        </span>
                      ) : "—"}
                    </Td>
                    <Td className="font-mono text-slate-600">{fmtM(p.originalAmount)}</Td>
                    <Td className="font-mono font-semibold">
                      <span className={p.remainingAmount > 0 ? "text-red-600" : "text-emerald-600"}>{fmtM(p.remainingAmount)}</span>
                    </Td>
                    <Td>
                      {p.daysOverdue > 0 ? (
                        <Badge label={`${p.daysOverdue} ngày`} className="bg-red-100 text-red-700" />
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </Td>
                    <Td><Badge label={PAYABLE_STATUS_LABELS[p.status]} className={PAYABLE_STATUS_COLORS[p.status]} /></Td>
                    <Td>
                      {(p.status === "OPEN" || p.status === "PARTIAL" || p.status === "OVERDUE") && (
                        <button onClick={() => void handlePay(p)} disabled={paying === p.id}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                          <BadgeDollarSign className="h-3.5 w-3.5" />
                          {paying === p.id ? "Đang TT..." : "Thanh toán"}
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p); }} />
      </div>
    </div>
  );
}

// ─── AGING REPORT TAB ────────────────────────────────────────────────────────
function AgingReportTab() {
  const [buckets, setBuckets] = useState<AgingBucket[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBuckets(await payableApi.agingReport()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const grand = useMemo(() => buckets.reduce(
    (acc, b) => ({
      current: acc.current + b.current,
      days1_30: acc.days1_30 + b.days1_30,
      days31_60: acc.days31_60 + b.days31_60,
      days61_90: acc.days61_90 + b.days61_90,
      over90: acc.over90 + b.over90,
      total: acc.total + b.total,
    }),
    { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, over90: 0, total: 0 }
  ), [buckets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Phân tích tuổi nợ nhà cung cấp theo khoảng thời gian quá hạn.</p>
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Cập nhật
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {[
          { label: "Chưa đến hạn", value: grand.current, color: "bg-slate-100 text-slate-700 border-slate-200" },
          { label: "1-30 ngày", value: grand.days1_30, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: "31-60 ngày", value: grand.days31_60, color: "bg-orange-50 text-orange-700 border-orange-200" },
          { label: "61-90 ngày", value: grand.days61_90, color: "bg-red-50 text-red-700 border-red-200" },
          { label: "> 90 ngày", value: grand.over90, color: "bg-red-100 text-red-800 border-red-300" },
          { label: "Tổng cộng", value: grand.total, color: "bg-indigo-50 text-indigo-800 border-indigo-200 font-bold" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-3 ${item.color}`}>
            <div className="text-xs font-medium opacity-75">{item.label}</div>
            <div className={`text-sm font-bold mt-0.5 ${item.color}`}>{fmtM(item.value)}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th>Nhà cung cấp</Th>
                <Th>Chưa đến hạn</Th>
                <Th>1-30 ngày</Th>
                <Th>31-60 ngày</Th>
                <Th>61-90 ngày</Th>
                <Th>&gt;90 ngày</Th>
                <Th>Tổng</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? <EmptyRow cols={7} text="Đang tải..." />
                : buckets.length === 0 ? <EmptyRow cols={7} text="Không có công nợ tồn đọng" />
                : buckets.map(b => (
                  <tr key={b.supplierId} className="hover:bg-slate-50 transition-colors">
                    <Td className="font-semibold">{b.supplierName}</Td>
                    <Td className="font-mono text-slate-600">{b.current > 0 ? fmtM(b.current) : <span className="text-slate-300">—</span>}</Td>
                    <Td className="font-mono text-yellow-700">{b.days1_30 > 0 ? fmtM(b.days1_30) : <span className="text-slate-300">—</span>}</Td>
                    <Td className="font-mono text-orange-700">{b.days31_60 > 0 ? fmtM(b.days31_60) : <span className="text-slate-300">—</span>}</Td>
                    <Td className="font-mono text-red-600">{b.days61_90 > 0 ? fmtM(b.days61_90) : <span className="text-slate-300">—</span>}</Td>
                    <Td className="font-mono font-bold text-red-700">{b.over90 > 0 ? fmtM(b.over90) : <span className="font-normal text-slate-300">—</span>}</Td>
                    <Td className="font-mono font-bold text-indigo-700">{fmtM(b.total)}</Td>
                  </tr>
                ))}
            </tbody>
            {buckets.length > 0 && (
              <tfoot>
                <tr className="bg-indigo-50 font-bold">
                  <td className="px-4 py-3 text-sm text-indigo-700">Tổng cộng</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{fmtM(grand.current)}</td>
                  <td className="px-4 py-3 font-mono text-yellow-700">{fmtM(grand.days1_30)}</td>
                  <td className="px-4 py-3 font-mono text-orange-700">{fmtM(grand.days31_60)}</td>
                  <td className="px-4 py-3 font-mono text-red-600">{fmtM(grand.days61_90)}</td>
                  <td className="px-4 py-3 font-mono text-red-700">{fmtM(grand.over90)}</td>
                  <td className="px-4 py-3 font-mono text-indigo-800">{fmtM(grand.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── RETURNS TAB ──────────────────────────────────────────────────────────────
function ReturnsTab() {
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await purchaseReturnApi.list(undefined, p, 15);
      setReturns(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(0); setPage(0); }, [load]);

  const doAction = async (id: number, action: () => Promise<PurchaseReturn>) => {
    setActing(id);
    try { await action(); await load(page); } finally { setActing(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Phiếu trả hàng NCC: giảm tồn kho + bù trừ công nợ hoặc ghi nhận hoàn tiền.</p>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>
              <Th>Số phiếu</Th><Th>NCC</Th><Th>Ngày trả</Th>
              <Th>Phương thức hoàn</Th><Th>Tổng trị giá</Th>
              <Th>Kho đã trừ</Th><Th>CN đã điều chỉnh</Th>
              <Th>Trạng thái</Th><Th>Thao tác</Th>
            </tr></thead>
            <tbody>
              {loading ? <EmptyRow cols={9} text="Đang tải..." />
                : returns.length === 0 ? <EmptyRow cols={9} text="Chưa có phiếu trả hàng" />
                : returns.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <Td><span className="font-mono font-semibold text-indigo-600">{r.returnCode}</span></Td>
                    <Td className="font-medium">{r.supplierId}</Td>
                    <Td className="text-slate-500">{fmtD(r.returnDate)}</Td>
                    <Td>
                      <Badge
                        label={r.refundMethod === "CASH_REFUND" ? "Hoàn tiền mặt" : "Bù trừ công nợ"}
                        className={r.refundMethod === "CASH_REFUND" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}
                      />
                    </Td>
                    <Td className="font-mono font-semibold">{fmtM(r.totalAmount)}</Td>
                    <Td>
                      {r.stockReturned ? <Badge label="Đã trừ" className="bg-emerald-100 text-emerald-700" /> : <Badge label="Chưa" className="bg-slate-100 text-slate-500" />}
                    </Td>
                    <Td>
                      {r.payableAdjusted ? <Badge label="Đã điều chỉnh" className="bg-emerald-100 text-emerald-700" /> : <Badge label="Chưa" className="bg-slate-100 text-slate-500" />}
                    </Td>
                    <Td>
                      <Badge
                        label={r.status === "DRAFT" ? "Nháp" : r.status === "COMPLETED" ? "Hoàn tất" : "Đã hủy"}
                        className={r.status === "DRAFT" ? "bg-slate-100 text-slate-600" : r.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}
                      />
                    </Td>
                    <Td>
                      <div className="flex gap-1.5">
                        {r.status === "DRAFT" && (
                          <>
                            <button onClick={() => void doAction(r.id, () => purchaseReturnApi.complete(r.id))} disabled={acting === r.id}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                              <CheckCircle className="h-3 w-3" /> Hoàn tất
                            </button>
                            <button onClick={() => { if (confirm("Hủy phiếu trả hàng?")) void doAction(r.id, () => purchaseReturnApi.cancel(r.id)); }} disabled={acting === r.id}
                              className="flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50">
                              <XCircle className="h-3 w-3" /> Hủy
                            </button>
                          </>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p); }} />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "suppliers", label: "Nhà cung cấp", icon: Building2 },
  { id: "orders",    label: "Đơn mua hàng", icon: ShoppingCart },
  { id: "payables",  label: "Công nợ phải trả", icon: BadgeDollarSign },
  { id: "aging",     label: "Tuổi nợ", icon: Clock },
  { id: "returns",   label: "Trả hàng NCC", icon: RotateCcw },
];

export default function PurchasingPage() {
  const [tab, setTab] = useState<Tab>("suppliers");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)" }}>
      <div className="px-6 pb-6 pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 shadow-lg shadow-violet-500/30">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Mua hàng & Nhà cung cấp</h1>
              </div>
              <p className="text-slate-400 text-sm">Quản lý NCC, đơn mua hàng, công nợ phải trả, tuổi nợ và trả hàng</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setTab("orders")}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all">
                <ShoppingCart className="h-4 w-4" /> Tạo đơn mua
              </button>
              <button onClick={() => setTab("payables")}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/15 transition-all">
                <BadgeDollarSign className="h-4 w-4" /> Thanh toán NCC
              </button>
              <button onClick={() => setTab("aging")}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/15 transition-all">
                <TrendingUp className="h-4 w-4" /> Báo cáo tuổi nợ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
            <KpiCard label="Nhà cung cấp" value="NCC" sub="Đa nhóm, đa ngành" icon={Building2} color="bg-indigo-500" />
            <KpiCard label="Đơn mua hàng" value="PO" sub="Workflow 6 bước" icon={ShoppingCart} color="bg-violet-500" />
            <KpiCard label="Công nợ phải trả" value="CN" sub="Theo dõi từng đơn" icon={BadgeDollarSign} color="bg-rose-500" />
            <KpiCard label="Tuổi nợ" value="5" sub="Nhóm phân tích" icon={Clock} color="bg-amber-500" />
          </div>
        </div>
      </div>

      <div className="rounded-t-3xl bg-slate-50 px-6 pt-6 pb-8 min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex gap-1 rounded-2xl bg-white p-1 shadow-sm border border-slate-200 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} id={`tab-purchasing-${t.id}`} onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  tab === t.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:bg-slate-100"
                }`}>
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div>
            {tab === "suppliers" && <SuppliersTab />}
            {tab === "orders"    && <PurchaseOrdersTab />}
            {tab === "payables"  && <PayablesTab />}
            {tab === "aging"     && <AgingReportTab />}
            {tab === "returns"   && <ReturnsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
