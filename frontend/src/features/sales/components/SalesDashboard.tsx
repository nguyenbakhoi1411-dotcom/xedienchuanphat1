"use client";

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const mockMetrics = {
  totalRevenue: 15420000000,
  unbilled: 1250000000,
  paid: 12000000000,
  remainingDebt: 3420000000
};

const mockTopItems = [
  { id: 'MH001', name: 'Laptop Dell XPS 15', quantity: 120, revenue: 3600000000 },
  { id: 'MH002', name: 'MacBook Pro 16', quantity: 85, revenue: 4250000000 },
  { id: 'MH003', name: 'Màn hình LG 27inch', quantity: 300, revenue: 1500000000 },
];

const mockTopCustomersRevenue = [
  { id: 'KH001', name: 'Công ty TNHH ABC', revenue: 5000000000 },
  { id: 'KH002', name: 'Tập đoàn XYZ', revenue: 4200000000 },
  { id: 'KH003', name: 'Cửa hàng Máy tính Hưng Phát', revenue: 2100000000 },
];

const mockTopCustomersDebt = [
  { id: 'KH004', name: 'Công ty CP Đầu tư Minh Anh', debt: 1500000000 },
  { id: 'KH005', name: 'Công ty TNHH Thương mại Vạn Xuân', debt: 800000000 },
  { id: 'KH006', name: 'Đại lý phân phối Thành Lợi', debt: 450000000 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const SalesDashboard = () => {
  const [metrics, setMetrics] = useState(mockMetrics);
  const [topItems, setTopItems] = useState(mockTopItems);
  const [topCustomersRev, setTopCustomersRev] = useState(mockTopCustomersRevenue);
  const [topCustomersDebt, setTopCustomersDebt] = useState(mockTopCustomersDebt);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, topItemsRes, topCustomersRes] = await Promise.all([
          axios.get('/api/sales/dashboard/metrics').catch(() => null),
          axios.get('/api/sales/dashboard/top-items').catch(() => null),
          axios.get('/api/sales/dashboard/top-customers').catch(() => null)
        ]);

        if (metricsRes?.data) setMetrics(metricsRes.data);
        if (topItemsRes?.data && Array.isArray(topItemsRes.data)) setTopItems(topItemsRes.data);
        
        if (topCustomersRes?.data && Array.isArray(topCustomersRes.data)) {
          // Assuming API returns both or we fallback
          const revList = topCustomersRes.data.filter((c: any) => c.revenue);
          const debtList = topCustomersRes.data.filter((c: any) => c.debt);
          if (revList.length) setTopCustomersRev(revList);
          if (debtList.length) setTopCustomersDebt(debtList);
        }
      } catch (error) {
        console.error('Error fetching dashboard data, falling back to mock data', error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Doanh thu bán hàng</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Chưa xuất hóa đơn</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(metrics.unbilled)}</h3>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <FileText className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Đã thanh toán</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(metrics.paid)}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Còn phải thu</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(metrics.remainingDebt)}</h3>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mặt hàng bán chạy */}
        <div className="bg-white border rounded-lg shadow-sm flex flex-col">
          <div className="p-4 border-b font-semibold text-gray-800">Mặt hàng bán chạy</div>
          <div className="p-0 flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 sticky top-0">
                <tr>
                  <th className="py-2 px-4 font-medium">Mã</th>
                  <th className="py-2 px-4 font-medium">Tên hàng</th>
                  <th className="py-2 px-4 font-medium text-right">SL</th>
                  <th className="py-2 px-4 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-600">{item.id}</td>
                    <td className="py-2 px-4 font-medium">{item.name}</td>
                    <td className="py-2 px-4 text-right">{item.quantity}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khách hàng có doanh thu lớn */}
        <div className="bg-white border rounded-lg shadow-sm flex flex-col">
          <div className="p-4 border-b font-semibold text-gray-800">KH doanh thu lớn</div>
          <div className="p-0 flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 sticky top-0">
                <tr>
                  <th className="py-2 px-4 font-medium">Mã KH</th>
                  <th className="py-2 px-4 font-medium">Tên khách hàng</th>
                  <th className="py-2 px-4 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topCustomersRev.map((kh, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-600">{kh.id}</td>
                    <td className="py-2 px-4 font-medium">{kh.name}</td>
                    <td className="py-2 px-4 text-right">{formatCurrency(kh.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khách hàng có công nợ lớn */}
        <div className="bg-white border rounded-lg shadow-sm flex flex-col">
          <div className="p-4 border-b font-semibold text-gray-800">KH công nợ lớn</div>
          <div className="p-0 flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 sticky top-0">
                <tr>
                  <th className="py-2 px-4 font-medium">Mã KH</th>
                  <th className="py-2 px-4 font-medium">Tên khách hàng</th>
                  <th className="py-2 px-4 font-medium text-right">Công nợ</th>
                </tr>
              </thead>
              <tbody>
                {topCustomersDebt.map((kh, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-600">{kh.id}</td>
                    <td className="py-2 px-4 font-medium">{kh.name}</td>
                    <td className="py-2 px-4 text-right text-red-600 font-medium">{formatCurrency(kh.debt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
