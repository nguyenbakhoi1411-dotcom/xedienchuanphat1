"use client";

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { Search, Filter, RefreshCw, Settings, FileDown, Plus, FileSignature } from 'lucide-react';

const mockQuotations = [
  { id: 'BG001', code: 'BG00001', date: '2023-10-10', customerName: 'Công ty TNHH ABC', status: 'Đã gửi', validUntil: '2023-11-10', totalAmount: 165000000 },
  { id: 'BG002', code: 'BG00002', date: '2023-10-12', customerName: 'Tập đoàn XYZ', status: 'Đã duyệt', validUntil: '2023-11-12', totalAmount: 49500000 },
  { id: 'BG003', code: 'BG00003', date: '2023-10-15', customerName: 'Cửa hàng Máy tính Hưng Phát', status: 'Nháp', validUntil: '2023-11-15', totalAmount: 352000000 },
];

const mockQuotationDetails: Record<string, any[]> = {
  'BG001': [
    { itemId: 'MH001', itemName: 'Laptop Dell XPS 15', qty: 2, price: 35000000, total: 70000000, vatRate: 10, vatAmount: 7000000 },
    { itemId: 'MH002', itemName: 'MacBook Pro 16', qty: 2, price: 42500000, total: 85000000, vatRate: 10, vatAmount: 8500000 },
  ],
  'BG002': [
    { itemId: 'MH003', itemName: 'Màn hình LG 27inch', qty: 10, price: 4500000, total: 45000000, vatRate: 10, vatAmount: 4500000 },
  ],
  'BG003': [
    { itemId: 'MH004', itemName: 'Server Dell PowerEdge', qty: 2, price: 160000000, total: 320000000, vatRate: 10, vatAmount: 32000000 },
  ]
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const QuotationList = () => {
  const [quotations, setQuotations] = useState(mockQuotations);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>(mockQuotations[0].id);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get('/api/sales/quotations');
        if (response.data && Array.isArray(response.data)) {
          setQuotations(response.data);
          if (response.data.length > 0) {
            setSelectedId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch quotations, using mock data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const details = mockQuotationDetails[selectedId] || [];

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex flex-col flex-1 min-h-[300px] border rounded overflow-hidden">
        <div className="bg-teal-50 p-3 font-medium text-sm text-teal-800 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            <span>Danh sách Báo giá</span>
          </div>
          <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs flex items-center gap-1 shadow-sm">
            Thêm Báo giá <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="py-2 px-3 font-medium border-b border-r">Số Báo giá</th>
                <th className="py-2 px-3 font-medium border-b border-r">Ngày BG</th>
                <th className="py-2 px-3 font-medium border-b border-r">Khách hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">Hiệu lực đến</th>
                <th className="py-2 px-3 font-medium border-b border-r text-center">Trạng thái</th>
                <th className="py-2 px-3 font-medium border-b text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr 
                  key={q.id} 
                  onClick={() => setSelectedId(q.id)}
                  className={`border-b cursor-pointer hover:bg-teal-50 ${selectedId === q.id ? 'bg-teal-100' : ''}`}
                >
                  <td className="py-2 px-3 border-r font-medium text-teal-600">{q.code}</td>
                  <td className="py-2 px-3 border-r">{q.date}</td>
                  <td className="py-2 px-3 border-r font-medium">{q.customerName}</td>
                  <td className="py-2 px-3 border-r">{q.validUntil}</td>
                  <td className="py-2 px-3 border-r text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      q.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' :
                      q.status === 'Đã gửi' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-medium">{formatCurrency(q.totalAmount)}</td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-[300px] border rounded overflow-hidden">
        <div className="bg-gray-100 p-2 font-medium text-sm text-gray-700 border-b">
          Chi tiết báo giá: {quotations.find(q => q.id === selectedId)?.code || ''}
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-2 px-3 font-medium border-b border-r">Mã hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">Tên hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Số lượng</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Đơn giá</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Thành tiền</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">% Thuế</th>
                <th className="py-2 px-3 font-medium border-b text-right">Tiền thuế</th>
              </tr>
            </thead>
            <tbody>
              {details.length > 0 ? details.map((dt, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-3 border-r text-gray-600">{dt.itemId}</td>
                  <td className="py-2 px-3 border-r font-medium">{dt.itemName}</td>
                  <td className="py-2 px-3 border-r text-right">{dt.qty}</td>
                  <td className="py-2 px-3 border-r text-right">{formatCurrency(dt.price)}</td>
                  <td className="py-2 px-3 border-r text-right font-medium">{formatCurrency(dt.total)}</td>
                  <td className="py-2 px-3 border-r text-right">{dt.vatRate}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(dt.vatAmount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
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
