"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  LayoutGrid,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";

import type {
  InventoryTransferSummary,
  InventoryTransferDetail,
  InventoryTransferItem,
} from "@/features/inventory/types";
import {
  TRANSFER_TYPE_LABELS,
  TRANSFER_STATUS_LABELS,
} from "@/features/inventory/types";
import { inventoryApi } from "@/features/inventory/api";

// ─── helpers ──────────────────────────────────────────────────────────────────

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function fmtVnd(value: number): string {
  return VND.format(value);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return iso.slice(0, 10).split("-").reverse().join("/");
}

// ─── Status badge ──────────────────────────────────────────────────────────────

type TransferStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

interface StatusBadgeProps {
  status: TransferStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<TransferStatus, { label: string; cls: string }> = {
    DRAFT: {
      label: TRANSFER_STATUS_LABELS.DRAFT,
      cls: "bg-amber-100 text-amber-700 border border-amber-300",
    },
    CONFIRMED: {
      label: TRANSFER_STATUS_LABELS.CONFIRMED,
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    },
    CANCELLED: {
      label: TRANSFER_STATUS_LABELS.CANCELLED,
      cls: "bg-slate-100 text-slate-500 border border-slate-300",
    },
  };
  const { label, cls } = map[status] ?? map.DRAFT;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Dropdown button ───────────────────────────────────────────────────────────

interface DropdownBtnProps {
  label: string;
  variant?: "default" | "primary";
}

function DropdownBtn({ label, variant = "default" }: DropdownBtnProps) {
  const base =
    "inline-flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded border whitespace-nowrap select-none";
  const cls =
    variant === "primary"
      ? `${base} bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700`
      : `${base} bg-white hover:bg-slate-50 text-slate-700 border-slate-300`;
  return (
    <button className={cls}>
      {label}
      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
    </button>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-slate-50 text-[12px] text-slate-600 shrink-0">
      <span>
        {totalItems === 0
          ? "Không có dữ liệu"
          : `${from}–${to} / ${totalItems} bản ghi`}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
          title="Trang đầu"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
          title="Trang trước"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2">
          Trang {page}/{totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
          title="Trang sau"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
          title="Trang cuối"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ListState {
  items: InventoryTransferSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface FilterState {
  keyword: string;
  status: string;
  transferType: string;
  fromDate: string;
  toDate: string;
}

const PAGE_SIZE = 20;

function getYearStart(): string {
  const y = new Date().getFullYear();
  return `${y}-01-01`;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TransfersTab() {
  // ── list state ──
  const [listState, setListState] = useState<ListState>({
    items: [],
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    loading: false,
    error: null,
  });

  // ── filter state ──
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    status: "",
    transferType: "",
    fromDate: getYearStart(),
    toDate: getToday(),
  });

  const [keywordInput, setKeywordInput] = useState("");

  // ── selected master row ──
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  // ── detail state ──
  const [detail, setDetail] = useState<InventoryTransferDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(true);

  // ── abort ref ──
  const abortRef = useRef<AbortController | null>(null);

  // ── fetch list ──
  const fetchList = useCallback(
    async (page: number, overrideFilters?: FilterState) => {
      const f = overrideFilters ?? filters;
      setListState((prev) => ({ ...prev, loading: true, error: null }));
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await inventoryApi.listTransfers({
          fromDate: f.fromDate || undefined,
          toDate: f.toDate || undefined,
          status: f.status || undefined,
          transferType: f.transferType || undefined,
          keyword: f.keyword || undefined,
          page: page - 1,
          size: PAGE_SIZE,
        });

        setListState({
          items: res.items,
          page: res.page + 1,
          pageSize: res.pageSize,
          totalItems: res.totalItems,
          totalPages: res.totalPages,
          loading: false,
          error: null,
        });

        // auto-select first row on initial load
        setSelectedId((prev) => {
          if (prev === null && res.items.length > 0) return res.items[0].id;
          return prev;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setListState((prev) => ({
          ...prev,
          loading: false,
          error: "Không thể tải danh sách chuyển kho.",
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  );

  useEffect(() => {
    void fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── fetch detail ──
  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setDetail(null);

    inventoryApi
      .getTransferDetail(selectedId)
      .then((d) => {
        setDetail(d);
        setDetailLoading(false);
      })
      .catch(() => {
        setDetailLoading(false);
      });
  }, [selectedId]);

  // ── handlers ──
  const handlePageChange = (p: number) => {
    void fetchList(p);
  };

  const handleSearch = () => {
    const newFilters: FilterState = { ...filters, keyword: keywordInput.trim() };
    setFilters(newFilters);
    void fetchList(1, newFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRefresh = () => {
    void fetchList(listState.page);
  };

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      setCheckedIds(new Set(listState.items.map((i) => i.id)));
    } else {
      setCheckedIds(new Set());
    }
  };

  const handleCheckOne = (id: number, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // ── totals ──
  const totalSaleAmount = listState.items.reduce(
    (sum, r) => sum + r.totalSaleAmount,
    0
  );

  const allChecked =
    listState.items.length > 0 &&
    listState.items.every((i) => checkedIds.has(i.id));

  // ── row class helper ──
  const rowCls = (row: InventoryTransferSummary): string => {
    const isSelected = row.id === selectedId;
    const base = "cursor-pointer border-b border-slate-100 text-[13px] transition-colors";
    if (isSelected)
      return `${base} bg-orange-100 border-l-2 border-l-orange-500`;
    if (row.status === "CANCELLED")
      return `${base} text-slate-400 line-through`;
    if (row.status === "DRAFT") return `${base} bg-yellow-50 hover:bg-yellow-100`;
    return `${base} hover:bg-slate-50`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* ── TOOLBAR ── */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex flex-col gap-2 shrink-0">
        {/* Row 1 */}
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownBtn label="Thực hiện hàng loạt" />
          <DropdownBtn label="Lọc" />

          {/* Date range */}
          <div className="flex items-center gap-1 border border-slate-300 rounded px-2 py-1 bg-white text-[13px] text-slate-700">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, fromDate: e.target.value }))
              }
              className="outline-none bg-transparent w-[110px] text-[13px]"
            />
            <span className="text-slate-400 mx-0.5">–</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, toDate: e.target.value }))
              }
              className="outline-none bg-transparent w-[110px] text-[13px]"
            />
          </div>

          {/* Transfer type quick filter */}
          <select
            value={filters.transferType}
            onChange={(e) => {
              const nf: FilterState = { ...filters, transferType: e.target.value };
              setFilters(nf);
              void fetchList(1, nf);
            }}
            className="px-2 py-1.5 text-[13px] border border-slate-300 rounded bg-white outline-none text-slate-700"
          >
            <option value="">Tất cả loại</option>
            {(
              Object.entries(TRANSFER_TYPE_LABELS) as [
                string,
                string
              ][]
            ).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-7 pr-7 py-1.5 text-[13px] border border-slate-300 rounded bg-white outline-none focus:border-emerald-500 w-56"
            />
            {keywordInput && (
              <button
                onClick={() => {
                  setKeywordInput("");
                  const nf: FilterState = { ...filters, keyword: "" };
                  setFilters(nf);
                  void fetchList(1, nf);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600"
            title="Làm mới"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownBtn label="Tiện ích" />
          <DropdownBtn label="Thêm" variant="primary" />
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded border border-violet-300 bg-violet-50 hover:bg-violet-100 text-violet-700 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5" />
            Thêm bằng AI
          </button>
          <div className="flex-1" />
          <button
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600"
            title="Cài đặt cột"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600"
            title="Bộ lọc nâng cao"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── BODY: Master + Detail ── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* ── MASTER TABLE ── */}
        <div
          className={`overflow-auto bg-white ${
            selectedId !== null && showDetail ? "h-[55%]" : "flex-1"
          } border-b border-slate-200`}
        >
          {listState.error && (
            <div className="p-4 text-sm text-red-600 flex items-center gap-2">
              <X className="w-4 h-4" />
              {listState.error}
            </div>
          )}

          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="w-9 px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => handleCheckAll(e.target.checked)}
                    className="accent-emerald-600 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  Ngày hạch toán
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  Số chứng từ
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600">
                  Diễn giải
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 text-right whitespace-nowrap">
                  Tổng tiền
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  Người vận chuyển
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  Đối tượng
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  Địa chỉ
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  TT Phát hành hóa đơn
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                  Mã CQT cấp
                </th>
                <th className="px-3 py-2 text-[12px] font-semibold text-slate-600 whitespace-nowrap text-center">
                  Chức năng
                </th>
              </tr>
            </thead>

            <tbody>
              {listState.loading && (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-10 text-sm text-slate-500"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    Đang tải...
                  </td>
                </tr>
              )}

              {!listState.loading && listState.items.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-10 text-sm text-slate-400"
                  >
                    <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Không có chứng từ chuyển kho
                  </td>
                </tr>
              )}

              {!listState.loading &&
                listState.items.map((row) => (
                  <tr
                    key={row.id}
                    className={rowCls(row)}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td
                      className="px-2 py-1.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={checkedIds.has(row.id)}
                        onChange={(e) =>
                          handleCheckOne(row.id, e.target.checked)
                        }
                        className="accent-emerald-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {fmtDate(row.accountingDate ?? row.transferDate)}
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <span className="text-emerald-700 font-medium hover:underline cursor-pointer">
                        {row.transferNo}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 max-w-[220px] truncate text-slate-700">
                      {row.description ?? (
                        <span className="italic text-slate-400">
                          {TRANSFER_TYPE_LABELS[row.transferType]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-slate-800 whitespace-nowrap">
                      {fmtVnd(row.totalSaleAmount)}
                    </td>
                    <td className="px-3 py-1.5 text-slate-700 whitespace-nowrap">
                      {row.carrierName ?? "—"}
                    </td>
                    <td className="px-3 py-1.5 text-slate-700 whitespace-nowrap">
                      {row.receivingUnitName ?? "—"}
                    </td>
                    {/* Địa chỉ — available in detail only; show dash in list */}
                    <td className="px-3 py-1.5 text-slate-500 max-w-[140px] truncate">
                      —
                    </td>
                    {/* TT Phát hành hóa đơn → status badge */}
                    <td className="px-3 py-1.5">
                      <StatusBadge status={row.status as TransferStatus} />
                    </td>
                    {/* Mã CQT cấp */}
                    <td className="px-3 py-1.5 text-slate-400 text-[12px]">—</td>
                    {/* Chức năng */}
                    <td
                      className="px-3 py-1.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="px-2 py-0.5 text-[12px] rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600">
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>

            {/* Footer totals */}
            {!listState.loading && listState.items.length > 0 && (
              <tfoot className="sticky bottom-0 bg-slate-100 border-t border-slate-300">
                <tr>
                  <td className="px-2 py-1.5" />
                  <td
                    colSpan={2}
                    className="px-3 py-1.5 text-[12px] font-semibold text-slate-600"
                  >
                    Tổng ({listState.items.length} chứng từ)
                  </td>
                  <td className="px-3 py-1.5" />
                  <td className="px-3 py-1.5 text-right font-semibold font-mono text-slate-800 text-[13px]">
                    {fmtVnd(totalSaleAmount)}
                  </td>
                  <td colSpan={6} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* ── PAGINATION ── */}
        <Pagination
          page={listState.page}
          totalPages={listState.totalPages}
          totalItems={listState.totalItems}
          pageSize={listState.pageSize}
          onPageChange={handlePageChange}
        />

        {/* ── RESIZER ── */}
        {selectedId !== null && (
          <div className="h-[3px] bg-slate-200 hover:bg-emerald-400 cursor-row-resize transition-colors shrink-0" />
        )}

        {/* ── DETAIL PANEL ── */}
        {selectedId !== null && (
          <div
            className={`bg-white border-t border-slate-200 flex flex-col overflow-hidden shrink-0 ${
              showDetail ? "flex-1 min-h-[200px]" : "h-9"
            }`}
          >
            {/* Detail header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 border-b border-slate-200 shrink-0">
              <span className="text-[13px] font-semibold text-slate-700">
                Chi tiết phiếu chuyển kho
                {detail && (
                  <span className="ml-2 text-emerald-700 font-mono">
                    {detail.transferNo}
                  </span>
                )}
              </span>
              <button
                onClick={() => setShowDetail((v) => !v)}
                className="p-1 rounded hover:bg-slate-200 text-slate-500"
                title={showDetail ? "Thu gọn" : "Mở rộng"}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showDetail ? "" : "rotate-180"
                  }`}
                />
              </button>
            </div>

            {showDetail && (
              <div className="flex-1 overflow-auto">
                {detailLoading && (
                  <div className="flex items-center justify-center py-6 text-sm text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Đang tải chi tiết...
                  </div>
                )}

                {!detailLoading && !detail && (
                  <div className="flex items-center justify-center py-6 text-sm text-slate-400">
                    Chọn một chứng từ để xem chi tiết
                  </div>
                )}

                {!detailLoading && detail && (
                  <table className="w-full text-left border-collapse text-[12px] min-w-[960px]">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-1.5 text-center w-8 font-semibold text-slate-600">
                          #
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap">
                          Mã hàng
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600">
                          Tên hàng
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap">
                          Xuất tại kho
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap">
                          Nhập tại kho
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap">
                          TK Nợ
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap">
                          TK Có
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap text-center">
                          DVT
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap text-right">
                          Số lượng
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap text-right">
                          Đơn giá
                        </th>
                        <th className="px-3 py-1.5 font-semibold text-slate-600 whitespace-nowrap text-right">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {detail.items.length === 0 && (
                        <tr>
                          <td
                            colSpan={11}
                            className="text-center py-6 text-slate-400 italic"
                          >
                            Không có dòng chi tiết
                          </td>
                        </tr>
                      )}

                      {detail.items.map(
                        (item: InventoryTransferItem, idx: number) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-2 py-1.5 text-center text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-1.5 font-medium text-emerald-700 whitespace-nowrap">
                              {item.productCode}
                            </td>
                            <td className="px-3 py-1.5 text-slate-700 max-w-[200px] truncate">
                              {item.productName}
                              {item.variantSpec && (
                                <span className="ml-1 text-slate-400 text-[11px]">
                                  ({item.variantSpec})
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                              {item.fromWarehouseName ?? "—"}
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                              {item.toWarehouseName ?? "—"}
                            </td>
                            <td className="px-3 py-1.5 text-slate-700 font-mono">
                              {item.debitAccount ?? "—"}
                            </td>
                            <td className="px-3 py-1.5 text-slate-700 font-mono">
                              {item.creditAccount ?? "—"}
                            </td>
                            <td className="px-3 py-1.5 text-center text-slate-600">
                              {item.unitOfMeasure ?? "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono text-slate-800">
                              {item.quantity.toLocaleString("vi-VN")}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono text-slate-800">
                              {fmtVnd(item.saleUnitPrice)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono font-semibold text-slate-800">
                              {fmtVnd(item.saleLineTotal)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                    {detail.items.length > 0 && (
                      <tfoot className="sticky bottom-0 bg-slate-50 border-t border-slate-200 font-semibold">
                        <tr>
                          <td
                            colSpan={8}
                            className="px-3 py-1.5 text-[12px] text-slate-600"
                          >
                            Tổng ({detail.items.length} dòng)
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-slate-800">
                            {detail.items
                              .reduce((s, i) => s + i.quantity, 0)
                              .toLocaleString("vi-VN")}
                          </td>
                          <td className="px-3 py-1.5" />
                          <td className="px-3 py-1.5 text-right font-mono text-slate-800">
                            {fmtVnd(
                              detail.items.reduce(
                                (s, i) => s + i.saleLineTotal,
                                0
                              )
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
