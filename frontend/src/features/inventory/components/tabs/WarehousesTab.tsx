"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Warehouse, Plus, Search, RefreshCw, Settings2,
  CheckCircle2, XCircle, Filter, Building2
} from 'lucide-react';
import { inventoryApi } from '@/features/inventory/api';

const fmt = (s: string | null | undefined) => s || '—';

interface WarehouseRow {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  branchId: number;
  type: string;
  status: string;
  locationAisle: string | null;
  locationShelf: string | null;
  locationBin: string | null;
  description: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  MAIN: 'Kho chính',
  TRANSIT: 'Kho trung chuyển',
  CONSIGNMENT: 'Kho ký gửi',
  RETURN: 'Kho trả hàng',
  VIRTUAL: 'Kho ảo',
};

const TYPE_COLORS: Record<string, string> = {
  MAIN: 'bg-blue-100 text-blue-700',
  TRANSIT: 'bg-orange-100 text-orange-700',
  CONSIGNMENT: 'bg-purple-100 text-purple-700',
  RETURN: 'bg-red-100 text-red-700',
  VIRTUAL: 'bg-gray-100 text-gray-600',
};

export function WarehousesTab() {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const PAGE_SIZE = 30;

  const load = useCallback(async (p = 1, kw = keyword) => {
    setLoading(true);
    try {
      const data = await inventoryApi.listWarehouses({ page: p - 1, size: PAGE_SIZE, keyword: kw });
      const items = (data.items as WarehouseRow[])
        .filter((w: WarehouseRow) => !statusFilter || w.status === statusFilter)
        .filter((w: WarehouseRow) => !typeFilter || w.type === typeFilter);
      setWarehouses(items);
      setTotal(data.totalItems ?? 0);
      setPage(p);
    } catch {
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, typeFilter]);

  useEffect(() => { load(1); }, [load]);

  const handleSearch = () => {
    setKeyword(searchInput);
    load(1, searchInput);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 space-y-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter buttons */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
            <Filter className="h-3.5 w-3.5" />
            Lọc
          </button>

          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); load(1); }}
            className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-blue-400 text-gray-600"
          >
            <option value="">Tất cả loại kho</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); load(1); }}
            className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-white outline-none focus:border-blue-400 text-gray-600"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang dùng</option>
            <option value="INACTIVE">Ngừng dùng</option>
          </select>

          <div className="flex-1" />

          {/* Search */}
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm kho..."
              className="px-3 py-1.5 text-sm outline-none w-52"
            />
            <button onClick={handleSearch} className="px-2 py-1.5 text-gray-400 hover:text-blue-600 border-l border-gray-300">
              <Search className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => load(page)}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600">
            <Settings2 className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium">
            <Plus className="h-3.5 w-3.5" />
            Thêm kho
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs w-8">#</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs min-w-[100px]">
                Mã kho
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs min-w-[200px]">
                Tên kho
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs">
                Loại kho
              </th>
              <th className="text-center px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs">
                Trạng thái
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs">
                Dãy / Ke
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs">
                Ô / Vị trí
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs">
                Mô tả
              </th>
              <th className="text-center px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 text-xs">
                Chức năng
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && warehouses.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Đang tải...
                </td>
              </tr>
            ) : warehouses.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-400">
                  <Warehouse className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">Chưa có kho nào</p>
                  <p className="text-sm mt-1">Nhấn "Thêm kho" để tạo kho mới</p>
                </td>
              </tr>
            ) : (
              warehouses.map((w, i) => (
                <tr
                  key={w.id}
                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-3 py-2.5 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-orange-600 font-medium text-xs">
                      {w.warehouseCode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span className="text-gray-800 font-medium">{w.warehouseName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      TYPE_COLORS[w.type] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {TYPE_LABELS[w.type] ?? w.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {w.status === 'ACTIVE' ? (
                      <span title="Đang dùng">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      </span>
                    ) : (
                      <span title="Ngừng dùng">
                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">
                    {w.locationAisle ? `${w.locationAisle}${w.locationShelf ? ' / ' + w.locationShelf : ''}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{fmt(w.locationBin)}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs max-w-[180px] truncate" title={w.description ?? undefined}>
                    {fmt(w.description)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-center">
                      <button className="text-xs text-blue-600 hover:underline px-1.5 py-0.5 rounded hover:bg-blue-50">
                        Sửa
                      </button>
                      <button className="text-xs text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="text-xs text-gray-500">
          Tổng: <span className="font-semibold text-gray-700">{total}</span> kho
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => load(1)}
              disabled={page === 1}
              className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              «
            </button>
            <button
              onClick={() => load(page - 1)}
              disabled={page <= 1}
              className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => load(p)}
                className={`px-2 py-1 text-xs border rounded ${
                  p === page ? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages}
              className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              ›
            </button>
            <button
              onClick={() => load(totalPages)}
              disabled={page >= totalPages}
              className="px-2 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
            >
              »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
