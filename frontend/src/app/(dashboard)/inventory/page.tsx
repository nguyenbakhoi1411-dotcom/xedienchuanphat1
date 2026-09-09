"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useInventoryReceipts,
  useInventoryIssues,
  useInventoryTransfers,
  useInventoryCounts,
} from "@/features/inventory/hooks";
import { inventoryApi } from "@/features/inventory/api";
import { InboundForm } from "@/features/inventory/components/InboundForm";
import { OutboundForm } from "@/features/inventory/components/OutboundForm";
import { TransferForm } from "@/features/inventory/components/TransferForm";
import type {
  PurchaseReceiptSummary,
  PurchaseReceiptItem,
  GoodsIssueSummary,
  GoodsIssueItem,
  InventoryTransferSummary,
  InventoryTransferItem,
  InventoryCountSummary,
  InventoryCountItem,
} from "@/features/inventory/types";
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Settings2,
  Package,
  PackageMinus,
  ArrowRightLeft,
  ClipboardCheck,
  BarChart2,
  Workflow,
  Wrench,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// ─── Helpers ────────────────────────────────────────────
function fmt(n: number | null | undefined) {
  if (n == null) return "0";
  return new Intl.NumberFormat("vi-VN").format(n);
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  try { return format(new Date(d), "dd/MM/yyyy"); } catch { return "—"; }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    DRAFT:     { label: "Phiếu tạm",    cls: "bg-gray-100 text-gray-600" },
    CONFIRMED: { label: "Đã xác nhận",  cls: "bg-green-100 text-green-700" },
    ISSUED:    { label: "Đã xuất kho",  cls: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: "Đã hủy",       cls: "bg-red-100 text-red-600" },
    OPEN:      { label: "Đang mở",      cls: "bg-amber-100 text-amber-700" },
    CLOSED:    { label: "Đã đóng",      cls: "bg-teal-100 text-teal-700" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-500" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Page Size Select ────────────────────────────────────
function PageSizeSelect({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
      <span>Số dòng/trang</span>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
      >
        {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────
function Pager({ page, total, size, onPage }: { page: number; total: number; size: number; onPage: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`el${i}`} className="px-1 text-gray-400 text-sm">...</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)}
            className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors
              ${page === p ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Tabs config ─────────────────────────────────────────
type Tab = "quy-trinh" | "bieu-do" | "nhap-kho" | "xuat-kho" | "chuyen-kho" | "kiem-ke" | "hang-hoa";

const TABS: { id: Tab; label: string }[] = [
  { id: "quy-trinh",  label: "Quy trình" },
  { id: "bieu-do",    label: "Biểu đồ" },
  { id: "nhap-kho",   label: "Nhập kho" },
  { id: "xuat-kho",   label: "Xuất kho" },
  { id: "chuyen-kho", label: "Chuyển kho" },
  { id: "kiem-ke",    label: "Kiểm kê" },
  { id: "hang-hoa",   label: "Hàng hóa, dịch vụ" },
];

// ═══════════════════════════════════════════════════════════
// NHẬP KHO TAB
// ═══════════════════════════════════════════════════════════
function NhapKhoTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ items: PurchaseReceiptItem[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [confirming, setConfirming] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useInventoryReceipts({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    keyword: search || undefined,
    page: page - 1,
    size,
  });

  const items = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  const loadDetail = useCallback(async (id: number) => {
    if (selectedId === id) { setSelectedId(null); setDetail(null); return; }
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const d = await inventoryApi.getReceiptDetail(id);
      setDetail(d);
    } catch { setDetail(null); }
    finally { setLoadingDetail(false); }
  }, [selectedId]);

  const handleConfirm = async (id: number) => {
    setConfirming(id);
    try {
      await inventoryApi.confirmReceipt(id);
      toast.success("Xác nhận phiếu nhập thành công");
      qc.invalidateQueries({ queryKey: ["inventory", "receipts"] });
      if (selectedId === id) { const d = await inventoryApi.getReceiptDetail(id); setDetail(d); }
    } catch (e: any) { toast.error(e?.response?.data?.message ?? "Không thể xác nhận phiếu"); }
    finally { setConfirming(null); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Hủy phiếu nhập kho này?")) return;
    try {
      await inventoryApi.cancelReceipt(id);
      toast.success("Đã hủy phiếu nhập");
      qc.invalidateQueries({ queryKey: ["inventory", "receipts"] });
      if (selectedId === id) { setSelectedId(null); setDetail(null); }
    } catch (e: any) { toast.error(e?.response?.data?.message ?? "Không thể hủy phiếu"); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm..."
            className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-green-400 bg-gray-50"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-8 border border-gray-200 rounded px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-green-400 text-gray-700">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="DRAFT">Phiếu tạm</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => qc.invalidateQueries({ queryKey: ["inventory", "receipts"] })}
            className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500" title="Làm mới">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500" title="Xuất Excel">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500" title="Nhập từ Excel">
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500" title="Bộ lọc nâng cao">
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500" title="Tùy chỉnh cột">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setEditId(undefined); setShowForm(true); }}
            className="h-8 flex items-center gap-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded text-[13px] font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Thêm
          </button>
        </div>
      </div>

      {/* Master table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-[13px] border-collapse">
          <thead className="sticky top-0 z-10 bg-[#f4f5f8] border-b border-gray-200">
            <tr>
              <th className="w-8 px-3 py-2.5"><input type="checkbox" className="rounded" /></th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Ngày hạch toán</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Số chứng từ</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 whitespace-nowrap">Tổng tiền</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Đối tượng</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Địa chỉ</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Loại chứng từ</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array(8).fill(0).map((_, j) => (
                    <td key={j} className="px-3 py-2.5"><div className="h-4 bg-gray-200 rounded animate-pulse w-full" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-[13px]">Không có dữ liệu</td></tr>
            ) : (
              items.map((item: PurchaseReceiptSummary) => (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => loadDetail(item.id)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedId === item.id ? "bg-green-50 border-l-2 border-l-green-500" : "hover:bg-[#f8fdf9]"}`}
                  >
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                    <td className="px-3 py-2.5 text-gray-700">{formatDate(item.accountingDate)}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-green-700 font-medium hover:underline cursor-pointer">{item.receiptNo}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-800">{fmt(item.totalAmount)}</td>
                    <td className="px-3 py-2.5 text-gray-800 max-w-[200px] truncate">{item.objectName ?? item.supplierName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-gray-500 max-w-[180px] truncate">{item.objectAddress ?? "—"}</td>
                    <td className="px-3 py-2.5 text-gray-600">{
                      item.receiptType === "FROM_SUPPLIER" ? "Mua hàng trong nước" :
                      item.receiptType === "FROM_IMPORT" ? "Mua hàng nhập khẩu" :
                      item.receiptType === "FROM_RETURN" ? "Nhập hàng bán trả lại" :
                      item.receiptType === "FROM_TRANSFER" ? "Nhập từ chuyển kho" :
                      item.receiptType === "FROM_PRODUCTION" ? "Nhập từ sản xuất" :
                      "Nhập kho khác"
                    }</td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {item.status === "DRAFT" && (
                          <button
                            onClick={() => handleConfirm(item.id)}
                            disabled={confirming === item.id}
                            className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium transition-colors disabled:opacity-50">
                            {confirming === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Xác nhận"}
                          </button>
                        )}
                        {item.status !== "CANCELLED" && (
                          <button onClick={() => handleCancel(item.id)} className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition-colors">Hủy</button>
                        )}
                        <button
                          onClick={() => { setEditId(item.id); setShowForm(true); }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors">
                          Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                  {selectedId === item.id && (
                    <tr className="bg-green-50/40">
                      <td colSpan={8} className="px-0">
                        <DetailPanel items={detail?.items ?? []} loading={loadingDetail} type="receipt" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot className="sticky bottom-0 bg-[#f4f5f8] border-t-2 border-gray-200">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-[13px] font-bold text-gray-700">Tổng</td>
                <td className="px-3 py-2 text-right text-[13px] font-bold text-gray-800">
                  {fmt(items.reduce((s, i) => s + (i.totalAmount ?? 0), 0))}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-[13px] text-gray-500">Tổng số: <strong className="text-gray-700">{fmt(total)}</strong></span>
        <div className="flex items-center gap-4">
          <PageSizeSelect value={size} onChange={n => { setSize(n); setPage(1); }} />
          <Pager page={page} total={total} size={size} onPage={setPage} />
        </div>
      </div>

      {/* Form overlay */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
          <InboundForm
            receiptId={editId}
            onCancel={() => { setShowForm(false); setEditId(undefined); }}
            onSuccess={() => {
              setShowForm(false);
              setEditId(undefined);
              qc.invalidateQueries({ queryKey: ["inventory", "receipts"] });
            }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// XUẤT KHO TAB
// ═══════════════════════════════════════════════════════════
function XuatKhoTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ items: GoodsIssueItem[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [confirming, setConfirming] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useInventoryIssues({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    keyword: search || undefined,
    page: page - 1,
    size,
  });

  const items = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  const loadDetail = useCallback(async (id: number) => {
    if (selectedId === id) { setSelectedId(null); setDetail(null); return; }
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const d = await inventoryApi.getIssueDetail(id);
      setDetail(d);
    } catch { setDetail(null); }
    finally { setLoadingDetail(false); }
  }, [selectedId]);

  const handleConfirm = async (id: number) => {
    setConfirming(id);
    try {
      await inventoryApi.confirmIssue(id);
      toast.success("Xác nhận phiếu xuất thành công");
      qc.invalidateQueries({ queryKey: ["inventory", "issues"] });
    } catch (e: any) { toast.error(e?.response?.data?.message ?? "Không thể xác nhận phiếu"); }
    finally { setConfirming(null); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Hủy phiếu xuất kho này?")) return;
    try {
      await inventoryApi.cancelIssue(id);
      toast.success("Đã hủy phiếu xuất");
      qc.invalidateQueries({ queryKey: ["inventory", "issues"] });
      if (selectedId === id) { setSelectedId(null); setDetail(null); }
    } catch (e: any) { toast.error(e?.response?.data?.message ?? "Không thể hủy phiếu"); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm..."
            className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-400 bg-gray-50"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-8 border border-gray-200 rounded px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-orange-400 text-gray-700">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="DRAFT">Phiếu tạm</option>
          <option value="ISSUED">Đã xuất kho</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => qc.invalidateQueries({ queryKey: ["inventory", "issues"] })}
            className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500"><Download className="w-3.5 h-3.5" /></button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500"><Filter className="w-3.5 h-3.5" /></button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500"><Settings2 className="w-3.5 h-3.5" /></button>
          <button
            onClick={() => { setEditId(undefined); setShowForm(true); }}
            className="h-8 flex items-center gap-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded text-[13px] font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Thêm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-[13px] border-collapse">
          <thead className="sticky top-0 z-10 bg-[#f4f5f8] border-b border-gray-200">
            <tr>
              <th className="w-8 px-3 py-2.5"><input type="checkbox" className="rounded" /></th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Ngày hạch toán</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Số chứng từ</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Diễn giải</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 whitespace-nowrap">Tổng tiền</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Người nhận</th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 whitespace-nowrap">Đã lập CT bán hàng</th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 whitespace-nowrap">TT Phát hành hóa đơn</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Xử lý # / Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array(9).fill(0).map((_, j) => (
                    <td key={j} className="px-3 py-2.5"><div className="h-4 bg-gray-200 rounded animate-pulse w-full" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-16 text-gray-400 text-[13px]">Không có dữ liệu</td></tr>
            ) : (
              items.map((item: GoodsIssueSummary) => (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => loadDetail(item.id)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedId === item.id ? "bg-orange-50 border-l-2 border-l-orange-500" : "hover:bg-orange-50/20"}`}
                  >
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                    <td className="px-3 py-2.5 text-gray-700">{formatDate(item.accountingDate)}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-orange-700 font-medium hover:underline">{item.issueNo}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[200px] truncate">{item.description ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-800">{fmt(item.totalAmount)}</td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[160px] truncate">{item.receiverName ?? item.customerName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center">
                      {item.invoiceIssued ? <CheckCircle2 className="w-4 h-4 text-green-500 inline" /> : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {item.invoiceStatus ? <StatusBadge status={item.invoiceStatus} /> : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {item.status === "DRAFT" && (
                          <button onClick={() => handleConfirm(item.id)} disabled={confirming === item.id}
                            className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded font-medium transition-colors">
                            {confirming === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Xác nhận"}
                          </button>
                        )}
                        {item.status !== "CANCELLED" && (
                          <button onClick={() => handleCancel(item.id)} className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium">Hủy</button>
                        )}
                        <button onClick={() => { setEditId(item.id); setShowForm(true); }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium">Xem</button>
                      </div>
                    </td>
                  </tr>
                  {selectedId === item.id && (
                    <tr className="bg-orange-50/30">
                      <td colSpan={9} className="px-0">
                        <DetailPanel items={detail?.items ?? []} loading={loadingDetail} type="issue" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot className="sticky bottom-0 bg-[#f4f5f8] border-t-2 border-gray-200">
              <tr>
                <td colSpan={4} className="px-3 py-2 text-[13px] font-bold text-gray-700">Tổng</td>
                <td className="px-3 py-2 text-right text-[13px] font-bold text-gray-800">
                  {fmt(items.reduce((s, i) => s + (i.totalAmount ?? 0), 0))}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-[13px] text-gray-500">Tổng số: <strong className="text-gray-700">{fmt(total)}</strong></span>
        <div className="flex items-center gap-4">
          <PageSizeSelect value={size} onChange={n => { setSize(n); setPage(1); }} />
          <Pager page={page} total={total} size={size} onPage={setPage} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
          <OutboundForm
            issueId={editId}
            onCancel={() => { setShowForm(false); setEditId(undefined); }}
            onSuccess={() => {
              setShowForm(false);
              setEditId(undefined);
              qc.invalidateQueries({ queryKey: ["inventory", "issues"] });
            }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CHUYỂN KHO TAB
// ═══════════════════════════════════════════════════════════
function ChuyenKhoTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ items: InventoryTransferItem[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [confirming, setConfirming] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useInventoryTransfers({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    keyword: search || undefined,
    page: page - 1,
    size,
  });

  const items = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  const loadDetail = useCallback(async (id: number) => {
    if (selectedId === id) { setSelectedId(null); setDetail(null); return; }
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const d = await inventoryApi.getTransferDetail(id);
      setDetail(d);
    } catch { setDetail(null); }
    finally { setLoadingDetail(false); }
  }, [selectedId]);

  const handleConfirm = async (id: number) => {
    setConfirming(id);
    try {
      await inventoryApi.confirmTransfer(id);
      toast.success("Xác nhận phiếu chuyển kho thành công");
      qc.invalidateQueries({ queryKey: ["inventory", "transfers"] });
    } catch (e: any) { toast.error(e?.response?.data?.message ?? "Không thể xác nhận phiếu"); }
    finally { setConfirming(null); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Hủy phiếu chuyển kho này?")) return;
    try {
      await inventoryApi.cancelTransfer(id);
      toast.success("Đã hủy phiếu chuyển kho");
      qc.invalidateQueries({ queryKey: ["inventory", "transfers"] });
      if (selectedId === id) { setSelectedId(null); setDetail(null); }
    } catch (e: any) { toast.error(e?.response?.data?.message ?? "Không thể hủy phiếu"); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm..."
            className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-8 border border-gray-200 rounded px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="DRAFT">Phiếu tạm</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => qc.invalidateQueries({ queryKey: ["inventory", "transfers"] })}
            className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500"><Download className="w-3.5 h-3.5" /></button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500"><Filter className="w-3.5 h-3.5" /></button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500"><Settings2 className="w-3.5 h-3.5" /></button>
          <button
            onClick={() => { setEditId(undefined); setShowForm(true); }}
            className="h-8 flex items-center gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-[13px] font-medium shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Thêm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-[13px] border-collapse">
          <thead className="sticky top-0 z-10 bg-[#f4f5f8] border-b border-gray-200">
            <tr>
              <th className="w-8 px-3 py-2.5"><input type="checkbox" className="rounded" /></th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Ngày hạch toán</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Số chứng từ</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Diễn giải</th>
              <th className="px-3 py-2.5 text-right font-semibold text-gray-600 whitespace-nowrap">Tổng tiền</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Người vận chuyển</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Đối tượng</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Địa chỉ</th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 whitespace-nowrap">TT Phát hành hóa đơn</th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 whitespace-nowrap">Mã DGT cấp</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array(11).fill(0).map((_, j) => (
                    <td key={j} className="px-3 py-2.5"><div className="h-4 bg-gray-200 rounded animate-pulse w-full" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-16 text-gray-400 text-[13px]">Không có dữ liệu</td></tr>
            ) : (
              items.map((item: InventoryTransferSummary) => (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => loadDetail(item.id)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedId === item.id ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-blue-50/20"}`}
                  >
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                    <td className="px-3 py-2.5 text-gray-700">{formatDate(item.accountingDate)}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-blue-700 font-medium hover:underline">{item.transferNo}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[200px] truncate">{item.description ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-800">{fmt(item.totalSaleAmount)}</td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[140px] truncate">{item.carrierName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[160px] truncate">{item.receivingUnitName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-gray-500">—</td>
                    <td className="px-3 py-2.5 text-center"><span className="text-gray-400 text-xs">—</span></td>
                    <td className="px-3 py-2.5 text-center"><span className="text-gray-400 text-xs">—</span></td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {item.status === "DRAFT" && (
                          <button onClick={() => handleConfirm(item.id)} disabled={confirming === item.id}
                            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium">
                            {confirming === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Xác nhận"}
                          </button>
                        )}
                        {item.status !== "CANCELLED" && (
                          <button onClick={() => handleCancel(item.id)} className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium">Hủy</button>
                        )}
                        <button onClick={() => { setEditId(item.id); setShowForm(true); }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium">Xem</button>
                      </div>
                    </td>
                  </tr>
                  {selectedId === item.id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={11} className="px-0">
                        <DetailPanel items={detail?.items ?? []} loading={loadingDetail} type="transfer" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot className="sticky bottom-0 bg-[#f4f5f8] border-t-2 border-gray-200">
              <tr>
                <td colSpan={4} className="px-3 py-2 text-[13px] font-bold text-gray-700">Tổng</td>
                <td className="px-3 py-2 text-right text-[13px] font-bold text-gray-800">
                  {fmt(items.reduce((s, i) => s + (i.totalSaleAmount ?? 0), 0))}
                </td>
                <td colSpan={6} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-[13px] text-gray-500">Tổng số: <strong className="text-gray-700">{fmt(total)}</strong></span>
        <div className="flex items-center gap-4">
          <PageSizeSelect value={size} onChange={n => { setSize(n); setPage(1); }} />
          <Pager page={page} total={total} size={size} onPage={setPage} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
          <TransferForm
            transferId={editId}
            onCancel={() => { setShowForm(false); setEditId(undefined); }}
            onSuccess={() => {
              setShowForm(false);
              setEditId(undefined);
              qc.invalidateQueries({ queryKey: ["inventory", "transfers"] });
            }}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// KIỂM KÊ TAB
// ═══════════════════════════════════════════════════════════
function KiemKeTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ items: InventoryCountItem[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isFetching } = useInventoryCounts({
    page: page - 1,
    pageSize: size,
  });

  const items = data?.items ?? [];
  const total = data?.totalItems ?? 0;

  const loadDetail = useCallback(async (id: number) => {
    if (selectedId === id) { setSelectedId(null); setDetail(null); return; }
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const d = await inventoryApi.getCountDetail(id);
      setDetail(d);
    } catch { setDetail(null); }
    finally { setLoadingDetail(false); }
  }, [selectedId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await inventoryApi.createCount({ branchId: 1 });
      toast.success("Tạo phiếu kiểm kê thành công");
      qc.invalidateQueries({ queryKey: ["inventory", "counts"] });
    } catch (e: any) { toast.error(e?.response?.data?.message ?? "Không thể tạo phiếu kiểm kê"); }
    finally { setCreating(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input placeholder="Tìm kiếm..." className="w-full h-8 pl-8 pr-3 border border-gray-200 rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-teal-400 bg-gray-50" />
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => qc.invalidateQueries({ queryKey: ["inventory", "counts"] })}
            className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500"><Download className="w-3.5 h-3.5" /></button>
          <button onClick={handleCreate} disabled={creating}
            className="h-8 flex items-center gap-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded text-[13px] font-medium shadow-sm disabled:opacity-70">
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Thêm bảng kiểm kê
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-[13px] border-collapse">
          <thead className="sticky top-0 z-10 bg-[#f4f5f8] border-b border-gray-200">
            <tr>
              <th className="w-8 px-3 py-2.5"><input type="checkbox" className="rounded" /></th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Ngày</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Giờ</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Số</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Kiểm kê kho</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Đến ngày</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Mục đích</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Kết luận</th>
              <th className="px-3 py-2.5 text-center font-semibold text-gray-600 whitespace-nowrap">Đã xử lý</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600">Chi nhánh</th>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array(11).fill(0).map((_, j) => (
                    <td key={j} className="px-3 py-2.5"><div className="h-4 bg-gray-200 rounded animate-pulse w-full" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-16 text-gray-400 text-[13px]">Không có dữ liệu kiểm kê</td></tr>
            ) : (
              items.map((item: InventoryCountSummary) => (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => loadDetail(item.id)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedId === item.id ? "bg-teal-50 border-l-2 border-l-teal-500" : "hover:bg-teal-50/20"}`}
                  >
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded" /></td>
                    <td className="px-3 py-2.5 text-gray-700">{formatDate(item.countDate)}</td>
                    <td className="px-3 py-2.5 text-gray-500">{item.countTime ?? "—"}</td>
                    <td className="px-3 py-2.5"><span className="text-teal-700 font-medium">{item.countNo}</span></td>
                    <td className="px-3 py-2.5 text-gray-700">{item.warehouseName ?? "Tất cả"}</td>
                    <td className="px-3 py-2.5 text-gray-600">{formatDate(item.countToDate)}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate">{item.purpose ?? "—"}</td>
                    <td className="px-3 py-2.5 text-gray-600">{item.conclusion ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center">
                      {item.isProcessed ? <CheckCircle2 className="w-4 h-4 text-green-500 inline" /> : <span className="inline-block w-4 h-4 border-2 border-gray-300 rounded-sm" />}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{item.branchName ?? "Chi nhánh " + item.branchId}</td>
                    <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                      <button className="px-2 py-1 text-xs bg-teal-100 hover:bg-teal-200 text-teal-700 rounded font-medium">Xem</button>
                    </td>
                  </tr>
                  {selectedId === item.id && (
                    <tr className="bg-teal-50/30">
                      <td colSpan={11} className="px-0">
                        <CountDetailPanel items={detail?.items ?? []} loading={loadingDetail} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-[13px] text-gray-500">Tổng số: <strong className="text-gray-700">{fmt(total)}</strong></span>
        <div className="flex items-center gap-4">
          <PageSizeSelect value={size} onChange={n => { setSize(n); setPage(1); }} />
          <Pager page={page} total={total} size={size} onPage={setPage} />
        </div>
      </div>
    </div>
  );
}

// ─── Detail panel (inline dòng chi tiết) ─────────────────
function DetailPanel({ items, loading, type }: { items: any[]; loading: boolean; type: "receipt" | "issue" | "transfer" }) {
  if (loading) {
    return (
      <div className="px-8 py-4 flex items-center gap-2 text-gray-500 text-[13px]">
        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chi tiết...
      </div>
    );
  }
  const isTransfer = type === "transfer";
  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chi tiết hàng hóa</span>
        <span className="text-xs text-gray-400">({items.length} dòng)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-gray-200">
              <th className="px-4 py-2 text-left text-gray-500 font-semibold w-8">#</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Mã hàng</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Tên hàng</th>
              {isTransfer ? (
                <>
                  <th className="px-4 py-2 text-left text-gray-500 font-semibold">Xuất tại kho</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-semibold">Nhập tại kho</th>
                </>
              ) : (
                <th className="px-4 py-2 text-left text-gray-500 font-semibold">Kho</th>
              )}
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">TK Nợ</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">TK Có</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">ĐVT</th>
              <th className="px-4 py-2 text-right text-gray-500 font-semibold">Số lượng</th>
              <th className="px-4 py-2 text-right text-gray-500 font-semibold">Đơn giá</th>
              <th className="px-4 py-2 text-right text-gray-500 font-semibold">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={11} className="px-4 py-4 text-center text-gray-400">Không có hàng hóa</td></tr>
            ) : (
              items.map((it: any, idx: number) => (
                <tr key={it.id ?? idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-2 text-blue-700 font-medium">{it.productCode ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-700 max-w-[200px] truncate">{it.productName ?? "—"}</td>
                  {isTransfer ? (
                    <>
                      <td className="px-4 py-2 text-gray-600">{it.fromWarehouseName ?? "—"}</td>
                      <td className="px-4 py-2 text-gray-600">{it.toWarehouseName ?? "—"}</td>
                    </>
                  ) : (
                    <td className="px-4 py-2 text-gray-600">{it.warehouseName ?? "—"}</td>
                  )}
                  <td className="px-4 py-2 text-gray-600 font-mono">{it.debitAccount ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600 font-mono">{it.creditAccount ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{it.unitOfMeasure ?? "—"}</td>
                  <td className="px-4 py-2 text-right text-gray-800 font-medium">{fmt(it.quantity)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{fmt(it.unitCost ?? it.costUnitPrice ?? it.unitPrice ?? 0)}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-800">{fmt(it.lineTotal ?? it.costLineTotal ?? it.saleLineTotal ?? 0)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={8} className="px-4 py-2 font-bold text-gray-600 text-[12px]">Tổng</td>
              <td className="px-4 py-2 text-right font-bold text-gray-800">{fmt(items.reduce((s, i) => s + (i.quantity ?? 0), 0))}</td>
              <td />
              <td className="px-4 py-2 text-right font-bold text-gray-800">
                {fmt(items.reduce((s, i) => s + (i.lineTotal ?? i.costLineTotal ?? i.saleLineTotal ?? 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Count Detail Panel ────────────────────────────────────
function CountDetailPanel({ items, loading }: { items: InventoryCountItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="px-8 py-4 flex items-center gap-2 text-gray-500 text-[13px]">
        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chi tiết...
      </div>
    );
  }
  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chi tiết kiểm kê</span>
        <span className="text-xs text-gray-400">({items.length} dòng)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-gray-200">
              <th className="px-4 py-2 text-left text-gray-500 font-semibold w-8">#</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Mã hàng</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Tên hàng</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Mã kho</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">ĐVT</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Chọn quy cách</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Quy cách 1</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Quy cách 2</th>
              <th className="px-4 py-2 text-left text-gray-500 font-semibold">Quy cách 3</th>
              <th className="px-4 py-2 text-right text-gray-500 font-semibold" colSpan={2}>Số lượng</th>
              <th className="px-4 py-2 text-right text-gray-500 font-semibold">Chênh lệch</th>
            </tr>
            <tr className="bg-[#f9fafb] border-b border-gray-200">
              {Array(9).fill(null).map((_, i) => <th key={i} />)}
              <th className="px-4 py-1 text-right text-gray-400 font-medium text-[11px]">Theo sổ kế toán</th>
              <th className="px-4 py-1 text-right text-gray-400 font-medium text-[11px]">Theo kiểm kê</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={12} className="px-4 py-4 text-center text-gray-400">Không có hàng hóa</td></tr>
            ) : (
              items.map((it, idx) => (
                <tr key={it.id ?? idx} className={`border-b border-gray-100 hover:bg-gray-50/50 ${it.differenceQuantity !== 0 ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-2 text-blue-700 font-medium">{it.productCode ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-700 max-w-[180px] truncate">{it.productName ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{it.warehouseCode ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{it.unitOfMeasure ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-500">{it.variantSpec ?? ""}</td>
                  <td className="px-4 py-2 text-gray-500">{it.spec1 ?? ""}</td>
                  <td className="px-4 py-2 text-gray-500">{it.spec2 ?? ""}</td>
                  <td className="px-4 py-2 text-gray-500">{it.spec3 ?? ""}</td>
                  <td className="px-4 py-2 text-right text-gray-800">{fmt(it.systemQuantity)}</td>
                  <td className="px-4 py-2 text-right text-gray-800">{fmt(it.countedQuantity)}</td>
                  <td className={`px-4 py-2 text-right font-medium ${it.differenceQuantity < 0 ? "text-red-600" : it.differenceQuantity > 0 ? "text-green-600" : "text-gray-500"}`}>
                    {it.differenceQuantity > 0 ? "+" : ""}{fmt(it.differenceQuantity)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={9} className="px-4 py-2 font-bold text-gray-600 text-[12px]">Tổng số: {fmt(items.length)}</td>
              <td className="px-4 py-2 text-right font-bold text-gray-800">{fmt(items.reduce((s, i) => s + (i.systemQuantity ?? 0), 0))}</td>
              <td className="px-4 py-2 text-right font-bold text-gray-800">{fmt(items.reduce((s, i) => s + (i.countedQuantity ?? 0), 0))}</td>
              <td className="px-4 py-2 text-right font-bold text-red-600">
                {(() => { const d = items.reduce((s, i) => s + (i.differenceQuantity ?? 0), 0); return `${d > 0 ? "+" : ""}${fmt(d)}`; })()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BIỂU ĐỒ / DASHBOARD TAB  
// ═══════════════════════════════════════════════════════════
function BieuDoTab() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats panel left */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-gray-600">Số liệu tính đến 8:01</span>
            <span className="text-[13px] text-blue-600 cursor-pointer hover:underline">Tải lại</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">6</div>
                <div className="text-xs text-gray-500">Hàng hóa sắp hết hàng</div>
              </div>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">2837</div>
                <div className="text-xs text-gray-500">Hàng hóa hết hàng</div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Hàng hóa tồn kho</span>
              <span className="text-xs text-gray-400">SL tồn / Trị giá</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-3">17.039 <span className="text-sm font-normal text-gray-500">Triệu đồng</span></div>
            <table className="w-full text-[12px]">
              <tbody className="divide-y divide-gray-50">
                {["Cầu Hộ", "Công tác cơ – Vespa", "Mốc khoa Chuẩn Phát", "Mũ bảo hiểm trùng", "Ắc quy 4 – Xit chìm BV23AH"].map((name, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-1.5 flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-sm ${["bg-green-500","bg-blue-500","bg-purple-500","bg-orange-500","bg-red-500"][i]}`} />
                      <span className="text-gray-700">{name}</span>
                    </td>
                    <td className="py-1.5 text-right font-medium text-gray-800">{["999,981", "10,003", "1,773", "1,115", "950"][i]}</td>
                    <td className="py-1.5 text-right text-gray-500">{["","50","","","0"][i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats panel right */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-gray-600">Số liệu tính đến 8:00</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-blue-600 cursor-pointer hover:underline">Tải lại</span>
              <select className="text-xs border border-gray-200 rounded px-2 py-1">
                <option>Tháng này ▼</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-5">
              <div className="text-xs text-gray-500 mb-1">Vòng quay hàng tồn kho</div>
              <div className="h-16 bg-gradient-to-r from-green-100 to-green-50 rounded flex items-center justify-center">
                <BarChart2 className="w-8 h-8 text-green-300" />
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs text-gray-500 mb-1">Số ngày lưu kho tính bình quân</div>
              <div className="text-2xl font-bold text-blue-600 mt-2">—</div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Hàng hóa sắp hết</div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-1.5 text-left text-gray-400 font-medium">Tên hàng hóa</th>
                  <th className="pb-1.5 text-left text-gray-400 font-medium">Kho</th>
                  <th className="pb-1.5 text-right text-gray-400 font-medium">SL tồn</th>
                  <th className="pb-1.5 text-right text-gray-400 font-medium">SL tồn tối thiểu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {["Bình điện xe máy", "Hộp biến số", "Lốp 100/80-10", "Lốp 14x250", "Lốp 300-10"].map((name, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-1.5 text-gray-700">{name}</td>
                    <td className="py-1.5 text-gray-500">{["XDV-PT","CS2-NT","XDV-PT","XDV-PT","XDV-PT"][i]}</td>
                    <td className="py-1.5 text-right text-gray-800">{["0.00","5.00","2.00","2.00","1.00"][i]}</td>
                    <td className="py-1.5 text-right text-orange-600 font-medium">{["10.00","30.00","3.00","2.00","2.00"][i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quy trình tab ───────────────────────────────────────
function QuyTrinhTab() {
  const process = [
    { label: "Nhận đơn đặt hàng", color: "bg-blue-500", sub: ["Đơn mua hàng"] },
    { label: "Nhập kho", color: "bg-green-500", sub: ["Phiếu nhập kho", "Hóa đơn mua hàng"] },
    { label: "Lưu trữ / Kiểm kê", color: "bg-purple-500", sub: ["Phiếu kiểm kê", "Điều chỉnh kho"] },
    { label: "Xuất kho", color: "bg-orange-500", sub: ["Phiếu xuất kho", "Lệnh sản xuất"] },
    { label: "Giao hàng", color: "bg-teal-500", sub: ["Phiếu chuyển kho"] },
  ];
  return (
    <div className="p-6 flex flex-col items-center">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 w-full max-w-5xl">
        <h2 className="text-center font-bold text-gray-700 mb-10 tracking-wide uppercase text-sm">NGHIỆP VỤ KHO</h2>
        <div className="relative">
          <div className="absolute top-[28px] left-[40px] right-[40px] h-[2px] bg-gray-200 z-0" />
          <div className="relative flex justify-between items-start z-10">
            {process.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-[180px]">
                <div className={`w-14 h-14 rounded-full ${step.color} flex items-center justify-center shadow-md`}>
                  <span className="text-white font-bold text-lg">{i + 1}</span>
                </div>
                <span className="text-[13px] font-semibold text-gray-700 text-center">{step.label}</span>
                <div className="flex flex-col gap-1.5 w-full">
                  {step.sub.map((s, j) => (
                    <div key={j} className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-center text-[12px] text-gray-600 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("nhap-kho");

  return (
    <div className="flex flex-col h-screen bg-[#f4f5f8] overflow-hidden">
      {/* AMIS-style top tab bar */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-3 text-[13px] font-medium border-b-2 transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-green-600 text-green-700 bg-green-50/50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area — fills remaining height */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "quy-trinh"  && <div className="flex-1 overflow-auto"><QuyTrinhTab /></div>}
        {activeTab === "bieu-do"    && <div className="flex-1 overflow-auto"><BieuDoTab /></div>}
        {activeTab === "nhap-kho"   && <NhapKhoTab />}
        {activeTab === "xuat-kho"   && <XuatKhoTab />}
        {activeTab === "chuyen-kho" && <ChuyenKhoTab />}
        {activeTab === "kiem-ke"    && <KiemKeTab />}
        {activeTab === "hang-hoa"   && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[13px]">
            Tính năng đang được phát triển
          </div>
        )}
      </div>
    </div>
  );
}
