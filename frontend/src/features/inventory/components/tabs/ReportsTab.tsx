"use client";

import { useState, useCallback } from 'react';
import {
  FileBarChart, ChevronRight, X, Download, RefreshCw,
  BarChart2, ClipboardList, Package, ArrowLeftRight, Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { inventoryApi } from '@/features/inventory/api';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
const fmtM = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' tr';
  return fmt(n);
};

interface StockRow {
  productCode: string;
  productName: string;
  productGroup: string | null;
  unit: string | null;
  openingQty: number;
  openingValue: number;
  importQty: number;
  importValue: number;
  exportQty: number;
  exportValue: number;
  closingQty: number;
  closingValue: number;
  unitCost: number;
}

interface ReportDef {
  id: string;
  group: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  apiPath: 'stock-summary' | 'stock-detail';
}

const REPORTS: ReportDef[] = [
  {
    id: 'tonkho-tong-hop',
    group: 'Hàng tồn kho',
    name: 'Báo cáo tổng hợp hàng tồn kho',
    desc: 'Xem tổng hợp nhập – xuất – tồn theo từng mặt hàng',
    icon: BarChart2,
    apiPath: 'stock-summary',
  },
  {
    id: 'tonkho-chi-tiet',
    group: 'Hàng tồn kho',
    name: 'Báo cáo chi tiết hàng tồn kho',
    desc: 'Xem chi tiết từng phiếu nhập/xuất theo từng mặt hàng',
    icon: ClipboardList,
    apiPath: 'stock-detail',
  },
  {
    id: 'tonkho-theo-kho',
    group: 'Hàng tồn kho',
    name: 'Tổng hợp tồn kho theo kho',
    desc: 'So sánh tồn kho giữa các kho trong cùng kỳ',
    icon: Package,
    apiPath: 'stock-summary',
  },
  {
    id: 'xuat-nhap-ton',
    group: 'Xuất nhập tồn',
    name: 'Báo cáo xuất nhập tồn',
    desc: 'Bảng tổng hợp xuất nhập tồn theo thời gian',
    icon: ArrowLeftRight,
    apiPath: 'stock-summary',
  },
  {
    id: 'gia-von',
    group: 'Giá vốn',
    name: 'Báo cáo giá vốn hàng bán',
    desc: 'Tổng hợp giá vốn phát sinh trong kỳ theo mặt hàng',
    icon: FileBarChart,
    apiPath: 'stock-summary',
  },
  {
    id: 'gia-von-ct',
    group: 'Giá vốn',
    name: 'Chi tiết giá vốn hàng bán',
    desc: 'Chi tiết từng dòng giá vốn phát sinh',
    icon: FileBarChart,
    apiPath: 'stock-detail',
  },
];

const GROUPS = [...new Set(REPORTS.map(r => r.group))];

export function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState<ReportDef | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<StockRow[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const openReport = useCallback(async (report: ReportDef) => {
    setSelectedReport(report);
    setLoading(true);
    setRows([]);
    try {
      const data = await inventoryApi.getStockSummaryReport({ keyword });
      setRows(data as StockRow[]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const handleSearch = () => {
    setKeyword(searchInput);
    if (selectedReport) openReport(selectedReport);
  };

  const totalClosingValue = rows.reduce((s, r) => s + (r.closingValue || 0), 0);
  const totalClosingQty = rows.reduce((s, r) => s + (r.closingQty || 0), 0);

  const chartData = rows.slice(0, 8).map(r => ({
    name: r.productName.length > 14 ? r.productName.slice(0, 14) + '…' : r.productName,
    value: Math.round((r.closingValue || 0) / 1_000_000),
  }));

  return (
    <div className="flex h-full">
      {/* Left sidebar — Report list */}
      <div className="w-72 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-blue-500" />
            Danh sách báo cáo
          </h2>
        </div>

        {GROUPS.map(group => (
          <div key={group}>
            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              {group}
            </div>
            {REPORTS.filter(r => r.group === group).map(report => {
              const Icon = report.icon;
              const isActive = selectedReport?.id === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => openReport(report)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-50 transition-colors hover:bg-blue-50 ${
                    isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <div className={`text-sm font-medium leading-snug ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                      {report.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{report.desc}</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 ml-auto mt-0.5 shrink-0" />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {!selectedReport ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <FileBarChart className="h-16 w-16 text-gray-200" />
            <p className="text-base font-medium">Chọn một báo cáo để xem</p>
            <p className="text-sm">Chọn báo cáo từ danh sách bên trái</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-800">{selectedReport.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedReport.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="Tìm mặt hàng..."
                      className="px-3 py-1.5 text-sm outline-none w-44"
                    />
                    <button onClick={handleSearch} className="px-2 py-1.5 text-gray-400 hover:text-blue-600 border-l border-gray-300">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => openReport(selectedReport)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Tải lại"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Xuất Excel">
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Đóng"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="text-xs font-semibold text-gray-500 mb-3">Top hàng hóa theo giá trị tồn (triệu đồng)</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`${v} triệu`, 'Giá trị tồn']} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Đang tải...
                </div>
              ) : rows.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  Không có dữ liệu
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 w-8">#</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 min-w-[80px]">Mã hàng</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 min-w-[160px]">Tên hàng hóa</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Nhóm</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">DVT</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-blue-50">SL đầu kỳ</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-blue-50">GT đầu kỳ</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-green-50">SL nhập</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-green-50">GT nhập</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-orange-50">SL xuất</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-orange-50">GT xuất</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-purple-50">SL cuối kỳ</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200 bg-purple-50">GT cuối kỳ</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Đơn giá vốn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
                          <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-3 py-2 text-orange-600 font-mono font-medium">{row.productCode}</td>
                          <td className="px-3 py-2 text-gray-800">{row.productName}</td>
                          <td className="px-3 py-2 text-gray-500">{row.productGroup || '—'}</td>
                          <td className="px-3 py-2 text-gray-500">{row.unit || '—'}</td>
                          <td className="px-3 py-2 text-right bg-blue-50/30">{fmt(row.openingQty || 0)}</td>
                          <td className="px-3 py-2 text-right bg-blue-50/30">{fmtM(row.openingValue || 0)}</td>
                          <td className="px-3 py-2 text-right bg-green-50/30">{fmt(row.importQty || 0)}</td>
                          <td className="px-3 py-2 text-right bg-green-50/30">{fmtM(row.importValue || 0)}</td>
                          <td className="px-3 py-2 text-right bg-orange-50/30">{fmt(row.exportQty || 0)}</td>
                          <td className="px-3 py-2 text-right bg-orange-50/30">{fmtM(row.exportValue || 0)}</td>
                          <td className="px-3 py-2 text-right font-semibold bg-purple-50/30">{fmt(row.closingQty || 0)}</td>
                          <td className="px-3 py-2 text-right font-semibold bg-purple-50/30">{fmtM(row.closingValue || 0)}</td>
                          <td className="px-3 py-2 text-right">{fmtM(row.unitCost || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={11} className="px-3 py-2 font-bold text-gray-700">Tổng cộng</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-800">{fmt(totalClosingQty)}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-800">{fmtM(totalClosingValue)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
