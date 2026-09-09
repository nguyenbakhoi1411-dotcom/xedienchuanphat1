"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, Settings, ChevronDown, CheckCircle2, Box } from 'lucide-react';
import { salesApi } from '@/features/sales/api';
import type { Product } from '@/features/sales/types';
import { toast } from 'sonner';

function fmt(n: number | null | undefined) {
  if (n == null) return '0,00';
  return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const availableQty = (p: Product) => p.availableQuantity ?? p.available ?? 0;
const minimumQty = (p: Product) => p.minimumQuantity ?? p.minStock ?? 0;
const unitPrice = (p: Product) => p.unitPrice ?? p.avgCost ?? 0;

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const loadData = () => {
    setLoading(true);
    salesApi.listProducts({ keyword, size: 50 })
      .then(res => {
        setProducts(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch(err => toast.error('Lỗi tải hàng hóa: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') loadData();
  };

  // Mock aggregates
  const totalSoLuong = products.reduce((acc, curr) => acc + availableQty(curr), 0);
  const totalGiaTri = products.reduce((acc, curr) => acc + unitPrice(curr) * availableQty(curr), 0);

  const getStockStatus = (p: Product) => {
    const avail = availableQty(p);
    const min = minimumQty(p);
    
    if (avail <= 0) {
      return { class: 'text-red-600 font-bold', badge: <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] ml-2 font-bold uppercase">Hết hàng</span> };
    }
    if (avail > 0 && avail <= min) {
      return { class: 'text-amber-600 font-bold', badge: <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] ml-2 font-bold uppercase">Sắp hết</span> };
    }
    return { class: 'text-emerald-600 font-medium', badge: null };
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* TOP KPI CARDS */}
      <div className="p-4 shrink-0 border-b bg-white">
        <div className="grid grid-cols-2 gap-6 w-1/2">
          <div className="bg-white p-4 border rounded shadow-sm border-l-4 border-l-orange-500 flex justify-between items-start cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">0 Hàng hóa</div>
                <div className="text-sm font-bold text-gray-700 uppercase mt-1 tracking-wide">Sắp hết hàng</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm border-l-4 border-l-red-500 flex justify-between items-start cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">2820 Hàng hóa</div>
                <div className="text-sm font-bold text-gray-700 uppercase mt-1 tracking-wide">Hết hàng</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 border-b bg-white shrink-0 mt-2">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            ↓ Thực hiện hàng loạt <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            Lọc <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nhập từ khóa tìm kiếm" 
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
          </div>
          <button onClick={loadData} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Nạp">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Xuất khẩu">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Tùy chỉnh">
            <Settings className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded font-medium text-sm text-gray-700 transition-colors">
            Tiện ích <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <button className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors shadow-sm">
            Thêm <ChevronDown className="w-4 h-4 ml-1 border-l border-green-500 pl-1" />
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="flex-1 overflow-auto flex flex-col relative bg-white">
        <div className="min-w-max border-b flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-700 bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-center w-10"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></th>
                <th className="px-3 py-2 font-semibold">Tên</th>
                <th className="px-3 py-2 font-semibold">Mã</th>
                <th className="px-3 py-2 font-semibold text-center" title="Giảm thuế theo quy định">Giảm thuế...</th>
                <th className="px-3 py-2 font-semibold">Tính chất</th>
                <th className="px-3 py-2 font-semibold">Nhóm VTHH</th>
                <th className="px-3 py-2 font-semibold">Đơn vị tính chính</th>
                <th className="px-3 py-2 font-semibold text-right">Số lượng tồn</th>
                <th className="px-3 py-2 font-semibold text-right">Giá trị tồn</th>
                <th className="px-3 py-2 font-semibold text-right">SL tồn tối thiểu</th>
                <th className="px-3 py-2 font-semibold">Mô tả</th>
                <th className="px-3 py-2 font-semibold">Kho ngầm định</th>
                <th className="px-3 py-2 font-semibold">TK kho</th>
                <th className="px-3 py-2 font-semibold text-center sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => {
                const stock = getStockStatus(p);
                const isService = p.itemType === 'Dịch vụ';
                return (
                  <tr key={p.id ?? p.productId} className="hover:bg-blue-50 transition-colors bg-white">
                    <td className="px-3 py-2 text-center"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></td>
                    <td className="px-3 py-2 font-medium text-gray-800">{p.productName}</td>
                    <td className="px-3 py-2 text-gray-600">{p.productCode}</td>
                    <td className="px-3 py-2 text-center">
                      <CheckCircle2 className="w-4 h-4 mx-auto text-green-500" />
                    </td>
                    <td className="px-3 py-2 text-gray-700">{p.itemType || 'Hàng hóa'}</td>
                    <td className="px-3 py-2 text-gray-600">{p.itemGroup || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{p.unit ?? p.mainUnit ?? '-'}</td>
                    <td className={`px-3 py-2 text-right flex items-center justify-end`}>
                      {isService ? '-' : <span className={stock.class}>{fmt(availableQty(p))}</span>}
                      {!isService && stock.badge}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-700">{isService ? '-' : fmt(unitPrice(p) * availableQty(p))}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{isService ? '-' : fmt(minimumQty(p))}</td>
                    <td className="px-3 py-2 text-gray-500 truncate max-w-[150px]">{p.description || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">Kho hàng hóa</td>
                    <td className="px-3 py-2 font-mono text-sm text-gray-500">1561</td>
                    <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">
                      <button className="text-blue-600 font-medium hover:underline flex items-center justify-center w-full gap-1">
                        Sửa <ChevronDown className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
            {products.length > 0 && (
              <tfoot className="bg-gray-50 font-bold sticky bottom-0 z-10 border-t border-gray-300">
                <tr>
                  <td colSpan={7} className="px-3 py-2 text-center">Tổng</td>
                  <td className="px-3 py-2 text-right">Số lượng: {fmt(totalSoLuong)}</td>
                  <td className="px-3 py-2 text-right">Giá trị: {fmt(totalGiaTri)}</td>
                  <td colSpan={5} className="px-3 py-2 sticky right-0 bg-gray-50 border-l shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-3 border-t bg-white shrink-0">
          <div className="text-sm text-gray-600">Tổng số: <span className="font-bold text-gray-800">{totalElements}</span> bản ghi</div>
        </div>
      </div>
    </div>
  );
}
