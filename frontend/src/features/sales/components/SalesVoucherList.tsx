"use client";

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { SalesVoucherForm } from './SalesVoucherForm';
import { Plus } from 'lucide-react';

const mockVouchers = [
  { id: 'BH0001', date: '2023-10-01', refDate: '2023-10-01', refNo: 'HD000123', desc: 'Bán hàng cho Công ty ABC', total: 155000000 },
  { id: 'BH0002', date: '2023-10-02', refDate: '2023-10-02', refNo: 'HD000124', desc: 'Bán lẻ tại cửa hàng', total: 45000000 },
  { id: 'BH0003', date: '2023-10-03', refDate: '2023-10-03', refNo: 'HD000125', desc: 'Cung cấp thiết bị dự án XYZ', total: 320000000 },
];

const mockVoucherDetails: Record<string, any[]> = {
  'BH0001': [
    { itemId: 'MH001', itemName: 'Laptop Dell XPS 15', warehouse: 'KHO-01', isPromo: false, isCommDiscount: false, tkTien: '1111', tkDoanhThu: '5111', unit: 'Cái', qty: 2, price: 35000000, total: 70000000, discountRate: 0, discountAmt: 0 },
    { itemId: 'MH002', itemName: 'MacBook Pro 16', warehouse: 'KHO-01', isPromo: false, isCommDiscount: false, tkTien: '1111', tkDoanhThu: '5111', unit: 'Cái', qty: 2, price: 42500000, total: 85000000, discountRate: 0, discountAmt: 0 },
  ],
  'BH0002': [
    { itemId: 'MH003', itemName: 'Màn hình LG 27inch', warehouse: 'KHO-02', isPromo: false, isCommDiscount: false, tkTien: '1121', tkDoanhThu: '5111', unit: 'Cái', qty: 10, price: 4500000, total: 45000000, discountRate: 5, discountAmt: 2250000 },
  ],
  'BH0003': [
    { itemId: 'MH004', itemName: 'Server Dell PowerEdge', warehouse: 'KHO-03', isPromo: false, isCommDiscount: false, tkTien: '131', tkDoanhThu: '5111', unit: 'Bộ', qty: 2, price: 160000000, total: 320000000, discountRate: 2, discountAmt: 6400000 },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const SalesVoucherList = () => {
  const [vouchers, setVouchers] = useState(mockVouchers);
  const [selectedId, setSelectedId] = useState<string>(mockVouchers[0].id);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get('/api/sales');
        if (response.data && Array.isArray(response.data)) {
          setVouchers(response.data);
          if (response.data.length > 0) {
            setSelectedId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sales vouchers, using mock data:', error);
      }
    };
    fetchVouchers();
  }, []);

  const details = mockVoucherDetails[selectedId] || []; 

  return (
    <div className="flex flex-col h-full gap-2 bg-gray-100">
      <div className="flex flex-col flex-1 min-h-[300px] bg-white border rounded overflow-hidden shadow-sm">
        <div className="bg-gray-100 p-2 font-medium text-sm text-gray-700 border-b flex justify-between items-center">
          <span>Danh sách chứng từ bán hàng</span>
          <button onClick={() => setIsFormOpen(true)} className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs flex items-center gap-1 shadow-sm">
            <Plus className="w-3 h-3" /> Thêm
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="py-2 px-3 font-medium border-b border-r">Số CT</th>
                <th className="py-2 px-3 font-medium border-b border-r">Ngày HT</th>
                <th className="py-2 px-3 font-medium border-b border-r">Ngày CT</th>
                <th className="py-2 px-3 font-medium border-b border-r">Số hóa đơn</th>
                <th className="py-2 px-3 font-medium border-b border-r">Diễn giải</th>
                <th className="py-2 px-3 font-medium border-b text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr 
                  key={v.id} 
                  onClick={() => setSelectedId(v.id)}
                  className={`border-b cursor-pointer hover:bg-blue-50 ${selectedId === v.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="py-2 px-3 border-r font-medium text-blue-600">{v.id}</td>
                  <td className="py-2 px-3 border-r">{v.date}</td>
                  <td className="py-2 px-3 border-r">{v.refDate}</td>
                  <td className="py-2 px-3 border-r">{v.refNo}</td>
                  <td className="py-2 px-3 border-r">{v.desc}</td>
                  <td className="py-2 px-3 text-right font-medium">{formatCurrency(v.total)}</td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-[300px] bg-white border rounded overflow-hidden shadow-sm">
        <div className="bg-gray-100 p-2 font-medium text-sm text-gray-700 border-b">
          Chi tiết chứng từ: {selectedId}
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-2 px-3 font-medium border-b border-r">Mã hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">Tên hàng</th>
                <th className="py-2 px-3 font-medium border-b border-r">Kho</th>
                <th className="py-2 px-3 font-medium border-b border-r text-center">Hàng khuyến mại</th>
                <th className="py-2 px-3 font-medium border-b border-r text-center">Chiết khấu thương mại</th>
                <th className="py-2 px-3 font-medium border-b border-r text-center">TK tiền</th>
                <th className="py-2 px-3 font-medium border-b border-r text-center">TK doanh thu</th>
                <th className="py-2 px-3 font-medium border-b border-r text-center">ĐVT</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Số lượng</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Đơn giá</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Thành tiền</th>
                <th className="py-2 px-3 font-medium border-b border-r text-right">Tỷ lệ CK</th>
                <th className="py-2 px-3 font-medium border-b text-right">Tiền chiết khấu</th>
              </tr>
            </thead>
            <tbody>
              {details.length > 0 ? details.map((d, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-3 border-r text-gray-600">{d.itemId}</td>
                  <td className="py-2 px-3 border-r font-medium">{d.itemName}</td>
                  <td className="py-2 px-3 border-r">{d.warehouse}</td>
                  <td className="py-2 px-3 border-r text-center">
                    <input type="checkbox" checked={d.isPromo} readOnly className="rounded text-blue-600" />
                  </td>
                  <td className="py-2 px-3 border-r text-center">
                    <input type="checkbox" checked={d.isCommDiscount} readOnly className="rounded text-blue-600" />
                  </td>
                  <td className="py-2 px-3 border-r text-center">{d.tkTien}</td>
                  <td className="py-2 px-3 border-r text-center">{d.tkDoanhThu}</td>
                  <td className="py-2 px-3 border-r text-center">{d.unit}</td>
                  <td className="py-2 px-3 border-r text-right">{d.qty}</td>
                  <td className="py-2 px-3 border-r text-right">{formatCurrency(d.price)}</td>
                  <td className="py-2 px-3 border-r text-right font-medium">{formatCurrency(d.total)}</td>
                  <td className="py-2 px-3 border-r text-right">{d.discountRate}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(d.discountAmt)}</td>
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
      
      <SalesVoucherForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => setIsFormOpen(false)} 
      />
    </div>
  );
};
