"use client";

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { Search, Filter, RefreshCw, Settings, FileDown, Plus, FileText } from 'lucide-react';

const mockTaxInvoices = [
  { id: 'HD001', code: 'HD000123', date: '2023-10-01', customerName: 'Công ty TNHH ABC', taxCode: '0312345678', totalAmount: 150000000, vatAmount: 15000000, status: 'Đã phát hành' },
  { id: 'HD002', code: 'HD000124', date: '2023-10-02', customerName: 'Tập đoàn XYZ', taxCode: '0309876543', totalAmount: 45000000, vatAmount: 4500000, status: 'Mới tạo' },
  { id: 'HD003', code: 'HD000125', date: '2023-10-05', customerName: 'Công ty CP Đầu tư Minh Anh', taxCode: '0102030405', totalAmount: 320000000, vatAmount: 32000000, status: 'Đã hủy' },
];

const mockInvoiceDetails: Record<string, any[]> = {
  'HD001': [
    { itemId: 'MH001', itemName: 'Laptop Dell XPS 15', isCommercialDiscount: false, unit: 'Cái', qty: 5, price: 30000000, amount: 150000000, vatRate: 10, vatAmount: 15000000, batchNo: 'B2023-1', expDate: '2025-12-31' },
  ],
  'HD002': [
    { itemId: 'MH003', itemName: 'Màn hình LG 27inch', isCommercialDiscount: false, unit: 'Cái', qty: 10, price: 4500000, amount: 45000000, vatRate: 10, vatAmount: 4500000, batchNo: 'B2023-2', expDate: '2026-06-30' },
  ],
  'HD003': [
    { itemId: 'MH004', itemName: 'Server Dell PowerEdge', isCommercialDiscount: false, unit: 'Bộ', qty: 2, price: 160000000, amount: 320000000, vatRate: 10, vatAmount: 32000000, batchNo: 'B2023-3', expDate: '2028-01-01' },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const TaxInvoiceList = () => {
  const [invoices, setInvoices] = useState(mockTaxInvoices);
  const [selectedId, setSelectedId] = useState<string>(mockTaxInvoices[0].id);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('/api/sales/tax-invoices');
        if (response.data && Array.isArray(response.data)) {
          setInvoices(response.data);
          if (response.data.length > 0) {
            setSelectedId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tax invoices, using mock data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const details = mockInvoiceDetails[selectedId] || [];

  return (
    <div className="flex flex-col h-full bg-gray-100 gap-2">
      {/* Master Grid */}
      <div className="flex flex-col flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-hidden min-h-[300px]">
        {/* Top Banner */}
        <div className="flex bg-slate-50 border-b border-gray-200 p-4 items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-full text-indigo-500">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-500">{filteredInvoices.length}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase">Tổng số<br/>Hóa đơn thuế</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1">
              Thực hiện hàng loạt <Filter className="w-4 h-4 ml-2" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm số hóa đơn, khách hàng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 w-64"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
            </div>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><RefreshCw className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Settings className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><FileDown className="w-4 h-4" /></button>
            <button className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium flex items-center gap-1 shadow-sm">
              Phát hành HĐ <Plus className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
            <thead className="text-xs text-gray-700 uppercase bg-indigo-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 border border-indigo-100 w-10 text-center">
                  <input type="checkbox" className="rounded text-indigo-600" />
                </th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800">Số HĐ</th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800">Ngày HĐ</th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800">Khách hàng</th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800">Mã số thuế</th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800 text-right">Tổng tiền</th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800 text-right">Tiền thuế GTGT</th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800 text-center">Trạng thái</th>
                <th className="px-3 py-2 border border-indigo-100 font-semibold text-indigo-800 text-center">Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv, index) => (
                <tr 
                  key={inv.id || index} 
                  onClick={() => setSelectedId(inv.id)}
                  className={`cursor-pointer hover:bg-indigo-100 border-b border-gray-200 transition-colors ${selectedId === inv.id ? 'bg-indigo-100' : (index % 2 === 1 ? 'bg-slate-50' : 'bg-white')}`}
                >
                  <td className="px-3 py-2 border-r border-gray-200 text-center">
                    <input type="checkbox" className="rounded text-indigo-600" />
                  </td>
                  <td className="px-3 py-2 border-r border-gray-200 text-indigo-600 font-medium">{inv.code}</td>
                  <td className="px-3 py-2 border-r border-gray-200">{inv.date}</td>
                  <td className="px-3 py-2 border-r border-gray-200 font-medium">{inv.customerName}</td>
                  <td className="px-3 py-2 border-r border-gray-200">{inv.taxCode}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right font-medium">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right text-gray-600">{formatCurrency(inv.vatAmount)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      inv.status === 'Đã phát hành' ? 'bg-green-100 text-green-700' :
                      inv.status === 'Mới tạo' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button className="text-indigo-600 font-medium hover:text-indigo-800">Xem ▼</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Không tìm thấy hóa đơn nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="flex flex-col flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-hidden min-h-[300px]">
        <div className="bg-gray-100 p-2 font-medium text-sm text-gray-700 border-b flex gap-4">
          <span>Chi tiết hóa đơn</span>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-2 px-3 font-medium border-b border-r">Mã hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">Tên hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r text-center">Chiết khấu thương mại</th>
                <th className="py-2 px-3 font-medium border-b border-r">ĐVT</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Số lượng</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Đơn giá</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Thành tiền</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">% thuế GTGT</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Tiền thuế GTGT</th>
                <th className="py-2 px-3 font-medium border-b border-r">Số lô</th>
                <th className="py-2 px-3 font-medium border-b text-right">Hạn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              {details.length > 0 ? details.map((d, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-3 border-r text-gray-600">{d.itemId}</td>
                  <td className="py-2 px-3 border-r font-medium">{d.itemName}</td>
                  <td className="py-2 px-3 border-r text-center">
                    <input type="checkbox" checked={d.isCommercialDiscount} readOnly className="rounded text-indigo-600" />
                  </td>
                  <td className="py-2 px-3 border-r">{d.unit}</td>
                  <td className="py-2 px-3 border-r text-right">{d.qty}</td>
                  <td className="py-2 px-3 border-r text-right">{formatCurrency(d.price)}</td>
                  <td className="py-2 px-3 border-r text-right font-medium">{formatCurrency(d.amount)}</td>
                  <td className="py-2 px-3 border-r text-right">{d.vatRate}</td>
                  <td className="py-2 px-3 border-r text-right">{formatCurrency(d.vatAmount)}</td>
                  <td className="py-2 px-3 border-r">{d.batchNo}</td>
                  <td className="py-2 px-3 text-right">{d.expDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-gray-500">
                    Không có dữ liệu chi tiết
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
