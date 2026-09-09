"use client";

import React, { useState } from 'react';
import { Download, FileSpreadsheet, AlertCircle, Calendar } from 'lucide-react';
import { salesApi } from '@/features/sales/api';
import { toast } from 'sonner';

export default function MisaExportPage() {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!fromDate || !toDate) {
      toast.error('Vui lòng chọn đầy đủ Từ ngày và Đến ngày');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('Từ ngày không được lớn hơn Đến ngày');
      return;
    }

    try {
      setIsExporting(true);
      
      const response = await salesApi.exportMisa(fromDate, toDate);
      
      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MISA_Export_${fromDate}_to_${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success('Đã tải xuống file tích hợp MISA thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xuất dữ liệu MISA. Vui lòng thử lại sau.');
      console.error('MISA Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f5f8] min-h-[calc(100vh-60px)]">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Đối soát & Tích hợp Kế toán MISA</h1>
            <p className="text-sm text-gray-500 mt-0.5">Xuất dữ liệu Hóa đơn, Doanh thu, Công nợ và Thuế chuẩn định dạng MISA SME/AMIS</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex justify-center items-start pt-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Xuất Dữ Liệu Bán Hàng</h2>
            <p className="text-sm text-gray-600">Chọn khoảng thời gian để tải về tệp CSV. File này có thể được Import trực tiếp vào phần mềm MISA thông qua công cụ Nhập Khẩu Từ Excel.</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 flex gap-3 border border-blue-100">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý khi Import vào MISA:</p>
                <ul className="list-disc pl-4 space-y-1 text-blue-700/90">
                  <li>File tải về sử dụng bảng mã UTF-8.</li>
                  <li>Cột TK Nợ mặc định là 131 (Phải thu khách hàng).</li>
                  <li>Cột TK Có mặc định là 5111 (Doanh thu bán hàng hóa).</li>
                  <li>Hệ thống đã tự động tính toán tổng tiền và thuế (TK 33311).</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isExporting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isExporting ? 'Đang kết xuất dữ liệu...' : 'Tải File CSV (MISA)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
