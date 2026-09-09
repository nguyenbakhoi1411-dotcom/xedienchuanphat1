"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, XCircle, TrendingUp, Clock,
  BarChart2, RefreshCw, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { inventoryApi } from '@/features/inventory/api';
import type { InventoryStats } from '@/features/inventory/types';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
const fmtM = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return fmt(n);
};

export function DashboardTab() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getStats({});
      setStats(data);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const lowStockCount = stats?.lowStockCount ?? 0;
  const outOfStockCount = stats?.outOfStockCount ?? 0;
  const totalStockValue = stats?.totalStockValue ?? 0;
  const turnoverRate = stats?.inventoryTurnoverRate ?? 0;
  const avgDays = stats?.avgStorageDays ?? 0;

  const topItems = stats?.topStockItems ?? [];
  const lowItems = stats?.lowStockItems ?? [];

  const chartData = topItems.map(item => ({
    name: item.productName.length > 15 ? item.productName.slice(0, 15) + '…' : item.productName,
    value: Math.round(item.stockValue / 1_000_000),
  }));

  return (
    <div className="p-4 space-y-4">
      {/* Period filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">Tổng quan kho hàng</h2>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as 'month' | 'quarter' | 'year')}
            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-blue-400"
          >
            <option value="month">Tháng nay</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <button
            onClick={load}
            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
            title="Tải lại"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
          bg="bg-orange-50"
          border="border-orange-200"
          label="Hàng hóa sắp hết"
          value={fmt(lowStockCount)}
          unit="mặt hàng"
          onRefresh={load}
        />
        <KpiCard
          icon={<XCircle className="h-6 w-6 text-red-500" />}
          bg="bg-red-50"
          border="border-red-200"
          label="Hàng hóa hết hàng"
          value={fmt(outOfStockCount)}
          unit="mặt hàng"
          onRefresh={load}
        />
        <KpiCard
          icon={<TrendingUp className="h-6 w-6 text-green-500" />}
          bg="bg-green-50"
          border="border-green-200"
          label="Vòng quay hàng tồn kho"
          value={turnoverRate.toFixed(1)}
          unit="lần/năm"
          onRefresh={load}
        />
        <KpiCard
          icon={<Clock className="h-6 w-6 text-blue-500" />}
          bg="bg-blue-50"
          border="border-blue-200"
          label="Số ngày lưu kho bình quân"
          value={Math.round(avgDays).toString()}
          unit="ngày"
          onRefresh={load}
        />
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Top stock chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {fmtM(totalStockValue)}
                </span>
                <span className="text-sm text-gray-500">đồng</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Tổng giá trị hàng tồn kho · Đvt: đồng</div>
            </div>
            <BarChart2 className="h-6 w-6 text-gray-300" />
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Đang tải...
            </div>
          ) : chartData.length > 0 ? (
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 mb-3">Top 5 hàng hóa giá trị cao nhất (triệu đồng)</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v} triệu`, 'Giá trị']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}

          <div className="border-t border-gray-100 px-4 py-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="text-left py-1 font-medium">Tên hàng hóa</th>
                  <th className="text-right py-1 font-medium">Số lượng</th>
                  <th className="text-right py-1 font-medium">Giá trị</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-t border-gray-50">
                    <td className="py-1.5 text-gray-700">{item.productName}</td>
                    <td className="text-right py-1.5 text-gray-600">{fmt(item.quantity)}</td>
                    <td className="text-right py-1.5 text-gray-800 font-medium">{fmtM(item.stockValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1">
              Xem thêm <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: Low stock items */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Hàng hóa sắp hết</h3>
            <span className="text-xs text-orange-500 font-medium">{lowItems.length} mặt hàng</span>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Đang tải...</div>
          ) : lowItems.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">Tên hàng hóa</th>
                    <th className="text-right px-2 py-2 font-medium text-gray-500">Tồn</th>
                    <th className="text-right px-2 py-2 font-medium text-gray-500">T. thiểu</th>
                  </tr>
                </thead>
                <tbody>
                  {lowItems.map((item, i) => {
                    const isOut = item.quantityOnHand <= 0;
                    return (
                      <tr key={i} className={`border-t border-gray-50 hover:bg-gray-50 ${isOut ? 'bg-red-50/50' : ''}`}>
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-800 truncate max-w-[120px]">{item.productName}</div>
                          <div className="text-gray-400">{item.warehouseName}</div>
                        </td>
                        <td className={`text-right px-2 py-2 font-semibold ${isOut ? 'text-red-500' : 'text-yellow-600'}`}>
                          {fmt(item.quantityOnHand)}
                        </td>
                        <td className="text-right px-2 py-2 text-gray-500">{fmt(item.minQuantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Không có hàng sắp hết
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  bg: string;
  border: string;
  label: string;
  value: string;
  unit: string;
  onRefresh: () => void;
}

function KpiCard({ icon, bg, border, label, value, unit, onRefresh }: KpiCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${bg} ${border}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <button onClick={onRefresh} className="text-xs text-gray-400 hover:text-gray-600 underline">
          Tải lại
        </button>
      </div>
      <div className="text-2xl font-bold text-gray-800 mt-1">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{unit}</div>
    </div>
  );
}
