"use client";

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { Search, Filter, RefreshCw, Settings, FileDown, Plus, Tag } from 'lucide-react';

const mockDiscounts = [
  { id: 'GG001', code: 'GG0001', date: '2023-10-15', customerName: 'Công ty TNHH ABC', reason: 'Chiết khấu thương mại', totalDiscount: 5000000 },
  { id: 'GG002', code: 'GG0002', date: '2023-10-18', customerName: 'Tập đoàn XYZ', reason: 'Giảm giá hàng hư hỏng', totalDiscount: 2000000 },
];

const mockDiscountDetails: Record<string, any[]> = {
  'GG001': [
    { itemId: 'MH001', itemName: 'Laptop Dell XPS 15', tkGiamGia: '5211', tkCongNo: '131', unit: 'Cái', qty: 10, priceAfterTax: 33250000, price: 35000000, amount: 17500000, vatRate: 10, vatAmount: 1750000, tkThue: '33311', refSaleNo: 'BH0001' },
  ],
  'GG002': [
    { itemId: 'MH003', itemName: 'Màn hình LG 27inch', tkGiamGia: '5213', tkCongNo: '131', unit: 'Cái', qty: 2, priceAfterTax: 4050000, price: 4500000, amount: 900000, vatRate: 10, vatAmount: 90000, tkThue: '33311', refSaleNo: 'BH0002' },
  ]
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const SalesDiscountList = () => {
  const [discounts, setDiscounts] = useState(mockDiscounts);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>(mockDiscounts[0].id);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await axios.get('/api/sales/discounts');
        if (response.data && Array.isArray(response.data)) {
          setDiscounts(response.data);
          if (response.data.length > 0) {
            setSelectedId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sales discounts, using mock data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  const details = mockDiscountDetails[selectedId] || [];

  return (
    <div className="flex flex-col h-full gap-2 bg-gray-100">
      <div className="flex flex-col flex-1 min-h-[300px] bg-white border rounded overflow-hidden shadow-sm">
        <div className="bg-orange-50 p-3 font-medium text-sm text-orange-800 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span>Chứng từ giảm giá hàng bán</span>
          </div>
          <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs flex items-center gap-1 shadow-sm">
            Thêm <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="py-2 px-3 font-medium border-b border-r">Số CT</th>
                <th className="py-2 px-3 font-medium border-b border-r">Ngày CT</th>
                <th className="py-2 px-3 font-medium border-b border-r">Khách hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">Lý do</th>
                <th className="py-2 px-3 font-medium border-b text-right">Tổng tiền giảm</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => setSelectedId(d.id)}
                  className={`border-b cursor-pointer hover:bg-orange-50 ${selectedId === d.id ? 'bg-orange-100' : ''}`}
                >
                  <td className="py-2 px-3 border-r font-medium text-orange-600">{d.code}</td>
                  <td className="py-2 px-3 border-r">{d.date}</td>
                  <td className="py-2 px-3 border-r font-medium">{d.customerName}</td>
                  <td className="py-2 px-3 border-r">{d.reason}</td>
                  <td className="py-2 px-3 text-right font-medium text-red-600">{formatCurrency(d.totalDiscount)}</td>
                </tr>
              ))}
              {discounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-[300px] bg-white border rounded overflow-hidden shadow-sm">
        <div className="bg-gray-100 p-2 font-medium text-sm text-gray-700 border-b">
          Chi tiết giảm giá: {discounts.find(d => d.id === selectedId)?.code || ''}
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-2 px-3 font-medium border-b border-r">Mã hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">Tên hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">TK Giảm giá</th>
                <th className="py-2 px-3 font-medium border-b border-r">TK công nợ</th>
                <th className="py-2 px-3 font-medium border-b border-r">ĐVT</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Số lượng</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Đơn giá sau thuế</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Đơn giá</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Thành tiền</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">% thuế GTGT</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Tiền thuế GTGT</th>
                <th className="py-2 px-3 font-medium border-b border-r">TK Thuế GTGT</th>
                <th className="py-2 px-3 font-medium border-b text-right">Số CT bán hàng</th>
              </tr>
            </thead>
            <tbody>
              {details.length > 0 ? details.map((dt, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-3 border-r text-gray-600">{dt.itemId}</td>
                  <td className="py-2 px-3 border-r font-medium">{dt.itemName}</td>
                  <td className="py-2 px-3 border-r text-center">{dt.tkGiamGia}</td>
                  <td className="py-2 px-3 border-r text-center">{dt.tkCongNo}</td>
                  <td className="py-2 px-3 border-r text-center">{dt.unit}</td>
                  <td className="py-2 px-3 border-r text-right">{dt.qty}</td>
                  <td className="py-2 px-3 border-r text-right">{formatCurrency(dt.priceAfterTax)}</td>
                  <td className="py-2 px-3 border-r text-right">{formatCurrency(dt.price)}</td>
                  <td className="py-2 px-3 border-r text-right font-medium text-red-600">{formatCurrency(dt.amount)}</td>
                  <td className="py-2 px-3 border-r text-right">{dt.vatRate}</td>
                  <td className="py-2 px-3 border-r text-right">{formatCurrency(dt.vatAmount)}</td>
                  <td className="py-2 px-3 border-r text-center">{dt.tkThue}</td>
                  <td className="py-2 px-3 text-right text-blue-600">{dt.refSaleNo}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-gray-500">
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
