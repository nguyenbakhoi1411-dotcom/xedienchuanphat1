"use client";

import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Box,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  PackageMinus,
  PackagePlus,
  RefreshCw,
  Repeat2,
  Search,
  TrendingDown,
  Warehouse,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { goodsIssueApi, inventoryCountApi, receiptApi, stockApi, warehouseApi } from "@/features/warehouse/api";
import type {
  GoodsIssue,
  InventoryCount,
  InventoryStock,
  PurchaseReceipt,
  ReceiptStatus,
  Warehouse as WarehouseType,
} from "@/features/warehouse/types";
import {
  COUNT_STATUS_COLORS,
  COUNT_STATUS_LABELS,
  GOODS_ISSUE_TYPE_COLORS,
  GOODS_ISSUE_TYPE_LABELS,
  RECEIPT_STATUS_LABELS,
  WAREHOUSE_TYPE_LABELS,
} from "@/features/warehouse/types";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number | undefined | null) =>
  n == null ? "—" : new Intl.NumberFormat("vi-VN").format(n);
const fmtMoney = (n: number | undefined | null) =>
  n == null ? "—" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

type Tab = "stock" | "receipts" | "issues" | "transfers" | "counts";

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub?: string;
  icon: React.FC<{ className?: string }>; color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-full opacity-10 ${color}`} style={{ transform: "translate(30%, -30%)" }} />
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} bg-opacity-20`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-300">{label}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 first:rounded-tl-xl last:rounded-tr-xl">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border-b border-slate-100 px-4 py-3 text-slate-700 ${className}`}>{children}</td>;
}
function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16 text-center text-slate-400">{text}</td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, total, onPageChange }: { page: number; total: number; onPageChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>Trang {page + 1} / {total}</span>
      <div className="flex gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
          className="rounded-lg border px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= total - 1}
          className="rounded-lg border px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── STOCK TAB ────────────────────────────────────────────────────────────────
function StockTab({ branchId }: { branchId?: number }) {
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await stockApi.list(branchId, undefined, p, 15);
      setStocks(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, [branchId]);

  useEffect(() => { void load(0); setPage(0); }, [load]);

  const filtered = useMemo(() =>
    stocks.filter(s =>
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.productCode.toLowerCase().includes(search.toLowerCase())
    ), [stocks, search]);

  const lowStockCount = stocks.filter(s => s.availableQuantity <= s.minQuantity).length;

  return (
    <div className="space-y-4">
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{lowStockCount}</strong> mặt hàng sắp hết hàng cần bổ sung</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <thead>
            <tr>
              <Th>Mã / Tên sản phẩm</Th>
              <Th>Kho</Th>
              <Th>Tồn kho</Th>
              <Th>Đặt trước</Th>
              <Th>Khả dụng</Th>
              <Th>Min</Th>
              <Th>Giá vốn TB</Th>
              <Th>Trạng thái</Th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <EmptyRow cols={8} text="Đang tải..." />
              : filtered.length === 0
              ? <EmptyRow cols={8} text="Không có dữ liệu tồn kho" />
              : filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <Td>
                    <div className="font-medium text-slate-800">{s.productName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.productCode}</div>
                  </Td>
                  <Td className="text-slate-500">{s.warehouseName ?? "—"}</Td>
                  <Td className="font-mono font-medium">{fmt(s.quantityOnHand)}</Td>
                  <Td className="font-mono text-amber-600">{fmt(s.reservedQuantity)}</Td>
                  <Td className="font-mono">
                    <span className={s.availableQuantity <= s.minQuantity ? "font-bold text-red-600" : "text-emerald-600"}>
                      {fmt(s.availableQuantity)}
                    </span>
                  </Td>
                  <Td className="text-slate-400">{fmt(s.minQuantity)}</Td>
                  <Td className="font-mono text-slate-600">{fmtMoney(s.averageCost)}</Td>
                  <Td>
                    {s.availableQuantity <= s.minQuantity
                      ? <Badge label="Sắp hết" className="bg-red-100 text-red-700" />
                      : <Badge label="Đủ hàng" className="bg-emerald-100 text-emerald-700" />}
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p); }} />
      </div>
    </div>
  );
}

// ─── RECEIPTS TAB ─────────────────────────────────────────────────────────────
function ReceiptsTab({ branchId }: { branchId?: number }) {
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await receiptApi.list(branchId, undefined, p, 15);
      setReceipts(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, [branchId]);

  useEffect(() => { void load(0); setPage(0); }, [load]);

  const handleConfirm = async (id: number) => {
    if (!confirm("Xác nhận nhập kho phiếu này? Hành động này sẽ tăng tồn kho và tạo serial xe.")) return;
    setConfirming(id);
    try {
      await receiptApi.confirm(id);
      await load(page);
    } finally { setConfirming(null); }
  };

  const statusColor: Record<ReceiptStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Danh sách phiếu nhập kho. Xác nhận để tăng tồn và tạo serial xe điện.</p>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <thead>
            <tr>
              <Th>Số phiếu</Th>
              <Th>Nhà cung cấp</Th>
              <Th>Kho nhập</Th>
              <Th>Ngày nhập</Th>
              <Th>Tổng tiền</Th>
              <Th>Trạng thái</Th>
              <Th>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <EmptyRow cols={7} text="Đang tải..." />
              : receipts.length === 0
              ? <EmptyRow cols={7} text="Chưa có phiếu nhập kho nào" />
              : receipts.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <Td>
                    <div className="font-mono font-semibold text-indigo-600">{r.receiptNo}</div>
                    {r.purchaseOrderId && <div className="text-xs text-slate-400">PO #{r.purchaseOrderId}</div>}
                  </Td>
                  <Td className="font-medium">{r.supplierName}</Td>
                  <Td className="text-slate-500">{r.warehouseName ?? "Kho chính"}</Td>
                  <Td className="text-slate-500">{new Date(r.receiptDate).toLocaleDateString("vi-VN")}</Td>
                  <Td className="font-mono font-semibold text-slate-800">{fmtMoney(r.totalAmount)}</Td>
                  <Td>
                    <Badge
                      label={RECEIPT_STATUS_LABELS[r.status]}
                      className={statusColor[r.status]}
                    />
                  </Td>
                  <Td>
                    {r.status === "DRAFT" && (
                      <button
                        onClick={() => void handleConfirm(r.id)}
                        disabled={confirming === r.id}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {confirming === r.id ? "Đang xử lý..." : "Xác nhận nhập"}
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p); }} />
      </div>
    </div>
  );
}

// ─── GOODS ISSUES TAB ─────────────────────────────────────────────────────────
function GoodsIssuesTab({ branchId }: { branchId?: number }) {
  const [issues, setIssues] = useState<GoodsIssue[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await goodsIssueApi.list(branchId, undefined, undefined, p, 15);
      setIssues(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, [branchId]);

  useEffect(() => { void load(0); setPage(0); }, [load]);

  const handleIssue = async (id: number) => {
    if (!confirm("Xác nhận xuất kho? Tồn kho sẽ bị trừ ngay.")) return;
    setIssuing(id);
    try { await goodsIssueApi.issue(id); await load(page); }
    finally { setIssuing(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Phiếu xuất kho theo các loại: bán hàng, bảo hành, sửa chữa, chuyển kho, hủy.</p>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <thead>
            <tr>
              <Th>Số phiếu</Th>
              <Th>Loại xuất</Th>
              <Th>Kho</Th>
              <Th>Ngày xuất</Th>
              <Th>Tham chiếu</Th>
              <Th>Giá trị</Th>
              <Th>Trạng thái</Th>
              <Th>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <EmptyRow cols={8} text="Đang tải..." />
              : issues.length === 0
              ? <EmptyRow cols={8} text="Chưa có phiếu xuất kho nào" />
              : issues.map(issue => (
                <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                  <Td>
                    <span className="font-mono font-semibold text-indigo-600">{issue.issueNo}</span>
                  </Td>
                  <Td>
                    <Badge
                      label={GOODS_ISSUE_TYPE_LABELS[issue.issueType]}
                      className={GOODS_ISSUE_TYPE_COLORS[issue.issueType]}
                    />
                  </Td>
                  <Td className="text-slate-500">{issue.warehouseName ?? "—"}</Td>
                  <Td className="text-slate-500">{new Date(issue.issueDate).toLocaleDateString("vi-VN")}</Td>
                  <Td className="text-xs text-slate-400">
                    {issue.referenceNo ? `${issue.referenceType ?? ""} #${issue.referenceNo}` : "—"}
                  </Td>
                  <Td className="font-mono font-semibold">{fmtMoney(issue.totalValue)}</Td>
                  <Td>
                    <Badge
                      label={issue.status === "DRAFT" ? "Nháp" : issue.status === "ISSUED" ? "Đã xuất" : "Đã hủy"}
                      className={
                        issue.status === "DRAFT" ? "bg-slate-100 text-slate-600" :
                        issue.status === "ISSUED" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }
                    />
                  </Td>
                  <Td>
                    {issue.status === "DRAFT" && (
                      <button
                        onClick={() => void handleIssue(issue.id)}
                        disabled={issuing === issue.id}
                        className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                        {issuing === issue.id ? "Đang xuất..." : "Xuất kho"}
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p); }} />
      </div>
    </div>
  );
}

// ─── INVENTORY COUNTS TAB ─────────────────────────────────────────────────────
function CountsTab({ branchId }: { branchId?: number }) {
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<InventoryCount | null>(null);
  const [approving, setApproving] = useState<number | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await inventoryCountApi.list(branchId, undefined, p, 15);
      setCounts(res.items);
      setTotalPages(res.totalPages);
    } finally { setLoading(false); }
  }, [branchId]);

  useEffect(() => { void load(0); setPage(0); }, [load]);

  const loadDetail = async (id: number) => {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    const d = await inventoryCountApi.get(id);
    setDetail(d);
    setExpanded(id);
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Duyệt kiểm kê? Hệ thống sẽ tự động điều chỉnh tồn kho theo số liệu đã đếm.")) return;
    setApproving(id);
    try { await inventoryCountApi.approve(id); await load(page); setExpanded(null); }
    finally { setApproving(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Phiếu kiểm kê: tạo &rarr; đếm thực tế &rarr; gửi duyệt &rarr; điều chỉnh kho.</p>
        <button onClick={() => load(page)} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <thead>
            <tr>
              <Th>Số phiếu</Th>
              <Th>Kho</Th>
              <Th>Ngày kiểm</Th>
              <Th>Mặt hàng</Th>
              <Th>Chênh lệch</Th>
              <Th>Trạng thái</Th>
              <Th>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <EmptyRow cols={7} text="Đang tải..." />
              : counts.length === 0
              ? <EmptyRow cols={7} text="Chưa có phiếu kiểm kê nào" />
              : counts.map(c => (
                <>
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => void loadDetail(c.id)}>
                    <Td>
                      <span className="font-mono font-semibold text-indigo-600">{c.countNo}</span>
                    </Td>
                    <Td className="text-slate-500">{c.warehouseName ?? "—"}</Td>
                    <Td className="text-slate-500">{new Date(c.countDate).toLocaleDateString("vi-VN")}</Td>
                    <Td>
                      <span className="font-medium">{c.totalItems}</span>
                      <span className="ml-1 text-xs text-slate-400">mặt hàng</span>
                    </Td>
                    <Td>
                      {c.itemsWithVariance > 0
                        ? <Badge label={`${c.itemsWithVariance} chênh lệch`} className="bg-amber-100 text-amber-700" />
                        : <Badge label="Đúng" className="bg-emerald-100 text-emerald-700" />}
                    </Td>
                    <Td>
                      <Badge
                        label={COUNT_STATUS_LABELS[c.status]}
                        className={COUNT_STATUS_COLORS[c.status]}
                      />
                    </Td>
                    <Td>
                      <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                        {c.status === "PENDING_APPROVAL" && (
                          <button
                            onClick={() => void handleApprove(c.id)}
                            disabled={approving === c.id}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {approving === c.id ? "Đang duyệt..." : "Duyệt & Điều chỉnh"}
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                  {expanded === c.id && detail && (
                    <tr key={`${c.id}-detail`}>
                      <td colSpan={7} className="bg-indigo-50/50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">Chi tiết kiểm kê</div>
                        <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-indigo-50 text-xs font-semibold text-indigo-700 uppercase">
                                <th className="px-3 py-2 text-left">Sản phẩm</th>
                                <th className="px-3 py-2 text-right">Hệ thống</th>
                                <th className="px-3 py-2 text-right">Thực tế</th>
                                <th className="px-3 py-2 text-right">Chênh lệch</th>
                                <th className="px-3 py-2 text-left">Lý do</th>
                                <th className="px-3 py-2 text-left">Đã điều chỉnh</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detail.items.map(item => (
                                <tr key={item.id} className="border-t border-indigo-50">
                                  <td className="px-3 py-2">
                                    <div className="font-medium">{item.productName}</div>
                                    <div className="text-xs text-slate-400">{item.productCode}</div>
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono">{item.systemQuantity}</td>
                                  <td className="px-3 py-2 text-right font-mono">
                                    {item.countedQuantity ?? <span className="text-slate-300">—</span>}
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono">
                                    {item.varianceQty !== 0 ? (
                                      <span className={item.varianceQty > 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                                        {item.varianceQty > 0 ? "+" : ""}{item.varianceQty}
                                      </span>
                                    ) : <span className="text-slate-300">0</span>}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 text-xs">{item.varianceReason ?? "—"}</td>
                                  <td className="px-3 py-2">
                                    {item.adjustmentApplied
                                      ? <Badge label="Đã áp dụng" className="bg-emerald-100 text-emerald-700" />
                                      : <Badge label="Chưa" className="bg-slate-100 text-slate-500" />}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
          </tbody>
        </Table>
        <Pagination page={page} total={totalPages} onPageChange={p => { setPage(p); void load(p); }} />
      </div>
    </div>
  );
}

// ─── WAREHOUSES TAB ───────────────────────────────────────────────────────────
function WarehousesTab({ branchId }: { branchId?: number }) {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseApi.list(branchId);
      setWarehouses(res.items);
    } finally { setLoading(false); }
  }, [branchId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Danh sách tất cả kho hàng theo chi nhánh.</p>
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" /> Làm mới
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? <div className="col-span-3 py-12 text-center text-slate-400">Đang tải...</div>
          : warehouses.length === 0
          ? <div className="col-span-3 py-12 text-center text-slate-400">Chưa có kho nào</div>
          : warehouses.map(w => (
            <div key={w.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-800">{w.warehouseName}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">{w.warehouseCode}</div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  w.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {w.status === "ACTIVE" ? "Hoạt động" : "Ngưng"}
                </span>
              </div>
              <div className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {WAREHOUSE_TYPE_LABELS[w.type]}
              </div>
              {(w.locationAisle || w.locationShelf || w.locationBin) && (
                <div className="mt-2 text-xs text-slate-400 flex gap-2">
                  {w.locationAisle && <span>Dãy: {w.locationAisle}</span>}
                  {w.locationShelf && <span>Kệ: {w.locationShelf}</span>}
                  {w.locationBin && <span>Ô: {w.locationBin}</span>}
                </div>
              )}
              {w.description && (
                <p className="mt-2 text-xs text-slate-400">{w.description}</p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "stock",     label: "Tồn kho",    icon: Box },
  { id: "receipts",  label: "Phiếu nhập", icon: ArrowDownToLine },
  { id: "issues",    label: "Phiếu xuất", icon: ArrowUpFromLine },
  { id: "counts",    label: "Kiểm kê",    icon: ClipboardList },
  { id: "transfers", label: "Kho",        icon: Warehouse },
];

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("stock");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}>
      {/* Header gradient */}
      <div className="px-6 pb-6 pt-8">
        <div className="mx-auto max-w-7xl">
          {/* Title row */}
          <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/30">
                  <Box className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Quản lý Kho hàng</h1>
              </div>
              <p className="text-slate-400 text-sm pl-13">
                Tồn kho, phiếu nhập/xuất, kiểm kê và kho nhiều chi nhánh
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTab("receipts")}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
              >
                <PackagePlus className="h-4 w-4" /> Tạo phiếu nhập
              </button>
              <button
                onClick={() => setTab("issues")}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/15 transition-all"
              >
                <PackageMinus className="h-4 w-4" /> Tạo phiếu xuất
              </button>
              <button
                onClick={() => setTab("counts")}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/15 transition-all"
              >
                <ClipboardList className="h-4 w-4" /> Kiểm kê kho
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
            <KpiCard label="Loại kho" value="9" sub="Đa dạng loại kho" icon={Warehouse} color="bg-indigo-500" />
            <KpiCard label="Phiếu nhập" value="GNK" sub="Nhập kho chuẩn" icon={ArrowDownToLine} color="bg-violet-500" />
            <KpiCard label="Phiếu xuất" value="PXK" sub="6 loại xuất kho" icon={ArrowUpFromLine} color="bg-rose-500" />
            <KpiCard label="Kiểm kê" value="KKE" sub="5 bước duyệt" icon={ClipboardList} color="bg-amber-500" />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="rounded-t-3xl bg-slate-50 px-6 pt-6 pb-8 min-h-screen">
        <div className="mx-auto max-w-7xl">
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-2xl bg-white p-1 shadow-sm border border-slate-200 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {tab === "stock" && <StockTab />}
            {tab === "receipts" && <ReceiptsTab />}
            {tab === "issues" && <GoodsIssuesTab />}
            {tab === "counts" && <CountsTab />}
            {tab === "transfers" && <WarehousesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
