"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ClipboardList,
  X,
} from "lucide-react";
import type {
  InventoryCountSummary,
  InventoryCountDetail,
  InventoryCountItem,
} from "@/features/inventory/types";
import { inventoryApi } from "@/features/inventory/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtQty(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

// ─── sub-components ──────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Trang đầu"
      >
        <ChevronsLeft className="w-4 h-4 text-slate-600" />
      </button>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Trang trước"
      >
        <ChevronLeft className="w-4 h-4 text-slate-600" />
      </button>
      <span className="px-3 py-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Trang sau"
      >
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Trang cuối"
      >
        <ChevronsRight className="w-4 h-4 text-slate-600" />
      </button>
    </div>
  );
}

// ─── detail footer aggregates ────────────────────────────────────────────────

function computeDetailTotals(items: InventoryCountItem[]) {
  const totalSystem = items.reduce((s, i) => s + i.systemQuantity, 0);
  const totalCounted = items.reduce((s, i) => s + i.countedQuantity, 0);
  const totalDiff = items.reduce((s, i) => s + i.differenceQuantity, 0);
  return { totalSystem, totalCounted, totalDiff };
}

// ─── main component ──────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export function StocktakeTab() {
  // ── master state ──
  const [counts, setCounts] = useState<InventoryCountSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ── detail state ──
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<InventoryCountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── fetch master list ──
  const fetchCounts = useCallback(async (p: number, _kw: string) => {
    setLoading(true);
    try {
      const res = await inventoryApi.listCounts({
        page: p - 1,
        pageSize: PAGE_SIZE,
      });
      setCounts(res.items);
      setTotal(res.totalItems);
    } catch {
      setCounts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts(page, keyword);
  }, [fetchCounts, page, keyword]);

  // ── fetch detail ──
  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    inventoryApi
      .getCountDetail(selectedId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // ── handlers ──
  const handleSearch = () => {
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRowClick = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === counts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(counts.map((c) => c.id)));
    }
  };

  const toggleSelectRow = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = counts.length > 0 && selectedIds.size === counts.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < counts.length;

  // ── detail aggregates ──
  const { totalSystem, totalCounted, totalDiff } = detail
    ? computeDetailTotals(detail.items)
    : { totalSystem: 0, totalCounted: 0, totalDiff: 0 };

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* ── TOOLBAR ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded shadow-sm transition-colors"
            title="Thêm bảng kiểm kê mới"
          >
            <Plus className="w-4 h-4" />
            Thêm bảng kiểm kê
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 w-52"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Tìm kiếm
          </button>
          {/* Filter */}
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 transition-colors">
            Lọc
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── BODY: master + detail ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ── MASTER TABLE ── */}
        <div
          className={`bg-white border-b border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            selectedId !== null ? "flex-[0_0_42%]" : "flex-1"
          }`}
        >
          {/* table scroll area */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[1100px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleSelectAll}
                      className="accent-emerald-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Ngày
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Giờ
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Số chứng từ
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Kiểm kê kho
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Đến ngày
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Mục đích
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Kết luận
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-600 whitespace-nowrap">
                    Đã xử lý
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                    Chi nhánh
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-600 whitespace-nowrap">
                    Chức năng
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" />
                      <span className="text-slate-400 text-sm">Đang tải...</span>
                    </td>
                  </tr>
                ) : counts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center">
                      <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-slate-400 text-sm">
                        Không có dữ liệu kiểm kê
                      </span>
                    </td>
                  </tr>
                ) : (
                  counts.map((row) => {
                    const isSelected = selectedId === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row.id)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-orange-50 border-l-2 border-l-orange-500"
                            : "hover:bg-slate-50 border-l-2 border-l-transparent"
                        }`}
                      >
                        {/* checkbox */}
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(row.id)}
                            onClick={(e) => toggleSelectRow(e, row.id)}
                            onChange={() => {}}
                            className="accent-emerald-600 cursor-pointer"
                          />
                        </td>
                        {/* Ngày */}
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                          {formatDate(row.countDate)}
                        </td>
                        {/* Giờ */}
                        <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                          {row.countTime ?? "—"}
                        </td>
                        {/* Số chứng từ */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="font-medium text-emerald-700">
                            {row.countNo}
                          </span>
                        </td>
                        {/* Kiểm kê kho */}
                        <td className="px-3 py-2 text-slate-700 max-w-[160px] truncate">
                          {row.warehouseName ?? "—"}
                        </td>
                        {/* Đến ngày */}
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700">
                          {row.countToDate ? formatDate(row.countToDate) : "—"}
                        </td>
                        {/* Mục đích */}
                        <td className="px-3 py-2 text-slate-600 max-w-[160px] truncate">
                          {row.purpose ?? "—"}
                        </td>
                        {/* Kết luận */}
                        <td className="px-3 py-2 text-slate-600 max-w-[160px] truncate">
                          {row.conclusion ?? "—"}
                        </td>
                        {/* Đã xử lý */}
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.isProcessed}
                            readOnly
                            className="accent-emerald-600 cursor-default pointer-events-none"
                          />
                        </td>
                        {/* Chi nhánh */}
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                          {row.branchName ?? String(row.branchId)}
                        </td>
                        {/* Chức năng */}
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* master footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 flex items-center justify-between gap-4 shrink-0">
            <span className="text-xs text-slate-500">
              Tổng số:{" "}
              <span className="font-semibold text-slate-700">{total}</span> bản
              ghi
            </span>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>

        {/* ── DETAIL PANEL ── */}
        {selectedId !== null && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white border-t-2 border-orange-400 min-h-0">
            {/* detail header */}
            <div className="flex items-center justify-between px-4 py-2 bg-orange-50 border-b border-orange-200 shrink-0">
              <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Chi tiết kiểm kê&nbsp;
                <span className="font-mono">
                  #{detail?.countNo ?? selectedId}
                </span>
              </h3>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1 rounded hover:bg-orange-200 text-orange-600 transition-colors"
                title="Đóng chi tiết"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* detail body */}
            <div className="flex-1 overflow-auto">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                  <span className="text-slate-400 text-sm">
                    Đang tải chi tiết...
                  </span>
                </div>
              ) : !detail || detail.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <ClipboardList className="w-8 h-8 text-slate-300" />
                  <span className="text-slate-400 text-sm">
                    Không có hàng hóa trong đợt kiểm kê này
                  </span>
                </div>
              ) : (
                <table className="w-full text-xs border-collapse min-w-[900px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="w-8 px-2 py-2 text-center font-semibold text-slate-600">
                        #
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                        Mã hàng
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                        Tên hàng
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                        Mã kho
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-slate-600 whitespace-nowrap">
                        DVT
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">
                        Quy cách
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-blue-700 whitespace-nowrap bg-blue-50 border-x border-blue-100">
                        SL theo sổ KT
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-violet-700 whitespace-nowrap bg-violet-50 border-x border-violet-100">
                        SL theo KK
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-600 whitespace-nowrap">
                        Chênh lệch
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item: InventoryCountItem, idx: number) => {
                      const diff = item.differenceQuantity;
                      const diffClass =
                        diff > 0
                          ? "text-green-600 font-semibold"
                          : diff < 0
                          ? "text-red-500 font-semibold"
                          : "text-slate-400";

                      const quyCach =
                        item.variantSpec ??
                        ([
                          item.spec1,
                          item.spec2,
                          item.spec3,
                          item.spec4,
                          item.spec5,
                        ]
                          .filter(Boolean)
                          .join(" / ") || "—");

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-2 py-1.5 text-center text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-slate-700 whitespace-nowrap">
                            {item.productCode}
                          </td>
                          <td className="px-3 py-1.5 text-slate-700 max-w-[200px] truncate">
                            {item.productName}
                          </td>
                          <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                            {item.warehouseCode ?? "—"}
                          </td>
                          <td className="px-3 py-1.5 text-center text-slate-600 whitespace-nowrap">
                            {item.unitOfMeasure ?? "—"}
                          </td>
                          <td className="px-3 py-1.5 text-slate-500">
                            {quyCach}
                          </td>
                          <td className="px-3 py-1.5 text-right bg-blue-50 border-x border-blue-100 font-mono text-blue-800">
                            {fmtQty(item.systemQuantity)}
                          </td>
                          <td className="px-3 py-1.5 text-right bg-violet-50 border-x border-violet-100 font-mono text-violet-800">
                            {fmtQty(item.countedQuantity)}
                          </td>
                          <td className={`px-3 py-1.5 text-right font-mono ${diffClass}`}>
                            {diff > 0 ? `+${fmtQty(diff)}` : fmtQty(diff)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* detail footer */}
            {detail && detail.items.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 flex items-center justify-between gap-4 shrink-0 text-xs">
                <span className="text-slate-500">
                  Tổng số:{" "}
                  <span className="font-semibold text-slate-700">
                    {detail.items.length}
                  </span>{" "}
                  bản ghi
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-700">
                    Tổng theo sổ KT:{" "}
                    <span className="font-semibold font-mono">
                      {fmtQty(totalSystem)}
                    </span>
                  </span>
                  <span className="text-violet-700">
                    Tổng theo KK:{" "}
                    <span className="font-semibold font-mono">
                      {fmtQty(totalCounted)}
                    </span>
                  </span>
                  <span className="text-slate-600">
                    Tổng chênh lệch:{" "}
                    <span
                      className={`font-semibold font-mono ${
                        totalDiff < 0
                          ? "text-red-500"
                          : totalDiff > 0
                          ? "text-green-600"
                          : "text-slate-400"
                      }`}
                    >
                      {totalDiff > 0
                        ? `+${fmtQty(totalDiff)}`
                        : fmtQty(totalDiff)}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
