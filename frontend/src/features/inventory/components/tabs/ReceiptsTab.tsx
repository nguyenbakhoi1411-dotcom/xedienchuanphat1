'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PurchaseReceiptSummary,
  PurchaseReceiptDetail,
  PurchaseReceiptItem,
} from '@/features/inventory/types';
import {
  RECEIPT_TYPE_LABELS,
  RECEIPT_STATUS_LABELS,
} from '@/features/inventory/types';
import { inventoryApi } from '@/features/inventory/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: PurchaseReceiptSummary['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    CONFIRMED: 'bg-green-100 text-green-800 border border-green-300',
    CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-300',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? ''}`}>
      {RECEIPT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReceiptsTab() {
  // ── State ──
  const [receipts, setReceipts] = useState<PurchaseReceiptSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PurchaseReceiptDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [detailCollapsed, setDetailCollapsed] = useState(false);

  // Dropdown states
  const [filterOpen, setFilterOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);

  // Filter values
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Checkbox
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const allChecked =
    receipts.length > 0 && receipts.every((r) => checkedIds.has(r.id));

  const filterRef = useRef<HTMLDivElement>(null);
  const batchRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // ── Close dropdowns on outside click ──
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (batchRef.current && !batchRef.current.contains(e.target as Node)) setBatchOpen(false);
      if (addRef.current && !addRef.current.contains(e.target as Node)) setAddOpen(false);
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Load list ──
  const loadReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.listReceipts({
        page: page - 1,
        size: pageSize,
        keyword: keyword || undefined,
        status: filterStatus || undefined,
        receiptType: filterType || undefined,
      });
      setReceipts(res.items);
      setTotal(res.totalItems);
    } catch (err) {
      console.error('[ReceiptsTab] loadReceipts error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, filterStatus, filterType]);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  // ── Load detail ──
  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await inventoryApi.getReceiptDetail(id);
      setDetail(res);
    } catch (err) {
      console.error('[ReceiptsTab] loadDetail error:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ── Row click ──
  function handleRowClick(row: PurchaseReceiptSummary) {
    if (selectedId === row.id) {
      setSelectedId(null);
      setDetail(null);
    } else {
      setSelectedId(row.id);
      setDetail(null);
      setDetailCollapsed(false);
      void loadDetail(row.id);
    }
  }

  // ── Checkbox ──
  function toggleCheck(id: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(receipts.map((r) => r.id)));
    }
  }

  // ── Search ──
  function handleSearch() {
    setKeyword(searchInput.trim());
    setPage(1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function renderPaginationPages() {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  // ── Totals ──
  const totalAmount = receipts.reduce((s, r) => s + r.totalAmount, 0);

  // ── Detail item totals ──
  const detailItems: PurchaseReceiptItem[] = detail?.items ?? [];
  const detailTotalQty = detailItems.reduce((s, i) => s + i.quantity, 0);
  const detailTotalAmount = detailItems.reduce((s, i) => s + i.lineTotal, 0);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50 select-none">

      {/* ════ TOOLBAR ════ */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-b border-gray-200 flex-wrap">

        {/* Left group */}
        <div className="flex items-center gap-1.5 flex-wrap">

          {/* Thực hiện hàng loạt */}
          <div className="relative" ref={batchRef}>
            <button
              onClick={() => setBatchOpen((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-700 font-medium"
            >
              Thực hiện hàng loạt
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {batchOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                <button className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">Xác nhận hàng loạt</button>
                <button className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">Huỷ hàng loạt</button>
                <button className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-red-600">Xoá hàng loạt</button>
              </div>
            )}
          </div>

          {/* Lọc */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-700 font-medium"
            >
              Lọc
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {filterOpen && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 p-3 flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Loại chứng từ</label>
                  <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">-- Tất cả --</option>
                    {Object.entries(RECEIPT_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">-- Tất cả --</option>
                    <option value="DRAFT">Phiếu tạm</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="CANCELLED">Đã huỷ</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setFilterType(''); setFilterStatus(''); setPage(1); }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
                  >
                    Xoá lọc
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Kỳ */}
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => setPeriodOpen((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-700 font-medium"
            >
              Đầu năm tới hiện tại
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {periodOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                {['Đầu năm tới hiện tại', 'Tháng này', 'Tháng trước', 'Quý này', 'Toàn bộ'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Search */}
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="px-2.5 py-1.5 text-xs focus:outline-none w-44"
            />
            <button
              onClick={handleSearch}
              className="px-2 py-1.5 border-l border-gray-300 hover:bg-gray-50 text-gray-500"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => void loadReceipts()}
            className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-600"
            title="Tải lại"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Grid view icon */}
          <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-600" title="Tuỳ chỉnh hiển thị">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="2" y="2" width="6" height="6" rx="1" />
              <rect x="12" y="2" width="6" height="6" rx="1" />
              <rect x="2" y="12" width="6" height="6" rx="1" />
              <rect x="12" y="12" width="6" height="6" rx="1" />
            </svg>
          </button>

          {/* Settings */}
          <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 bg-white text-gray-600" title="Cài đặt">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Right group: Thêm buttons */}
        <div className="flex items-center gap-1.5">
          <div className="relative" ref={addRef}>
            <div className="flex items-center">
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-l bg-[#16a34a] hover:bg-[#15803d]"
                onClick={() => {}}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm
              </button>
              <button
                onClick={() => setAddOpen((v) => !v)}
                className="px-1.5 py-1.5 text-xs font-semibold text-white rounded-r bg-[#16a34a] hover:bg-[#15803d] border-l border-green-700"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {addOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
                {Object.entries(RECEIPT_TYPE_LABELS).map(([k, v]) => (
                  <button key={k} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded bg-purple-600 hover:bg-purple-700">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Thêm bằng AI
          </button>
        </div>
      </div>

      {/* ════ CONTENT AREA ════ */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* ── MASTER TABLE ── */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ flex: selectedId !== null && !detailCollapsed ? '0 0 55%' : '1 1 auto' }}
        >
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs border-collapse min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr>
                  <th className="w-8 px-2 py-2 text-center border-b border-gray-200">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                    Ngày hạch toán
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                    Số chứng từ
                  </th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                    Tổng tiền
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                    Đối tượng
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200">
                    Địa chỉ
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                    Loại chứng từ
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                    Chức năng
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && receipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  receipts.map((row) => {
                    const isSelected = selectedId === row.id;
                    const isCancelled = row.status === 'CANCELLED';
                    const isDraft = row.status === 'DRAFT';

                    let rowClass = 'cursor-pointer transition-colors ';
                    if (isSelected) rowClass += 'bg-orange-100 border-l-2 border-orange-500 ';
                    else if (isDraft) rowClass += 'bg-yellow-50 hover:bg-orange-50 ';
                    else rowClass += 'bg-white hover:bg-orange-50 ';

                    return (
                      <tr
                        key={row.id}
                        className={rowClass}
                        onClick={() => handleRowClick(row)}
                      >
                        <td className="px-2 py-2 text-center border-b border-gray-100">
                          <input
                            type="checkbox"
                            checked={checkedIds.has(row.id)}
                            onChange={(e) => { e.stopPropagation(); toggleCheck(row.id); }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded"
                          />
                        </td>
                        <td className={`px-3 py-2 border-b border-gray-100 whitespace-nowrap ${isCancelled ? 'text-slate-400 line-through' : 'text-gray-700'}`}>
                          {fmtDate(row.accountingDate)}
                        </td>
                        <td className={`px-3 py-2 border-b border-gray-100 whitespace-nowrap ${isCancelled ? 'text-slate-400 line-through' : 'text-blue-600 font-medium'}`}>
                          {row.receiptNo}
                        </td>
                        <td className={`px-3 py-2 border-b border-gray-100 text-right whitespace-nowrap ${isCancelled ? 'text-slate-400 line-through' : 'text-gray-800'}`}>
                          {fmt(row.totalAmount)}
                        </td>
                        <td className={`px-3 py-2 border-b border-gray-100 whitespace-nowrap ${isCancelled ? 'text-slate-400 line-through' : 'text-gray-700'}`}>
                          {row.objectName ?? row.supplierName ?? '—'}
                        </td>
                        <td className={`px-3 py-2 border-b border-gray-100 max-w-[180px] truncate ${isCancelled ? 'text-slate-400 line-through' : 'text-gray-600'}`}>
                          {row.objectAddress ?? '—'}
                        </td>
                        <td className={`px-3 py-2 border-b border-gray-100 whitespace-nowrap ${isCancelled ? 'text-slate-400 line-through' : 'text-gray-700'}`}>
                          {RECEIPT_TYPE_LABELS[row.receiptType] ?? row.receiptType}
                        </td>
                        <td className="px-3 py-2 border-b border-gray-100 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
                            className="px-2 py-0.5 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Footer row */}
                {receipts.length > 0 && (
                  <tr className="bg-gray-50 font-semibold sticky bottom-0 z-10">
                    <td className="px-2 py-2 border-t border-gray-300" />
                    <td className="px-3 py-2 border-t border-gray-300 text-gray-700">Tổng</td>
                    <td className="px-3 py-2 border-t border-gray-300" />
                    <td className="px-3 py-2 border-t border-gray-300 text-right text-gray-800">
                      {fmt(totalAmount)}
                    </td>
                    <td className="px-3 py-2 border-t border-gray-300" />
                    <td className="px-3 py-2 border-t border-gray-300" />
                    <td className="px-3 py-2 border-t border-gray-300" />
                    <td className="px-3 py-2 border-t border-gray-300" />
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200 text-xs text-gray-600 flex-wrap gap-2">
            <span>Tổng số: <strong>{total}</strong> bản ghi</span>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-gray-500">20 bản ghi trên 1 trang</span>

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ◀
              </button>

              {renderPaginationPages().map((pg, idx) =>
                pg === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setPage(pg as number)}
                    className={`px-2 py-0.5 border rounded ${
                      page === pg
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* ── DIVIDER + DETAIL PANEL ── */}
        {selectedId !== null && (
          <>
            {/* Toggle handle */}
            <div className="flex items-center justify-between bg-gray-100 border-t border-b border-gray-300 px-3 py-1 select-none">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Chi tiết phiếu nhập kho</span>
                {detail && <StatusBadge status={detail.status} />}
                {detail && (
                  <span className="text-xs text-gray-500">— {detail.receiptNo}</span>
                )}
              </div>
              <button
                onClick={() => setDetailCollapsed((v) => !v)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                {detailCollapsed ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Mở rộng
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Thu gọn
                  </>
                )}
              </button>
            </div>

            {/* Detail panel */}
            {!detailCollapsed && (
              <div
                className="flex flex-col bg-white min-h-0"
                style={{ flex: '0 0 45%' }}
              >
                {detailLoading ? (
                  <div className="flex items-center justify-center flex-1 text-gray-400 py-8">
                    <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tải chi tiết...
                  </div>
                ) : detail === null ? (
                  <div className="flex items-center justify-center flex-1 text-gray-400 py-8">
                    Không tải được dữ liệu chi tiết
                  </div>
                ) : (
                  <>
                    {/* Detail header info */}
                    <div className="flex items-center gap-4 px-3 py-2 border-b border-gray-100 bg-gray-50 text-xs text-gray-600 flex-wrap">
                      {detail.supplierName && (
                        <span>
                          <span className="font-medium">Nhà cung cấp:</span> {detail.supplierName}
                        </span>
                      )}
                      {detail.deliveryPerson && (
                        <span>
                          <span className="font-medium">Người giao:</span> {detail.deliveryPerson}
                        </span>
                      )}
                      {detail.referenceNo && (
                        <span>
                          <span className="font-medium">Số tham chiếu:</span> {detail.referenceNo}
                        </span>
                      )}
                      {detail.description && (
                        <span>
                          <span className="font-medium">Diễn giải:</span> {detail.description}
                        </span>
                      )}
                    </div>

                    {/* Detail table */}
                    <div className="flex-1 overflow-auto min-h-0">
                      <table className="w-full text-xs border-collapse min-w-[1100px]">
                        <thead className="sticky top-0 z-10 bg-gray-100">
                          <tr>
                            {[
                              { label: '#', align: 'text-center', cls: 'w-8' },
                              { label: 'Mã hàng', align: 'text-left' },
                              { label: 'Tên hàng', align: 'text-left' },
                              { label: 'Kho', align: 'text-left' },
                              { label: 'TK Kho (Nợ)', align: 'text-left' },
                              { label: 'TK Công nợ (Có)', align: 'text-left' },
                              { label: 'DVT', align: 'text-left' },
                              { label: 'Số lượng', align: 'text-right' },
                              { label: 'Đơn giá', align: 'text-right' },
                              { label: 'Thành tiền', align: 'text-right' },
                              { label: 'Tỷ lệ CK(%)', align: 'text-right' },
                              { label: 'Tiền CK', align: 'text-right' },
                              { label: 'Chi phí MH', align: 'text-right' },
                              { label: 'Giá trị nhập kho', align: 'text-right' },
                              { label: 'Số lô', align: 'text-left' },
                            ].map((col) => (
                              <th
                                key={col.label}
                                className={`px-2 py-2 font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap ${col.align} ${col.cls ?? ''}`}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {detailItems.length === 0 ? (
                            <tr>
                              <td colSpan={15} className="text-center py-6 text-gray-400">
                                Không có dòng hàng
                              </td>
                            </tr>
                          ) : (
                            detailItems.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-2 py-1.5 text-center border-b border-gray-100 text-gray-500">{idx + 1}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-blue-600 font-medium whitespace-nowrap">{item.productCode}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-gray-700 max-w-[160px] truncate">{item.productName}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-gray-600 whitespace-nowrap">{item.warehouseName ?? '—'}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-gray-600 whitespace-nowrap">{item.debitAccount}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-gray-600 whitespace-nowrap">{item.creditAccount}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-gray-600 whitespace-nowrap">{item.unitOfMeasure ?? '—'}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-right text-gray-700 whitespace-nowrap">{fmt(item.quantity)}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-right text-gray-700 whitespace-nowrap">{fmt(item.unitCost)}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-right text-gray-700 whitespace-nowrap">{fmt(item.lineTotal)}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-right text-gray-700 whitespace-nowrap">{item.discountRate}%</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-right text-gray-700 whitespace-nowrap">{fmt(item.discountAmount)}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-right text-gray-700 whitespace-nowrap">{fmt(item.purchaseCost)}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-right text-gray-700 font-medium whitespace-nowrap">{fmt(item.inventoryValue)}</td>
                                <td className="px-2 py-1.5 border-b border-gray-100 text-gray-600 whitespace-nowrap">{item.lotNo ?? '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Detail footer */}
                    <div className="flex items-center gap-4 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex-wrap">
                      <span>
                        Tổng số: <strong>{detailItems.length}</strong> bản ghi
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>
                        Tổng sl: <strong>{fmt(detailTotalQty)}</strong>
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>
                        Tổng tiền: <strong className="text-gray-800">{fmt(detailTotalAmount)}</strong>
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
