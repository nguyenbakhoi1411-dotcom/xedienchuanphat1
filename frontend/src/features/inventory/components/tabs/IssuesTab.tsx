"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  Search,
  RefreshCw,
  Filter,
  Sparkles,
  Plus,
  Settings2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type {
  GoodsIssueSummary,
  GoodsIssueDetail,
  GoodsIssueItem,
  IssueStatus,
} from "@/features/inventory/types";
import {
  ISSUE_TYPE_LABELS,
  ISSUE_STATUS_LABELS,
} from "@/features/inventory/types";
import { inventoryApi } from "@/features/inventory/api";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const vnd = (n: number): string => new Intl.NumberFormat("vi-VN").format(n);

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function rowBgClass(
  status: IssueStatus,
  selected: boolean,
  hovered: boolean
): string {
  if (selected) return "bg-orange-100 border-l-2 border-orange-500";
  if (hovered) return "bg-orange-50";
  if (status === "DRAFT") return "bg-yellow-50";
  return "bg-white";
}

function rowTextClass(status: IssueStatus): string {
  if (status === "CANCELLED") return "text-slate-400 line-through";
  return "text-slate-700";
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

interface DropdownButtonProps {
  label: string;
  variant?: "default" | "primary" | "purple";
  icon?: React.ReactNode;
}

function DropdownButton({ label, variant = "default", icon }: DropdownButtonProps) {
  const base =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap select-none cursor-pointer";
  const styles: Record<string, string> = {
    default:
      "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400",
    primary:
      "bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600",
    purple:
      "bg-violet-600 border-violet-600 text-white hover:bg-violet-700 hover:border-violet-700",
  };
  return (
    <button type="button" className={`${base} ${styles[variant]}`}>
      {icon && icon}
      {label}
      <ChevronDown className="w-3 h-3 opacity-70" />
    </button>
  );
}

interface StatusBadgeProps {
  status: IssueStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<IssueStatus, string> = {
    DRAFT:
      "bg-yellow-100 text-yellow-700 border border-yellow-300",
    ISSUED:
      "bg-emerald-100 text-emerald-700 border border-emerald-300",
    CANCELLED:
      "bg-slate-100 text-slate-500 border border-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status]}`}
    >
      {ISSUE_STATUS_LABELS[status]}
    </span>
  );
}

interface InvoiceIssuedCellProps {
  issued: boolean;
}

function InvoiceIssuedCell({ issued }: InvoiceIssuedCellProps) {
  if (issued) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
        Da lap du
      </span>
    );
  }
  return <span className="text-orange-500 text-xs font-medium">Chua lap</span>;
}

// ─────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────

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
    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-white text-xs text-slate-500 shrink-0">
      <span>
        Hien thi {from}–{to} / {vnd(totalItems)} ban ghi
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p =
            totalPages <= 5
              ? i + 1
              : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-6 h-6 rounded text-[11px] font-medium ${
                p === page
                  ? "bg-orange-500 text-white"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Detail Panel
// ─────────────────────────────────────────────────────────────────

interface DetailPanelProps {
  detail: GoodsIssueDetail | null;
  loading: boolean;
}

function DetailPanel({ detail, loading }: DetailPanelProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white border-t border-slate-200">
        <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
        <span className="ml-2 text-sm text-slate-500">Dang tai chi tiet...</span>
      </div>
    );
  }
  if (!detail) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 border-t border-slate-200 shrink-0"
        style={{ height: "120px" }}
      >
        <span className="text-sm text-slate-400">
          Chon mot chung tu de xem chi tiet
        </span>
      </div>
    );
  }

  const items: GoodsIssueItem[] = detail.items ?? [];
  const totalCost = items.reduce((s, i) => s + i.lineTotal, 0);

  return (
    <div
      className="flex flex-col border-t border-slate-200 bg-white shrink-0"
      style={{ height: "280px" }}
    >
      {/* Detail Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <span className="text-xs font-semibold text-slate-600">
          Chi tiet phieu xuat — {detail.issueNo}
        </span>
        <span className="text-xs text-slate-400">{items.length} dong hang</span>
      </div>

      {/* Detail Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 text-slate-600">
              <th className="px-2 py-2 text-center font-semibold border-b border-r border-slate-200 w-8">
                #
              </th>
              <th className="px-3 py-2 text-left font-semibold border-b border-r border-slate-200 w-28">
                Ma hang
              </th>
              <th className="px-3 py-2 text-left font-semibold border-b border-r border-slate-200 min-w-[160px]">
                Ten hang
              </th>
              <th className="px-3 py-2 text-left font-semibold border-b border-r border-slate-200 w-28">
                Kho
              </th>
              <th className="px-3 py-2 text-center font-semibold border-b border-r border-slate-200 w-20">
                TK gia von
              </th>
              <th className="px-3 py-2 text-center font-semibold border-b border-r border-slate-200 w-20">
                TK kho
              </th>
              <th className="px-3 py-2 text-center font-semibold border-b border-r border-slate-200 w-16">
                DVT
              </th>
              <th className="px-3 py-2 text-right font-semibold border-b border-r border-slate-200 w-20">
                So luong
              </th>
              <th className="px-3 py-2 text-right font-semibold border-b border-r border-slate-200 w-28">
                Don gia von
              </th>
              <th className="px-3 py-2 text-right font-semibold border-b border-slate-200 w-28">
                Tien von
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-slate-400">
                  Khong co dong hang
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-orange-50 transition-colors`}
                >
                  <td className="px-2 py-1.5 text-center text-slate-500 border-r border-slate-100">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-slate-700 border-r border-slate-100">
                    {item.productCode}
                  </td>
                  <td className="px-3 py-1.5 text-slate-700 border-r border-slate-100">
                    {item.productName}
                    {item.variantSpec && (
                      <span className="ml-1 text-slate-400">
                        ({item.variantSpec})
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-slate-600 border-r border-slate-100">
                    {item.warehouseName ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-center font-mono text-slate-600 border-r border-slate-100">
                    {item.creditAccount}
                  </td>
                  <td className="px-3 py-1.5 text-center font-mono text-slate-600 border-r border-slate-100">
                    {item.debitAccount}
                  </td>
                  <td className="px-3 py-1.5 text-center text-slate-600 border-r border-slate-100">
                    {item.unitOfMeasure ?? "—"}
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-700 border-r border-slate-100">
                    {vnd(item.quantity)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-slate-700 border-r border-slate-100">
                    {vnd(item.unitCost)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold text-slate-800">
                    {vnd(item.lineTotal)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="bg-orange-50 border-t-2 border-orange-200 font-semibold text-slate-800">
                <td colSpan={7} className="px-3 py-2 text-right text-xs">
                  Tong cong
                </td>
                <td className="px-3 py-2 text-right text-xs border-l border-slate-200">
                  {vnd(items.reduce((s, i) => s + i.quantity, 0))}
                </td>
                <td className="px-3 py-2 border-l border-slate-200" />
                <td className="px-3 py-2 text-right text-xs border-l border-slate-200">
                  {vnd(totalCost)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export function IssuesTab() {
  const [issues, setIssues] = useState<GoodsIssueSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GoodsIssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [allChecked, setAllChecked] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const totalAmount = issues.reduce((s, r) => s + r.totalAmount, 0);

  // ── Fetch master list ─────────────────────────────────
  const fetchIssues = useCallback(
    async (p: number, kw: string) => {
      setLoading(true);
      try {
        const res = await inventoryApi.listIssues({
          keyword: kw || undefined,
          page: p,
          size: PAGE_SIZE,
        });
        setIssues(res.items);
        setTotal(res.totalItems);
      } catch (err) {
        console.error("Failed to load issues:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchIssues(page, keyword);
  }, [page, keyword, fetchIssues]);

  // ── Fetch detail ──────────────────────────────────────
  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    inventoryApi
      .getIssueDetail(selectedId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((err) => {
        console.error("Failed to load issue detail:", err);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // ── Handlers ──────────────────────────────────────────
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  }

  function handlePageChange(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
    setCheckedIds(new Set());
    setAllChecked(false);
  }

  function handleRowClick(id: number) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleCheckRow(id: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCheckAll() {
    if (allChecked) {
      setCheckedIds(new Set());
      setAllChecked(false);
    } else {
      setCheckedIds(new Set(issues.map((i) => i.id)));
      setAllChecked(true);
    }
  }

  function handleRefresh() {
    fetchIssues(page, keyword);
  }

  // ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* ── TOOLBAR ────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-2 space-y-2">
        {/* Row 1 */}
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownButton label="Thuc hien hang loat" />
          <DropdownButton
            label="Loc"
            icon={<Filter className="w-3 h-3" />}
          />
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border bg-white border-slate-300 text-slate-700 cursor-pointer hover:bg-slate-50 select-none">
            <span>Dau nam toi hien tai</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </div>
          <div className="flex-1" />
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tim kiem chung tu..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded outline-none focus:border-orange-400 w-52 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 text-slate-700"
            >
              Tim
            </button>
          </form>
          <button
            onClick={handleRefresh}
            type="button"
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-500"
            title="Lam moi"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownButton
            label="Tien ich"
            icon={<Settings2 className="w-3 h-3" />}
          />
          <div className="flex-1" />
          <DropdownButton
            label="Them"
            variant="primary"
            icon={<Plus className="w-3 h-3" />}
          />
          <DropdownButton
            label="Them bang AI"
            variant="purple"
            icon={<Sparkles className="w-3 h-3" />}
          />
        </div>
      </div>

      {/* ── BODY: Master + Detail ───────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Master Table */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs border-collapse min-w-[1200px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <th className="w-9 px-2 py-2.5 border-r border-slate-200">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={handleCheckAll}
                      className="rounded border-slate-400 accent-orange-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-slate-200 whitespace-nowrap w-28">
                    Ngay hach toan
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-slate-200 whitespace-nowrap w-28">
                    So chung tu
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-slate-200 min-w-[160px]">
                    Dien giai
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold border-r border-slate-200 whitespace-nowrap w-32">
                    Tong tien
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-slate-200 whitespace-nowrap w-32">
                    Nguoi nhan
                  </th>
                  <th className="px-3 py-2.5 text-center font-semibold border-r border-slate-200 whitespace-nowrap w-32">
                    Da lap CT ban hang
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-slate-200 whitespace-nowrap w-36">
                    TT Phat hanh hoa don
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-slate-200 whitespace-nowrap w-28">
                    Ma CQT cap
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold border-r border-slate-200 whitespace-nowrap w-28">
                    Loai chung tu
                  </th>
                  <th className="px-3 py-2.5 text-center font-semibold border-r border-slate-200 whitespace-nowrap w-28">
                    Xu ly HD khong
                  </th>
                  <th className="px-3 py-2.5 text-center font-semibold whitespace-nowrap w-20">
                    Chuc nang
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                        <span className="text-sm">Dang tai du lieu...</span>
                      </div>
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="py-16 text-center text-slate-400 text-sm"
                    >
                      Khong co chung tu xuat kho
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => {
                    const isSelected = selectedId === issue.id;
                    const isHovered = hoveredId === issue.id;
                    const isChecked = checkedIds.has(issue.id);

                    return (
                      <tr
                        key={issue.id}
                        onClick={() => handleRowClick(issue.id)}
                        onMouseEnter={() => setHoveredId(issue.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={[
                          "border-b border-slate-100 cursor-pointer transition-colors",
                          rowBgClass(issue.status, isSelected, isHovered),
                          rowTextClass(issue.status),
                        ].join(" ")}
                      >
                        {/* Checkbox */}
                        <td
                          className="w-9 px-2 py-2 text-center border-r border-slate-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckRow(issue.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckRow(issue.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-slate-400 accent-orange-500 cursor-pointer"
                          />
                        </td>

                        {/* Ngay hach toan */}
                        <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap">
                          {formatDate(issue.accountingDate)}
                        </td>

                        {/* So chung tu */}
                        <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              issue.status !== "CANCELLED"
                                ? "text-orange-600"
                                : ""
                            }`}
                          >
                            {issue.issueNo}
                          </span>
                        </td>

                        {/* Dien giai */}
                        <td className="px-3 py-2 border-r border-slate-100 max-w-[200px] truncate">
                          {issue.description ?? "—"}
                        </td>

                        {/* Tong tien */}
                        <td className="px-3 py-2 border-r border-slate-100 text-right font-semibold whitespace-nowrap">
                          {vnd(issue.totalAmount)}
                        </td>

                        {/* Nguoi nhan */}
                        <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap">
                          {issue.receiverName ?? issue.customerName ?? "—"}
                        </td>

                        {/* Da lap CT ban hang */}
                        <td className="px-3 py-2 border-r border-slate-100 text-center">
                          <InvoiceIssuedCell issued={issue.invoiceIssued} />
                        </td>

                        {/* TT Phat hanh hoa don */}
                        <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap">
                          {issue.invoiceStatus ? (
                            <span
                              className={`text-xs ${
                                issue.invoiceStatus
                                  .toLowerCase()
                                  .includes("phat hanh")
                                  ? "text-emerald-600 font-medium"
                                  : "text-slate-500"
                              }`}
                            >
                              {issue.invoiceStatus}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Ma CQT cap */}
                        <td className="px-3 py-2 border-r border-slate-100 font-mono whitespace-nowrap">
                          {issue.taxAuthorityCode ?? (
                            <span className="text-slate-400 font-normal">
                              —
                            </span>
                          )}
                        </td>

                        {/* Loai chung tu */}
                        <td className="px-3 py-2 border-r border-slate-100 whitespace-nowrap">
                          {ISSUE_TYPE_LABELS[issue.issueType]}
                        </td>

                        {/* Xu ly HD khong */}
                        <td className="px-3 py-2 border-r border-slate-100 text-center text-slate-400">
                          —
                        </td>

                        {/* Chuc nang / Status */}
                        <td
                          className="px-3 py-2 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <StatusBadge status={issue.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Footer totals */}
              {!loading && issues.length > 0 && (
                <tfoot>
                  <tr className="bg-orange-50 border-t-2 border-orange-200 text-slate-800 font-semibold sticky bottom-0 z-10">
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 text-right border-r border-slate-200 text-xs">
                      Tong
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 text-right border-r border-slate-200 whitespace-nowrap text-xs">
                      {vnd(totalAmount)}
                    </td>
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2 border-r border-slate-200" />
                    <td className="px-3 py-2" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {!loading && total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Detail Panel */}
        <DetailPanel detail={detail} loading={detailLoading} />
      </div>
    </div>
  );
}
