"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Filter,
  Settings2,
  MoreHorizontal,
  RefreshCw,
  Download,
  Pencil,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import type {
  ProductCatalogItem,
  ProductCatalogSummary,
  ProductNature,
} from "@/features/inventory/types";
import { PRODUCT_NATURE_LABELS } from "@/features/inventory/types";
import { inventoryApi } from "@/features/inventory/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(value: number): string {
  if (value === 0) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

type StockStatus = "OUT" | "LOW" | "OK";

function getStockStatus(item: ProductCatalogItem): StockStatus {
  if (item.quantityOnHand === 0) return "OUT";
  if (item.minQuantity > 0 && item.quantityOnHand <= item.minQuantity)
    return "LOW";
  return "OK";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  colorClass: string;
}

function KpiCard({ icon, count, label, colorClass }: KpiCardProps) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-lg border ${colorClass} min-w-[200px]`}
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xl font-bold leading-tight">{formatNumber(count)}</p>
        <p className="text-xs font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Filter Dropdown ─────────────────────────────────────────────────────────

interface FilterDropdownProps {
  natureFilter: string;
  stockFilter: string;
  groupFilter: string;
  groups: string[];
  onNatureChange: (v: string) => void;
  onStockChange: (v: string) => void;
  onGroupChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}

function FilterDropdown({
  natureFilter,
  stockFilter,
  groupFilter,
  groups,
  onNatureChange,
  onStockChange,
  onGroupChange,
  onApply,
  onReset,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const natureOptions: Array<{ value: string; label: string }> = [
    { value: "ALL", label: "Tất cả" },
    ...(Object.keys(PRODUCT_NATURE_LABELS) as ProductNature[]).map((k) => ({
      value: k,
      label: PRODUCT_NATURE_LABELS[k],
    })),
  ];

  const stockOptions = [
    { value: "ALL", label: "Tất cả" },
    { value: "IN_STOCK", label: "Còn hàng" },
    { value: "LOW", label: "Sắp hết" },
    { value: "OUT", label: "Hết hàng" },
  ];

  const hasFilter =
    natureFilter !== "ALL" || stockFilter !== "ALL" || groupFilter !== "ALL";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border transition-colors
          ${
            hasFilter
              ? "border-emerald-500 text-emerald-700 bg-emerald-50 font-semibold"
              : "border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
          }`}
      >
        <Filter className="w-4 h-4" />
        Lọc
        {hasFilter && (
          <span className="ml-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            !
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 w-72 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Bộ lọc
          </p>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tính chất
            </label>
            <select
              value={natureFilter}
              onChange={(e) => onNatureChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md outline-none focus:border-emerald-500"
            >
              {natureOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nhóm VTHH
            </label>
            <select
              value={groupFilter}
              onChange={(e) => onGroupChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Trạng thái tồn
            </label>
            <select
              value={stockFilter}
              onChange={(e) => onStockChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md outline-none focus:border-emerald-500"
            >
              {stockOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onApply();
                setOpen(false);
              }}
              className="flex-1 py-1.5 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
            >
              Áp dụng
            </button>
            <button
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Simple Dropdown Button ───────────────────────────────────────────────────

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

interface DropdownButtonProps {
  label: string;
  items: DropdownItem[];
  icon?: React.ReactNode;
  variant?: "default" | "primary";
}

function DropdownButton({
  label,
  items,
  icon,
  variant = "default",
}: DropdownButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const baseClass =
    variant === "primary"
      ? "flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 rounded border border-emerald-700 hover:bg-emerald-700 transition-colors"
      : "flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-700 bg-white rounded border border-slate-300 hover:bg-slate-50 transition-colors";

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className={baseClass}>
        {icon}
        {label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 min-w-[180px] py-1">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                item.danger ? "text-red-600" : "text-slate-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────

function StockBadge({ status }: { status: StockStatus }) {
  if (status === "OUT")
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 whitespace-nowrap">
        <XCircle className="w-3 h-3" />
        Hết hàng
      </span>
    );
  if (status === "LOW")
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 whitespace-nowrap">
        <AlertTriangle className="w-3 h-3" />
        Sắp hết
      </span>
    );
  return null;
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────

function RowActionMenu({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        title="Chức năng"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 w-44 py-1">
          <button
            onClick={() => {
              console.log("Xem chi tiết", id);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-50"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            Xem chi tiết
          </button>
          <button
            onClick={() => {
              console.log("Chỉnh sửa", id);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="w-4 h-4 text-slate-400" />
            Chỉnh sửa
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => {
              console.log("Xóa", id);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pages: number[] = [];
  const delta = 2;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  pages.push(1);
  if (left > 2) pages.push(-1);
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push(-2);
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-xs text-slate-500">
        Tổng số:{" "}
        <span className="font-semibold text-slate-700">
          {formatNumber(total)}
        </span>{" "}
        bản ghi
      </span>
      <span className="text-xs text-slate-400">|</span>
      <span className="text-xs text-slate-500">
        {pageSize} bản ghi trên 1 trang
      </span>
      <span className="text-xs text-slate-400">|</span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2 py-1 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        {pages.map((p, idx) =>
          p < 0 ? (
            <span key={`e${idx}`} className="px-1 text-slate-400 text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 text-xs rounded border transition-colors ${
                p === page
                  ? "border-emerald-500 bg-emerald-500 text-white font-bold"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-2 py-1 text-xs rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductsTab() {
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [summary, setSummary] = useState<ProductCatalogSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [natureFilter, setNatureFilter] = useState<string>("ALL");
  const [stockFilter, setStockFilter] = useState<string>("ALL");
  const [groups, setGroups] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Pending filter values (applied on "Áp dụng")
  const [pendingNature, setPendingNature] = useState<string>("ALL");
  const [pendingStock, setPendingStock] = useState<string>("ALL");
  const [pendingGroup, setPendingGroup] = useState<string>("ALL");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof inventoryApi.listProducts>[0] = {
        keyword: keyword || undefined,
        productNature: natureFilter !== "ALL" ? natureFilter : undefined,
        productGroup: groupFilter !== "ALL" ? groupFilter : undefined,
        hasStock: stockFilter === "IN_STOCK" ? true : undefined,
        lowStock: stockFilter === "LOW" ? true : undefined,
        outOfStock: stockFilter === "OUT" ? true : undefined,
        page: page - 1,
        size: PAGE_SIZE,
      };
      const res = await inventoryApi.listProducts(params);
      setProducts(res.items);
      setTotal(res.totalItems);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }, [keyword, natureFilter, stockFilter, groupFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    inventoryApi.getProductSummary().then(setSummary).catch(console.error);
    inventoryApi.getProductGroups().then(setGroups).catch(console.error);
  }, []);

  // Selection helpers
  const allIds = products.map((p) => p.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSearch() {
    setKeyword(searchInput.trim());
    setPage(1);
  }

  function handleApplyFilter() {
    setNatureFilter(pendingNature);
    setStockFilter(pendingStock);
    setGroupFilter(pendingGroup);
    setPage(1);
  }

  function handleResetFilter() {
    setPendingNature("ALL");
    setPendingStock("ALL");
    setPendingGroup("ALL");
    setNatureFilter("ALL");
    setStockFilter("ALL");
    setGroupFilter("ALL");
    setPage(1);
  }

  const batchActions: DropdownItem[] = [
    { label: "Xuất Excel", icon: <Download className="w-4 h-4" /> },
    { label: "In danh sách", icon: <RefreshCw className="w-4 h-4" /> },
    {
      label: "Xóa hàng đã chọn",
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
    },
  ];

  const utilityActions: DropdownItem[] = [
    { label: "Xuất Excel", icon: <Download className="w-4 h-4" /> },
    { label: "Làm mới", icon: <RefreshCw className="w-4 h-4" /> },
    { label: "Cài đặt cột", icon: <Settings2 className="w-4 h-4" /> },
  ];

  const addActions: DropdownItem[] = [
    { label: "Thêm hàng hóa", icon: <Plus className="w-4 h-4" /> },
    { label: "Thêm dịch vụ", icon: <Plus className="w-4 h-4" /> },
    { label: "Nhập từ Excel", icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 flex-wrap">
        <KpiCard
          icon={<Package className="w-6 h-6 text-orange-500" />}
          count={summary?.lowStockCount ?? 0}
          label="Hàng hóa sắp hết hàng"
          colorClass="bg-orange-50 border-orange-200 text-orange-600"
        />
        <KpiCard
          icon={<XCircle className="w-6 h-6 text-red-500" />}
          count={summary?.outOfStockCount ?? 0}
          label="Hàng hóa hết hàng"
          colorClass="bg-red-50 border-red-200 text-red-600"
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <DropdownButton label="Thực hiện hàng loạt" items={batchActions} />

        <FilterDropdown
          natureFilter={pendingNature}
          stockFilter={pendingStock}
          groupFilter={pendingGroup}
          groups={groups}
          onNatureChange={setPendingNature}
          onStockChange={setPendingStock}
          onGroupChange={setPendingGroup}
          onApply={handleApplyFilter}
          onReset={handleResetFilter}
        />

        <div className="flex-1" />

        {/* Search */}
        <div className="flex items-center gap-1 border border-slate-300 rounded-md bg-white overflow-hidden px-2 py-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Tìm kiếm hàng hóa..."
            className="text-sm outline-none w-52 placeholder-slate-400"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setKeyword("");
                setPage(1);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        <DropdownButton
          label="Tiện ích"
          items={utilityActions}
          icon={<Settings2 className="w-4 h-4" />}
        />

        <DropdownButton
          label="Thêm"
          items={addActions}
          icon={<Plus className="w-4 h-4" />}
          variant="primary"
        />
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Đang tải dữ liệu...
          </div>
        ) : (
          <table className="w-full text-sm border-collapse min-w-[1400px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-100 text-slate-600">
                <th className="w-9 px-2 py-2.5 border-b border-slate-200 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="rounded accent-emerald-600"
                  />
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-left font-semibold whitespace-nowrap">
                  Tên
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-left font-semibold whitespace-nowrap">
                  Mã
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-left font-semibold whitespace-nowrap">
                  Giảm thuế theo quy định
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-left font-semibold whitespace-nowrap">
                  Tính chất
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-left font-semibold whitespace-nowrap">
                  Nhóm VTHH
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-center font-semibold whitespace-nowrap">
                  Đơn vị tính chính
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-right font-semibold whitespace-nowrap">
                  Số lượng tồn
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-right font-semibold whitespace-nowrap">
                  Giá trị tồn
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-right font-semibold whitespace-nowrap">
                  Số lượng tồn tối thiểu
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-left font-semibold whitespace-nowrap">
                  Mô tả
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-left font-semibold whitespace-nowrap">
                  Kho mặc định
                </th>
                <th className="px-3 py-2.5 border-b border-slate-200 text-center font-semibold whitespace-nowrap">
                  TK KI
                </th>
                <th className="w-12 px-2 py-2.5 border-b border-slate-200 text-center font-semibold whitespace-nowrap">
                  Chức năng
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="text-center py-16 text-slate-400"
                  >
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">Không có dữ liệu hàng hóa</p>
                    <p className="text-xs mt-1">
                      Thêm hàng hóa mới hoặc thay đổi bộ lọc
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => {
                  const stockStatus = getStockStatus(product);
                  const isSelected = selectedIds.has(product.id);
                  const qtyClass =
                    stockStatus === "OUT"
                      ? "text-red-500 font-semibold"
                      : stockStatus === "LOW"
                      ? "text-yellow-600 font-semibold"
                      : "text-slate-800";

                  return (
                    <tr
                      key={product.id}
                      className={`group border-b border-slate-100 transition-colors ${
                        isSelected
                          ? "bg-emerald-50"
                          : idx % 2 === 0
                          ? "bg-white hover:bg-slate-50"
                          : "bg-slate-50/60 hover:bg-slate-100/60"
                      }`}
                    >
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded accent-emerald-600"
                        />
                      </td>

                      {/* Tên */}
                      <td className="px-3 py-2 max-w-[200px]">
                        <div className="flex items-start gap-1.5">
                          <span className="font-medium text-slate-800 leading-snug line-clamp-2">
                            {product.productName}
                          </span>
                        </div>
                        {stockStatus !== "OK" && (
                          <div className="mt-1">
                            <StockBadge status={stockStatus} />
                          </div>
                        )}
                      </td>

                      {/* Mã */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {product.productCode}
                        </span>
                      </td>

                      {/* Giảm thuế */}
                      <td className="px-3 py-2 text-slate-600 text-xs whitespace-nowrap">
                        {product.taxReductionCode ?? (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Tính chất */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                          {PRODUCT_NATURE_LABELS[product.productNature]}
                        </span>
                      </td>

                      {/* Nhóm VTHH */}
                      <td className="px-3 py-2 text-slate-600 text-xs whitespace-nowrap">
                        {product.productGroup ?? (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Đơn vị tính chính */}
                      <td className="px-3 py-2 text-center text-slate-600 text-xs whitespace-nowrap">
                        {product.unitOfMeasure ?? (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Số lượng tồn */}
                      <td
                        className={`px-3 py-2 text-right whitespace-nowrap tabular-nums ${qtyClass}`}
                      >
                        {formatNumber(product.quantityOnHand)}
                      </td>

                      {/* Giá trị tồn */}
                      <td className="px-3 py-2 text-right whitespace-nowrap text-slate-700 font-medium tabular-nums">
                        {formatVND(product.stockValue)}
                      </td>

                      {/* Số lượng tồn tối thiểu */}
                      <td className="px-3 py-2 text-right whitespace-nowrap text-slate-500 text-xs tabular-nums">
                        {product.minQuantity > 0 ? (
                          formatNumber(product.minQuantity)
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Mô tả */}
                      <td className="px-3 py-2 text-slate-500 text-xs max-w-[160px]">
                        <span className="line-clamp-2">
                          {product.description ?? (
                            <span className="text-slate-300">—</span>
                          )}
                        </span>
                      </td>

                      {/* Kho mặc định */}
                      <td className="px-3 py-2 text-slate-600 text-xs whitespace-nowrap">
                        {product.defaultWarehouseName ?? (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* TK KI */}
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {product.inventoryAccountCode ? (
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {product.inventoryAccountCode}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Chức năng */}
                      <td className="px-2 py-2">
                        <RowActionMenu id={product.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────── */}
      <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-500">
          {selectedIds.size > 0 && (
            <span className="text-emerald-600 font-semibold mr-4">
              Đã chọn {selectedIds.size} bản ghi
            </span>
          )}
        </div>
        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => {
            setPage(p);
            setSelectedIds(new Set());
          }}
        />
      </div>
    </div>
  );
}
