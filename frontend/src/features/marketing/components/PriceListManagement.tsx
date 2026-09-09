"use client";

import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, FileEdit, Trash2, Tag, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PriceList } from './types';

const MOCK_DATA: PriceList[] = [
  { id: '1', maBangGia: 'BG001', tenBangGia: 'Bảng giá bán lẻ 2026', loaiBangGia: 'BAN_LE', apDungTu: '2026-01-01', apDungDen: '2026-12-31', trangThai: 'DANG_AP_DUNG' },
  { id: '2', maBangGia: 'BG002', tenBangGia: 'Đại lý cấp 1', loaiBangGia: 'DAI_LY', apDungTu: '2026-06-01', trangThai: 'DANG_AP_DUNG' },
  { id: '3', maBangGia: 'BG003', tenBangGia: 'Khuyến mãi Hè', loaiBangGia: 'KHUYEN_MAI', apDungTu: '2026-07-01', apDungDen: '2026-08-31', trangThai: 'CHUA_AP_DUNG' },
  { id: '4', maBangGia: 'BG004', tenBangGia: 'Thanh lý tồn kho', loaiBangGia: 'BAN_BUON', apDungTu: '2025-01-01', apDungDen: '2025-12-31', trangThai: 'HET_HAN' },
];

export function PriceListManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: PriceList['trangThai']) => {
    switch (status) {
      case 'DANG_AP_DUNG':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Đang áp dụng</span>;
      case 'CHUA_AP_DUNG':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Chưa áp dụng</span>;
      case 'HET_HAN':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200"><AlertCircle className="w-3.5 h-3.5" /> Hết hạn</span>;
      case 'NGUNG_AP_DUNG':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"><Trash2 className="w-3.5 h-3.5" /> Ngưng áp dụng</span>;
    }
  };

  const getTypeLabel = (type: PriceList['loaiBangGia']) => {
    switch (type) {
      case 'BAN_LE': return 'Bán lẻ';
      case 'BAN_BUON': return 'Bán buôn';
      case 'DAI_LY': return 'Đại lý';
      case 'KHUYEN_MAI': return 'Khuyến mãi';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50/50 min-h-full rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Quản lý Bảng giá
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập và quản lý các chính sách giá cho sản phẩm
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] transition-all active:scale-[0.98]">
          <Plus className="w-5 h-5" />
          <span>Tạo bảng giá mới</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm kiếm theo mã, tên bảng giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <Filter className="w-4 h-4" />
          <span>Lọc kết quả</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-sm font-medium text-slate-600">
                <th className="px-6 py-4">Mã bảng giá</th>
                <th className="px-6 py-4">Tên bảng giá</th>
                <th className="px-6 py-4">Loại bảng giá</th>
                <th className="px-6 py-4">Thời gian áp dụng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DATA.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{row.maBangGia}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{row.tenBangGia}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      {getTypeLabel(row.loaiBangGia)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{row.apDungTu}</span>
                      {row.apDungDen && (
                        <>
                          <span className="text-slate-300">→</span>
                          <span>{row.apDungDen}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(row.trangThai)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Thêm">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị 1 - {MOCK_DATA.length} của {MOCK_DATA.length} kết quả</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Trước</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
