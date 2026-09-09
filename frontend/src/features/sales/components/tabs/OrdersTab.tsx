"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, Settings, ChevronDown, Zap, X } from 'lucide-react';
import { salesApi } from '@/features/sales/api';
import type { SalesOrder } from '@/features/sales/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function fmt(n: number | null | undefined) {
  if (n == null) return '0,00';
  return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN');
}

export function OrdersTab() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SalesOrder | null>(null);
  const [keyword, setKeyword] = useState('');
  const router = useRouter();

  const loadData = () => {
    setLoading(true);
    salesApi.listOrders({ keyword, size: 20 })
      .then(res => {
        setOrders(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch(err => toast.error('Lỗi tải đơn đặt hàng: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') loadData();
  };

  const totalGiaTriDonHang = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalDaXuatHD = orders.reduce((acc, curr) => acc + (curr.invoicedAmount || 0), 0);
  const totalThucThu = orders.reduce((acc, curr) => acc + (curr.collectedAmount || 0), 0);
  const totalConPhaiThu = orders.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);

  const getRevenueBadge = (status: string) => {
    if (status === 'RECORDED') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Đã ghi doanh số</span>;
    if (status === 'PARTIAL') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Ghi một phần</span>;
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">Chưa ghi doanh số</span>;
  };

  const getInvoiceBadge = (status: string) => {
    if (status === 'ISSUED') return <span className="text-green-600 font-medium text-sm">Đã xuất HĐ</span>;
    if (status === 'READY') return <span className="text-orange-500 font-medium text-sm">Chưa xuất HĐ</span>;
    return <span className="text-red-500 font-medium text-sm">Chưa xuất HĐ</span>;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'DRAFT') return 'Chưa thực hiện';
    if (status === 'CONFIRMED') return 'Đang thực hiện';
    if (status === 'COMPLETED') return 'Hoàn thành';
    if (status === 'CANCELLED') return 'Đã hủy';
    return status;
  };

  const handleActionClick = (e: React.MouseEvent, order: SalesOrder) => {
    e.stopPropagation();
    if (order.status === 'DRAFT') {
      salesApi.recordRevenue(order.id).then(() => {
        toast.success('Đã ghi doanh số!');
        loadData();
      }).catch(err => toast.error('Lỗi: ' + err.message));
    } else if (order.status === 'CONFIRMED') {
      salesApi.createInvoiceFromOrder(order.id).then(() => {
        toast.success('Đã xuất hóa đơn nháp!');
        loadData();
      }).catch(err => toast.error('Lỗi: ' + err.message));
    } else {
      toast.info('Xem chi tiết đơn hàng: ' + order.orderNo);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            ↓ Thực hiện hàng loạt <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            Lọc <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <span className="text-sm font-medium text-gray-600 px-2 border-r border-gray-300">Đầu năm tới hiện tại</span>
          <button className="flex items-center gap-1 ml-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            <Zap className="w-4 h-4 text-amber-500" /> Quy tắc hạch toán tự động
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm theo số đơn..." 
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
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
          <button 
            onClick={() => router.push('/sales/orders/new')}
            className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors shadow-sm"
          >
            Thêm đơn đặt hàng <ChevronDown className="w-4 h-4 ml-1 border-l border-green-500 pl-1" />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-sm transition-colors shadow-sm">
            Thêm bằng AI
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="flex-1 overflow-auto flex flex-col relative">
        <div className="min-w-max border-b flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-700 bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-center w-10"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></th>
                <th className="px-3 py-2 font-semibold">Ngày đơn hàng</th>
                <th className="px-3 py-2 font-semibold">Số đơn hàng</th>
                <th className="px-3 py-2 font-semibold">Tình trạng ghi doanh số</th>
                <th className="px-3 py-2 font-semibold">Khách hàng</th>
                <th className="px-3 py-2 font-semibold text-right">Giá trị đơn hàng</th>
                <th className="px-3 py-2 font-semibold text-right">Giá trị đã xuất hóa đơn</th>
                <th className="px-3 py-2 font-semibold text-right">Thực thu</th>
                <th className="px-3 py-2 font-semibold text-right">Số còn phải thu</th>
                <th className="px-3 py-2 font-semibold">Tình trạng xuất hóa đơn</th>
                <th className="px-3 py-2 font-semibold">Tình trạng</th>
                <th className="px-3 py-2 font-semibold text-center sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr 
                  key={o.id} 
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedRow?.id === o.id ? 'bg-blue-50' : 'bg-white'}`}
                  onClick={() => setSelectedRow(o)}
                >
                  <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></td>
                  <td className="px-3 py-2">{fmtDate(o.orderDate)}</td>
                  <td className="px-3 py-2 text-blue-600 hover:underline font-medium">{o.orderNo}</td>
                  <td className="px-3 py-2">{getRevenueBadge(o.revenueRecordedStatus)}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{o.customerName}</td>
                  <td className="px-3 py-2 text-right font-medium text-blue-600">{fmt(o.totalAmount)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{fmt(o.invoicedAmount)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{fmt(o.collectedAmount)}</td>
                  <td className={`px-3 py-2 text-right font-medium ${(o.remainingAmount || 0) > 0 ? 'text-orange-500' : 'text-gray-600'}`}>
                    {fmt(o.remainingAmount)}
                  </td>
                  <td className="px-3 py-2">{getInvoiceBadge(o.invoiceStatus)}</td>
                  <td className="px-3 py-2 text-gray-700">{getStatusLabel(o.status)}</td>
                  <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => handleActionClick(e, o)} className="text-blue-600 font-medium hover:underline flex items-center justify-center w-full gap-1">
                      {o.status === 'DRAFT' ? 'Lập chứng từ từ bán hàng' : o.status === 'CONFIRMED' ? 'Xuất hóa đơn' : 'Xem chi tiết'}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
            {orders.length > 0 && (
              <tfoot className="bg-gray-50 font-bold sticky bottom-0 z-10 border-t border-gray-300">
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-center">Tổng</td>
                  <td className="px-3 py-2 text-right">{fmt(totalGiaTriDonHang)}</td>
                  <td className="px-3 py-2 text-right">{fmt(totalDaXuatHD)}</td>
                  <td className="px-3 py-2 text-right">{fmt(totalThucThu)}</td>
                  <td className="px-3 py-2 text-right">{fmt(totalConPhaiThu)}</td>
                  <td colSpan={3} className="px-3 py-2 sticky right-0 bg-gray-50 border-l shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-3 border-t bg-white shrink-0">
          <div className="text-sm text-gray-600">Tổng số: <span className="font-bold text-gray-800">{totalElements}</span> bản ghi</div>
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-green-500">
              <option>20 bản ghi trên 1 trang</option>
              <option>50 bản ghi trên 1 trang</option>
            </select>
            <div className="flex items-center gap-1 text-sm">
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50">Trước</button>
              <button className="px-2 py-1 border border-green-600 bg-green-50 text-green-700 font-medium rounded">1</button>
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50">Sau</button>
            </div>
          </div>
        </div>
      </div>

      {/* INLINE DETAIL PANEL */}
      {selectedRow && (
        <div className="h-64 border-t-2 border-green-500 flex flex-col bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex border-b bg-gray-50">
            <div className="px-4 py-2 bg-amber-50 text-amber-700 font-medium border-t-2 border-amber-500 -mt-[2px] cursor-pointer">
              Chi tiết
            </div>
            <div className="flex-1 flex justify-end px-2">
              <button onClick={() => setSelectedRow(null)} className="text-gray-400 hover:text-gray-600 p-2"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-700 bg-white sticky top-0 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">Mã hàng</th>
                  <th className="px-3 py-2 font-semibold">Tên hàng</th>
                  <th className="px-3 py-2 font-semibold">ĐVT</th>
                  <th className="px-3 py-2 font-semibold text-right">Số lượng</th>
                  <th className="px-3 py-2 font-semibold text-right">Số lượng đã bán</th>
                  <th className="px-3 py-2 font-semibold text-right">Số lượng đã xuất</th>
                  <th className="px-3 py-2 font-semibold text-right">Đơn giá</th>
                  <th className="px-3 py-2 font-semibold text-right">Thành tiền</th>
                  <th className="px-3 py-2 font-semibold text-right">% thuế GTGT</th>
                  <th className="px-3 py-2 font-semibold text-right">Tiền thuế GTGT</th>
                  <th className="px-3 py-2 font-semibold text-center">Biển kiểm soát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedRow.items?.map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-800">{l.productCode}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{l.productName}</td>
                    <td className="px-3 py-2 text-gray-600">{l.unit}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.quantity)}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{fmt(l.quantitySold)}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{fmt(l.quantityExported)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-medium">{fmt(l.totalPrice)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.vatRate)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.vatAmount)}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{l.serialNo || '-'}</td>
                  </tr>
                ))}
                {(!selectedRow.items || selectedRow.items.length === 0) && (
                  <tr>
                    <td colSpan={12} className="px-4 py-6 text-center text-gray-500">Không có chi tiết</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t text-sm text-gray-600 bg-white shrink-0">
            Tổng số: <span className="font-bold text-gray-800">{selectedRow.items?.length || 0}</span> bản ghi
          </div>
        </div>
      )}
    </div>
  );
}
