'use client';

import React from 'react';
import { Download, PrinterIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncomeStatementReport, IncomeStatementItem } from '../types';

interface IncomeStatementViewerProps {
  report?: IncomeStatementReport;
  isLoading?: boolean;
  fromDate?: string;
  toDate?: string;
}

interface RowProps {
  item: IncomeStatementItem;
  level: number;
}

function IncomeStatementRow({ item: _item, level }: RowProps) {
  const item = _item as any;
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    const formatted = Math.abs(value).toLocaleString('vi-VN');
    return value < 0 ? `(${formatted})` : formatted;
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return '-';
    return `${value.toFixed(2)}%`;
  };

  return (
    <tr
      className={cn(
        level === 1 && 'bg-blue-50 font-semibold',
        level === 2 && 'bg-gray-50 font-medium',
        item.isTotalRow && 'bg-yellow-50 font-bold',
        item.code.startsWith('I') && 'font-semibold text-blue-900',
      )}
    >
      <td className="px-4 py-2 text-sm">
        <div style={{ paddingLeft: `${level * 1.5}rem` }}>{item.code}</div>
      </td>
      <td className="px-4 py-2 text-sm">{item.name}</td>
      <td
        className={cn(
          'px-4 py-2 text-sm text-right font-medium',
          item.currentPeriod && item.currentPeriod < 0 && 'text-red-600',
        )}
      >
        {formatCurrency(item.currentPeriod)}
      </td>
      <td
        className={cn(
          'px-4 py-2 text-sm text-right font-medium',
          item.previousPeriod && item.previousPeriod < 0 && 'text-red-600',
        )}
      >
        {formatCurrency(item.previousPeriod)}
      </td>
      <td
        className={cn(
          'px-4 py-2 text-sm text-right',
          item.difference && item.difference > 0 && 'text-green-600',
          item.difference && item.difference < 0 && 'text-red-600',
        )}
      >
        {formatCurrency(item.difference)}
      </td>
      <td className="px-4 py-2 text-sm text-right text-gray-600">
        {item.percentOfRevenue !== undefined ? formatPercent(item.percentOfRevenue) : '-'}
      </td>
    </tr>
  );
}

export function IncomeStatementViewer({ report: _report, isLoading = false, fromDate, toDate }: IncomeStatementViewerProps) {
  const report = _report as any;
  if (isLoading || !report) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    const formatted = Math.abs(value).toLocaleString('vi-VN');
    return value < 0 ? `(${formatted})` : formatted;
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return '-';
    return `${value.toFixed(2)}%`;
  };

  const fmtDate = (d: string | null | undefined) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <h2 className="font-semibold text-gray-900">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            <span>Báo cáo kết quả hoạt động (B02-DN)</span>
            {fromDate && toDate && (
              <span className="text-xs text-gray-500 font-normal">
                (Từ ngày {fmtDate(fromDate)} đến ngày {fmtDate(toDate)})
              </span>
            )}
          </div>
        </h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Xuất
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
            <PrinterIcon size={16} />
            In
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Doanh thu thuần</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(report.revenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {report.revenueGrowth && report.revenueGrowth > 0
              ? `📈 +${report.revenueGrowth.toFixed(1)}%`
              : `📉 ${report.revenueGrowth?.toFixed(1)}%`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Lợi nhuận gộp</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(report.grossProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatPercent(report.metrics?.grossProfitMargin)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">LNĐT</p>
          <p className={cn(
            'text-xl font-bold',
            report.operatingProfit && report.operatingProfit > 0 ? 'text-green-600' : 'text-red-600',
          )}>
            {formatCurrency(report.operatingProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatPercent(report.metrics?.operatingMargin)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">LN sau thuế</p>
          <p className={cn(
            'text-xl font-bold',
            report.netProfit && report.netProfit > 0 ? 'text-green-600' : 'text-red-600',
          )}>
            {formatCurrency(report.netProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatPercent(report.metrics?.netProfitMargin)}
          </p>
        </div>
      </div>

      {/* Income Statement Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-20">
                Mã
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                Chỉ tiêu
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Kỳ báo cáo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Kỳ trước
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Chênh lệch
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                % DT
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Revenue Section */}
            <tr className="bg-blue-100 font-bold">
              <td colSpan={6} className="px-4 py-3 text-sm">
                DOANH THU
              </td>
            </tr>
            {report.revenueSection &&
              report.revenueSection.map((item: any) => (
                <IncomeStatementRow key={`${item.code}-${item.name}`} item={item} level={1} />
              ))}

            {/* Gross Profit Section */}
            <tr className="bg-green-100 font-bold">
              <td colSpan={6} className="px-4 py-3 text-sm">
                LỢI NHUẬN GỘP
              </td>
            </tr>
            {report.grossProfitSection &&
              report.grossProfitSection.map((item: any) => (
                <IncomeStatementRow key={`${item.code}-${item.name}`} item={item} level={1} />
              ))}

            {/* Operating Expenses Section */}
            <tr className="bg-yellow-100 font-bold">
              <td colSpan={6} className="px-4 py-3 text-sm">
                CHI PHÍ HOẠT ĐỘNG
              </td>
            </tr>
            {report.operatingExpensesSection &&
              report.operatingExpensesSection.map((item: any) => (
                <IncomeStatementRow key={`${item.code}-${item.name}`} item={item} level={1} />
              ))}

            {/* Operating Profit */}
            <tr className="bg-blue-200 font-bold">
              <td className="px-4 py-2 text-sm">I</td>
              <td className="px-4 py-2 text-sm">LỢI NHUẬN HOẠT ĐỘNG</td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.operatingProfit)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.operatingProfitPrevious)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(
                  report.operatingProfit && report.operatingProfitPrevious
                    ? report.operatingProfit - report.operatingProfitPrevious
                    : undefined,
                )}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatPercent(report.metrics?.operatingMargin)}
              </td>
            </tr>

            {/* Other Income/Expense Section */}
            <tr className="bg-orange-100 font-bold">
              <td colSpan={6} className="px-4 py-3 text-sm">
                KHOẢN KHÁC
              </td>
            </tr>
            {report.otherExpensesSection &&
              report.otherExpensesSection.map((item: any) => (
                <IncomeStatementRow key={`${item.code}-${item.name}`} item={item} level={1} />
              ))}

            {/* Profit Before Tax */}
            <tr className="bg-purple-200 font-bold">
              <td className="px-4 py-2 text-sm">II</td>
              <td className="px-4 py-2 text-sm">LỢI NHUẬN TRƯỚC THUẾ</td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.profitBeforeTax)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.profitBeforeTaxPrevious)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(
                  report.profitBeforeTax && report.profitBeforeTaxPrevious
                    ? report.profitBeforeTax - report.profitBeforeTaxPrevious
                    : undefined,
                )}
              </td>
              <td className="px-4 py-2 text-sm text-right">-</td>
            </tr>

            {/* Income Tax */}
            <tr className="bg-red-50">
              <td className="px-4 py-2 text-sm font-semibold">III</td>
              <td className="px-4 py-2 text-sm font-semibold">Chi phí thuế TNDN</td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.incomeTax)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.incomeTaxPrevious)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(
                  report.incomeTax && report.incomeTaxPrevious
                    ? report.incomeTax - report.incomeTaxPrevious
                    : undefined,
                )}
              </td>
              <td className="px-4 py-2 text-sm text-right">-</td>
            </tr>

            {/* Net Profit */}
            <tr className="bg-green-200 font-bold">
              <td className="px-4 py-2 text-sm">IV</td>
              <td className="px-4 py-2 text-sm">LỢI NHUẬN THUẦN (LN SAU THUẾ)</td>
              <td
                className={cn(
                  'px-4 py-2 text-sm text-right',
                  report.netProfit && report.netProfit > 0 ? 'text-green-700' : 'text-red-700',
                )}
              >
                {formatCurrency(report.netProfit)}
              </td>
              <td
                className={cn(
                  'px-4 py-2 text-sm text-right',
                  report.netProfitPrevious && report.netProfitPrevious > 0
                    ? 'text-green-700'
                    : 'text-red-700',
                )}
              >
                {formatCurrency(report.netProfitPrevious)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(
                  report.netProfit && report.netProfitPrevious
                    ? report.netProfit - report.netProfitPrevious
                    : undefined,
                )}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatPercent(report.metrics?.netProfitMargin)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
