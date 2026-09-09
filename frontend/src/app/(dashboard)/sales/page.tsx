"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { salesApi } from '@/features/sales/api';
import type { SalesDashboard } from '@/features/sales/types';
import { useCurrentUser } from '@/lib/auth/useCurrentUser';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { QuotesTab } from '@/features/sales/components/tabs/QuotesTab';
import { OrdersTab } from '@/features/sales/components/tabs/OrdersTab';
import { ContractsTab } from '@/features/sales/components/tabs/ContractsTab';
import { VouchersTab } from '@/features/sales/components/tabs/VouchersTab';
import { InvoicesTab } from '@/features/sales/components/tabs/InvoicesTab';
import { AutoAccountingTab } from '@/features/sales/components/tabs/AutoAccountingTab';
import { ReturnsTab } from '@/features/sales/components/tabs/ReturnsTab';
import { DiscountsTab } from '@/features/sales/components/tabs/DiscountsTab';
import { ReceivablesTab } from '@/features/sales/components/tabs/ReceivablesTab';
import { DebtCollectionTab } from '@/features/sales/components/tabs/DebtCollectionTab';
import { ReportsTab } from '@/features/sales/components/tabs/ReportsTab';
import { CustomersTab } from '@/features/sales/components/tabs/CustomersTab';
import { ProductsTab } from '@/features/sales/components/tabs/ProductsTab';

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'tr';
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

function growthBadge(pct: number) {
  if (pct > 0) return <span className="text-xs font-semibold text-emerald-600">↑ {pct.toFixed(1)}%</span>;
  if (pct < 0) return <span className="text-xs font-semibold text-red-600">↓ {Math.abs(pct).toFixed(1)}%</span>;
  return <span className="text-xs font-semibold text-gray-400">= 0%</span>;
}

const TABS = [
  { id: 'process', label: 'Quy trình' },
  { id: 'dashboard', label: 'Biểu đồ' },
  { id: 'quotes', label: 'Báo giá', component: QuotesTab },
  { id: 'orders', label: 'Đơn đặt hàng', component: OrdersTab },
  { id: 'contracts', label: 'Hợp đồng bán hàng', component: ContractsTab },
  { id: 'vouchers', label: 'Bán hàng', component: VouchersTab },
  { id: 'invoices', label: 'Hóa đơn', component: InvoicesTab },
  { id: 'auto_accounting', label: 'Tự động hạch toán HĐ ★NEW', component: AutoAccountingTab },
  { id: 'returns', label: 'Trả lại hàng bán', component: ReturnsTab },
  { id: 'discounts', label: 'Giảm giá hàng bán', component: DiscountsTab },
  { id: 'receivables', label: 'Công nợ', component: ReceivablesTab },
  { id: 'debt_collection', label: 'Thu nợ', component: DebtCollectionTab },
  { id: 'reports', label: 'Báo cáo', component: ReportsTab },
  { id: 'customers', label: 'Khách hàng', component: CustomersTab },
  { id: 'products', label: 'Hàng hóa dịch vụ', component: ProductsTab },
];

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState('process');
  const [dashboardData, setDashboardData] = useState<SalesDashboard | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'process') {
      salesApi.getDashboard().then(setDashboardData).catch(console.error);
    }
  }, [activeTab]);

  const renderProcessTab = () => (
    <div className="p-8 grid grid-cols-3 gap-6 bg-gray-50 min-h-full">
      <div className="col-span-2 space-y-6">
        <div className="border rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">NGHIỆP VỤ BÁN HÀNG</h2>
          <div className="relative flex items-center justify-between mb-12 px-8">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-24 right-24 h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('quotes')}>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow">💰</div>
              <span className="text-sm font-medium text-gray-700">Báo giá</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('orders')}>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow">📋</div>
              <span className="text-sm font-medium text-gray-700">Đơn đặt hàng</span>
            </div>

            <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('invoices')}>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow">🧾</div>
              <span className="text-sm font-medium text-gray-700">Xuất hóa đơn</span>
            </div>

            <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('debt_collection')}>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow">📱</div>
              <span className="text-sm font-medium text-gray-700">Thu tiền theo HĐ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 px-16">
            <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('contracts')}>
              <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xl shadow-sm">📄</div>
              <span className="text-sm font-medium text-gray-600">Hợp đồng bán hàng</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('returns')}>
              <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xl shadow-sm">↩️</div>
              <span className="text-sm font-medium text-gray-600">Trả lại hàng bán</span>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between px-4">
            <button onClick={() => setActiveTab('customers')} className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600">
              <span className="text-xl">👤</span><span className="text-xs">Khách hàng</span>
            </button>
            <button onClick={() => setActiveTab('products')} className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600">
              <span className="text-xl">📦</span><span className="text-xs">Hàng hóa, dịch vụ</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600">
              <span className="text-xl">📅</span><span className="text-xs">Điều khoản TT</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600">
              <span className="text-xl">⭐</span><span className="text-xs">Tiện ích</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-600">
              <span className="text-xl">⚙️</span><span className="text-xs">Tùy chọn</span>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow">CRM</div>
            <div>
              <p className="font-semibold text-blue-900">AMIS CRM</p>
              <p className="text-sm text-blue-700">Kết nối dữ liệu giữa bộ phận bán hàng và kế toán</p>
            </div>
          </div>
          <button className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors shadow-sm text-sm">
            Kết nối ngay
          </button>
        </div>
      </div>

      <div className="col-span-1">
        <div className="border rounded-xl bg-white p-6 shadow-sm h-full">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">BÁO CÁO</h2>
          <ul className="space-y-4">
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }} className="text-indigo-700 font-medium hover:underline text-sm block">Sổ chi tiết bán hàng</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }} className="text-indigo-700 font-medium hover:underline text-sm block">Chi tiết công nợ phải thu khách hàng</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }} className="text-indigo-700 font-medium hover:underline text-sm block">Tổng hợp bán hàng theo mặt hàng</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }} className="text-indigo-700 font-medium hover:underline text-sm block">Tổng hợp công nợ phải thu khách hàng</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }} className="text-indigo-700 font-medium hover:underline text-sm block">Chi tiết đơn đặt hàng theo mã quy cách</a></li>
          </ul>
          <div className="mt-6 pt-4 border-t">
            <button onClick={() => setActiveTab('reports')} className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors">Tất cả báo cáo →</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardTab = () => {
    const mockChartData = [
      { name: 'Th 1', amount: 120000000 },
      { name: 'Th 2', amount: 150000000 },
      { name: 'Th 3', amount: 180000000 },
      { name: 'Th 4', amount: 130000000 },
      { name: 'Th 5', amount: 210000000 },
      { name: 'Th 6', amount: dashboardData?.todayRevenue || 190000000 },
    ];

    return (
      <div className="p-8 bg-gray-50 min-h-full space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-teal-500 text-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('orders')}>
            <h3 className="font-bold text-teal-50 mb-4 opacity-90 border-b border-teal-400 pb-2">ĐƠN ĐẶT HÀNG — Tháng này</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center"><span className="text-teal-100">Giá trị đơn hàng:</span> <span className="font-semibold text-lg">{fmt(dashboardData?.totalByInvoice)}</span></div>
              <div className="flex justify-between items-center"><span className="text-teal-100">Đã xuất hóa đơn:</span> <span className="font-medium">{fmt(dashboardData?.totalByInvoice ? dashboardData.totalByInvoice * 0.8 : 0)}</span></div>
              <div className="flex justify-between items-center"><span className="text-teal-100">Thực thu:</span> <span className="font-medium">{fmt(dashboardData?.totalAdvance)}</span></div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-teal-400">
                <span className="text-teal-100">Còn phải thu:</span> 
                <span className="font-bold text-orange-200">{fmt(dashboardData?.totalReceivable)}</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-500 text-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('contracts')}>
            <h3 className="font-bold text-orange-50 mb-4 opacity-90 border-b border-orange-400 pb-2">HỢP ĐỒNG — Tháng này</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center"><span className="text-orange-100">Doanh số:</span> <span className="font-semibold text-lg">{fmt(dashboardData?.totalContractValue)}</span></div>
              <div className="flex justify-between items-center"><span className="text-orange-100">Đã xuất hóa đơn:</span> <span className="font-medium">{fmt(dashboardData?.totalContractValue ? dashboardData.totalContractValue * 0.9 : 0)}</span></div>
              <div className="flex justify-between items-center"><span className="text-orange-100">Thực chi:</span> <span className="font-medium">0 đ</span></div>
              <div className="flex justify-between items-center"><span className="text-orange-100">Thực thu:</span> <span className="font-medium">{fmt(dashboardData?.totalContractValue ? dashboardData.totalContractValue * 0.5 : 0)}</span></div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-orange-400">
                <span className="text-orange-100">Còn phải thu:</span> 
                <span className="font-bold text-yellow-200">{fmt(dashboardData?.totalContractValue ? dashboardData.totalContractValue * 0.5 : 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-600 text-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('vouchers')}>
            <h3 className="font-bold text-green-50 mb-4 opacity-90 border-b border-green-500 pb-2">BÁN HÀNG — Tháng này</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center"><span className="text-green-100">Doanh thu bán hàng:</span> <span className="font-bold text-lg text-orange-200">{fmt(dashboardData?.todayRevenue)}</span></div>
              <div className="flex justify-between items-center"><span className="text-green-100">Chưa xuất hóa đơn:</span> <span className="font-medium text-orange-200">{fmt(dashboardData?.todayRevenue ? dashboardData.todayRevenue * 0.1 : 0)}</span></div>
              <div className="flex justify-between items-center"><span className="text-green-100">Đã thanh toán:</span> <span className="font-medium">{fmt(dashboardData?.todayRevenue ? dashboardData.todayRevenue * 0.6 : 0)}</span></div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-500">
                <span className="text-green-100">Còn phải thu:</span> 
                <span className="font-bold text-orange-200">{fmt(dashboardData?.todayRevenue ? dashboardData.todayRevenue * 0.4 : 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-2 gap-6">
          {/* Best Selling Items */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Mặt hàng bán chạy</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <select className="border-none bg-gray-50 rounded p-1"><option>Tháng này</option></select>
                <button className="hover:text-green-600">↻</button>
                <button className="hover:text-green-600">⚙</button>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-xs text-gray-500 block mb-1">Tổng doanh thu</span>
              <span className="text-2xl font-bold text-green-600">{fmt(dashboardData?.todayRevenue)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b">
                  <tr><th className="py-2 px-2">Tên</th><th className="py-2 px-2 text-right">Số lượng</th><th className="py-2 px-2 text-right">Doanh thu</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="py-2 px-2 font-medium">Bơm thủy lực XA-1</td><td className="py-2 px-2 text-right">15</td><td className="py-2 px-2 text-right text-gray-700">150.000.000</td></tr>
                  <tr><td className="py-2 px-2 font-medium">Động cơ AC 200W</td><td className="py-2 px-2 text-right">8</td><td className="py-2 px-2 text-right text-gray-700">40.000.000</td></tr>
                  <tr><td className="py-2 px-2 font-medium">Van an toàn</td><td className="py-2 px-2 text-right">25</td><td className="py-2 px-2 text-right text-gray-700">25.000.000</td></tr>
                </tbody>
              </table>
            </div>
            <button className="mt-4 text-sm text-green-600 hover:underline font-medium w-full text-center">Xem thêm →</button>
          </div>

          {/* Top Customers by Revenue */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Khách hàng có doanh thu lớn</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <select className="border-none bg-gray-50 rounded p-1"><option>Tháng này</option></select>
                <button className="hover:text-green-600">↻</button>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-xs text-gray-500 block mb-1">Tổng doanh thu Top KH</span>
              <span className="text-2xl font-bold text-blue-600">{fmt(dashboardData?.todayRevenue ? dashboardData.todayRevenue * 0.8 : 0)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b">
                  <tr><th className="py-2 px-2">Mã KH</th><th className="py-2 px-2">Tên KH</th><th className="py-2 px-2 text-right">Số tiền</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="py-2 px-2 text-gray-500">KH001</td><td className="py-2 px-2 font-medium">Công ty TNHH Vận tải ABC</td><td className="py-2 px-2 text-right text-gray-700">200.000.000</td></tr>
                  <tr><td className="py-2 px-2 text-gray-500">KH005</td><td className="py-2 px-2 font-medium">Xí nghiệp Cơ khí 1</td><td className="py-2 px-2 text-right text-gray-700">85.000.000</td></tr>
                  <tr><td className="py-2 px-2 text-gray-500">KH012</td><td className="py-2 px-2 font-medium">Hợp tác xã Nông nghiệp Mới</td><td className="py-2 px-2 text-right text-gray-700">45.000.000</td></tr>
                </tbody>
              </table>
            </div>
            <button className="mt-4 text-sm text-blue-600 hover:underline font-medium w-full text-center">Xem thêm →</button>
          </div>

          {/* Top Customers by Debt */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Khách hàng có công nợ lớn</h3>
            <div className="mb-4">
              <span className="text-xs text-gray-500 block mb-1">Tổng công nợ</span>
              <span className="text-2xl font-bold text-red-500">{fmt(dashboardData?.totalReceivable)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 border-b">
                  <tr><th className="py-2 px-2">Mã KH</th><th className="py-2 px-2">Tên KH</th><th className="py-2 px-2 text-right">Số tiền</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="py-2 px-2 text-gray-500">KH001</td><td className="py-2 px-2 font-medium">Công ty TNHH Vận tải ABC</td><td className="py-2 px-2 text-right text-red-500 font-medium">150.000.000</td></tr>
                  <tr><td className="py-2 px-2 text-gray-500">KH023</td><td className="py-2 px-2 font-medium">Công ty TNHH Xây dựng Thành Phát</td><td className="py-2 px-2 text-right text-red-500 font-medium">95.000.000</td></tr>
                  <tr><td className="py-2 px-2 text-gray-500">KH008</td><td className="py-2 px-2 font-medium">Cửa hàng Vật tư Số 4</td><td className="py-2 px-2 text-right text-red-500 font-medium">32.000.000</td></tr>
                </tbody>
              </table>
            </div>
            <button className="mt-4 text-sm text-red-500 hover:underline font-medium w-full text-center">Xem thêm →</button>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 mb-2">Doanh thu</h3>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-800">{fmt(dashboardData?.todayRevenue || 190000000)}</span>
              {growthBadge(dashboardData?.revenueGrowthPct || 15.2)}
            </div>
            <div className="flex-1 min-h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000000}tr`} />
                  <Tooltip 
                    formatter={(value: number) => [new Intl.NumberFormat('vi-VN').format(value) + ' đ', 'Doanh thu']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const activeTabItem = TABS.find((t) => t.id === activeTab);
  const ActiveComponent = activeTabItem?.component;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white px-8 py-6 shrink-0">
        <h1 className="text-2xl font-bold">Bán Hàng</h1>
        <p className="text-green-100 mt-1">Quản lý báo giá, đơn bán, hóa đơn và công nợ</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-20 shrink-0 text-sm">
        <div className="px-8 overflow-x-auto custom-scrollbar">
          <nav className="flex space-x-6 h-12 items-end" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap pb-3 border-b-2 font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'border-green-600 text-green-700 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        {activeTab === 'process' && renderProcessTab()}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab !== 'process' && activeTab !== 'dashboard' && ActiveComponent && (
          <div className="p-4 h-full"><ActiveComponent /></div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
