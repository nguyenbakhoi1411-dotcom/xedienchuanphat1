"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, CheckCircle, FilePlus } from 'lucide-react';
import { invoiceApi, InputInvoice } from '@/features/accounting/api/invoiceApi';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';

export function InputInvoicesTab() {
  const [invoices, setInvoices] = useState<InputInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getInputInvoices({ page, limit });
      setInvoices(res.data);
      setTotal(res.total);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách hóa đơn đầu vào');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleApprove = async (id: string) => {
    try {
      await invoiceApi.approveInputInvoice(id);
      toast.success('Duyệt hóa đơn thành công');
      fetchInvoices();
    } catch (error) {
      toast.error('Lỗi khi duyệt hóa đơn');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm hóa đơn NCC..."
            className="pl-10 w-full rounded-md border border-gray-300 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
          <FilePlus className="h-4 w-4" />
          Nhập hóa đơn mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày HĐ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số HĐ NCC</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ký hiệu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên NCC</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-sm">
                    Không có dữ liệu hóa đơn
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(invoice.invoiceDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.supplierInvoiceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.supplierName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={cn(
                        "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full",
                        invoice.status === 'APPROVED' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {invoice.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end">
                        {invoice.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprove(invoice.id)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1 transition-colors"
                            title="Duyệt"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Duyệt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{total === 0 ? 0 : (page - 1) * limit + 1}</span> đến <span className="font-medium">{Math.min(page * limit, total)}</span> trong số <span className="font-medium">{total}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  Trước
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Next</span>
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
