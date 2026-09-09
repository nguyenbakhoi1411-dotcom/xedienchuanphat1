"use client";

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';

const mockDebts = [
  { id: 'KH001', name: 'Công ty TNHH ABC', totalDebt: 1500000000, address: 'Số 1, Lê Duẩn, Quận 1, TP.HCM', notYetDue: 1000000000, overdue030: 500000000, overdue3160: 0, overdueOver60: 0 },
  { id: 'KH002', name: 'Tập đoàn XYZ', totalDebt: 800000000, address: 'Tòa nhà Landmark, Bình Thạnh, TP.HCM', notYetDue: 800000000, overdue030: 0, overdue3160: 0, overdueOver60: 0 },
  { id: 'KH003', name: 'Cửa hàng Máy tính Hưng Phát', totalDebt: 450000000, address: '123 Thái Hà, Đống Đa, Hà Nội', notYetDue: 150000000, overdue030: 200000000, overdue3160: 100000000, overdueOver60: 0 },
  { id: 'KH004', name: 'Công ty CP Đầu tư Minh Anh', totalDebt: 320000000, address: 'KCN Sóng Thần, Bình Dương', notYetDue: 0, overdue030: 0, overdue3160: 0, overdueOver60: 320000000 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const DebtAnalysis = () => {
  const [debts, setDebts] = useState(mockDebts);
  const [selectedId, setSelectedId] = useState<string>(mockDebts[0].id);

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const response = await axios.get('/api/sales/debt-aging');
        if (response.data && Array.isArray(response.data)) {
          setDebts(response.data);
          if (response.data.length > 0) {
            setSelectedId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch debt analysis, using mock data:', error);
      }
    };
    fetchDebts();
  }, []);

  const selectedCustomer = debts.find(d => d.id === selectedId);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-full bg-gray-50">
      {/* Main Grid */}
      <div className="flex-1 bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b bg-gray-100 font-semibold text-gray-800">
          Danh sách công nợ khách hàng
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-2 px-4 font-medium border-b border-r">Mã KH</th>
                <th className="py-2 px-4 font-medium border-b border-r">Tên khách hàng</th>
                <th className="py-2 px-4 font-medium border-b border-r text-right">Số còn phải thu</th>
                <th className="py-2 px-4 font-medium border-b">Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d) => (
                <tr 
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`border-b cursor-pointer hover:bg-blue-50 ${selectedId === d.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="py-3 px-4 border-r text-blue-600 font-medium">{d.id}</td>
                  <td className="py-3 px-4 border-r font-medium">{d.name}</td>
                  <td className="py-3 px-4 border-r text-right font-bold text-red-600">{formatCurrency(d.totalDebt)}</td>
                  <td className="py-3 px-4 text-gray-500 truncate max-w-[200px]">{d.address}</td>
                </tr>
              ))}
              {debts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-panel Analysis */}
      <div className="w-full lg:w-96 bg-white border rounded-lg shadow-sm flex flex-col">
        <div className="p-3 border-b bg-gray-100 font-semibold text-gray-800">
          Phân tích tuổi nợ
        </div>
        {selectedCustomer ? (
          <div className="p-4 flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Khách hàng</h4>
              <p className="font-semibold text-lg text-gray-900">{selectedCustomer.name}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600 font-medium">Nợ trong hạn</span>
                <span className="font-bold text-green-600">{formatCurrency(selectedCustomer.notYetDue)}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-600 font-medium">Nợ quá hạn</span>
                <span className="font-bold text-red-600">{formatCurrency(selectedCustomer.totalDebt - selectedCustomer.notYetDue)}</span>
              </div>

              <div className="pl-4 border-l-2 border-red-200 flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Quá hạn 1 - 30 ngày</span>
                  <span className="font-medium text-orange-500">{formatCurrency(selectedCustomer.overdue030)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Quá hạn 31 - 60 ngày</span>
                  <span className="font-medium text-orange-600">{formatCurrency(selectedCustomer.overdue3160)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Quá hạn &gt; 60 ngày</span>
                  <span className="font-medium text-red-600">{formatCurrency(selectedCustomer.overdueOver60)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Vui lòng chọn khách hàng để xem phân tích
          </div>
        )}
      </div>
    </div>
  );
};
