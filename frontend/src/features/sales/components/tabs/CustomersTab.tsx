"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, Settings, ChevronDown, ArrowLeft } from 'lucide-react';
import { salesApi } from '@/features/sales/api';
import { toast } from 'sonner';

function fmt(n: number | null | undefined) {
  if (n == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const loadData = () => {
    setLoading(true);
    salesApi.listCustomers({ keyword, size: 50 })
      .then(res => {
        setCustomers(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch(err => toast.error('Lỗi tải khách hàng: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') loadData();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 shrink-0 border-b bg-white">
        <div className="flex items-center text-sm text-blue-600 mb-4 cursor-pointer hover:underline font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Tất cả danh mục
        </div>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-2">
          <div className="bg-white p-4 border rounded shadow-sm border-b-4 border-b-red-500 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-600 font-medium mb-1">Nợ quá hạn</div>
              <div className="text-2xl font-bold text-red-600">0 đ</div>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm border-b-4 border-b-orange-500 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-600 font-medium mb-1">Tổng nợ phải thu</div>
              <div className="text-2xl font-bold text-orange-600">16.882.747.154 đ</div>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="bg-white p-4 border rounded shadow-sm border-b-4 border-b-green-500 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-600 font-medium mb-1">Đã thanh toán (30 ngày gần đây)</div>
              <div className="text-2xl font-bold text-green-600">2.058.191.896 đ</div>
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
              placeholder="Tìm kiếm..." 
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
          <button className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded font-medium text-sm text-gray-700 transition-colors">
            Cập nhật địa chỉ
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
                <th className="px-3 py-2 font-semibold">Mã khách hàng</th>
                <th className="px-3 py-2 font-semibold">Tên khách hàng</th>
                <th className="px-3 py-2 font-semibold">Địa chỉ</th>
                <th className="px-3 py-2 font-semibold text-right">Công nợ</th>
                <th className="px-3 py-2 font-semibold">Mã số thuế/CCCD chủ hộ</th>
                <th className="px-3 py-2 font-semibold">Điện thoại</th>
                <th className="px-3 py-2 font-semibold">DT di động NLH</th>
                <th className="px-3 py-2 font-semibold text-center">Là Đối tượng nội bộ</th>
                <th className="px-3 py-2 font-semibold text-center sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((c) => {
                const debt = c.debt || 0;
                return (
                  <tr key={c.id} className="hover:bg-blue-50 transition-colors bg-white">
                    <td className="px-3 py-2 text-center"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></td>
                    <td className="px-3 py-2 text-blue-600 font-medium hover:underline cursor-pointer">{c.customerCode}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{c.customerName}</td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[200px]" title={c.address || ''}>{c.address || '-'}</td>
                    <td className={`px-3 py-2 text-right ${debt > 0 ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                      {fmt(debt)}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{c.taxCode || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{c.phone || '-'}</td>
                    <td className="px-3 py-2 text-gray-600">{c.mobilePhone || '-'}</td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={false} readOnly className="rounded text-gray-400" />
                    </td>
                    <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">
                      <button className="text-blue-600 font-medium hover:underline flex items-center justify-center w-full gap-1">
                        {debt > 0 ? 'Thu tiền' : 'Lập CT bán hàng'} <ChevronDown className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
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
