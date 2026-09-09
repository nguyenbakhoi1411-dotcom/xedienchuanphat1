'use client';

import React from 'react';
import { Download, PrinterIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CashFlowReport } from '../types';

interface CashFlowViewerProps {
  report?: CashFlowReport;
  isLoading?: boolean;
  fromDate?: string;
  toDate?: string;
}

export function CashFlowViewer({ report: _report, isLoading = false, fromDate, toDate }: CashFlowViewerProps) {
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

  const section = (title: string, rows: { label: string; value: number | undefined }[]) => (
    <>
      <tr className="bg-blue-50 font-semibold">
        <td className="px-4 py-2 text-sm" colSpan={2}>
          {title}
        </td>
        <td className="px-4 py-2 text-sm text-right font-bold">
          {formatCurrency(
            rows.reduce((sum, row) => sum + (row.value || 0), 0),
          )}
        </td>
      </tr>
      {rows.map((row, idx) => (
        <tr key={idx} className="border-b border-gray-200">
          <td className="px-4 py-2 text-sm">
            <div className="ml-4">{row.label}</div>
          </td>
          <td className="px-4 py-2 text-sm text-right">
            {formatCurrency(row.value)}
          </td>
          <td className="px-4 py-2 text-sm"></td>
        </tr>
      ))}
    </>
  );

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
            <TrendingUp size={20} className="text-blue-600" />
            <span>Báo cáo lưu chuyển tiền tệ (B03-DN) - Phương pháp trực tiếp</span>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(
          'bg-white p-4 rounded-lg border',
          report.operatingActivities && report.operatingActivities > 0
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50',
        )}>
          <p className="text-xs text-gray-600 mb-1">Lưu chuyển từ HĐKD</p>
          <p className={cn(
            'text-xl font-bold',
            report.operatingActivities && report.operatingActivities > 0
              ? 'text-green-600'
              : 'text-red-600',
          )}>
            {formatCurrency(report.operatingActivities)}
          </p>
        </div>
        <div className={cn(
          'bg-white p-4 rounded-lg border',
          report.investingActivities && report.investingActivities > 0
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50',
        )}>
          <p className="text-xs text-gray-600 mb-1">Lưu chuyển từ HĐĐT</p>
          <p className={cn(
            'text-xl font-bold',
            report.investingActivities && report.investingActivities > 0
              ? 'text-green-600'
              : 'text-red-600',
          )}>
            {formatCurrency(report.investingActivities)}
          </p>
        </div>
        <div className={cn(
          'bg-white p-4 rounded-lg border',
          report.financingActivities && report.financingActivities > 0
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50',
        )}>
          <p className="text-xs text-gray-600 mb-1">Lưu chuyển từ HĐTC</p>
          <p className={cn(
            'text-xl font-bold',
            report.financingActivities && report.financingActivities > 0
              ? 'text-green-600'
              : 'text-red-600',
          )}>
            {formatCurrency(report.financingActivities)}
          </p>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                Chỉ tiêu
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 w-40">
                Năm báo cáo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 w-40">
                Năm trước
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Operating Activities */}
            {section(
              'I. LƯỚI CHUYỂN TIỀN TỪ HOẠT ĐỘNG KINH DOANH',
              [
                { label: 'Doanh thu thuần từ bán hàng', value: report.operatingDetails?.revenueFromSales },
                { label: 'Thu tiền từ khách hàng', value: report.operatingDetails?.cashFromCustomers },
                { label: 'Chi mua hàng, dịch vụ', value: report.operatingDetails?.cashForSupplies },
                { label: 'Chi tiền lương, thưởng', value: report.operatingDetails?.cashForWages },
                { label: 'Chi thuế TNDN', value: report.operatingDetails?.cashForTaxes },
                { label: 'Chi khác cho hoạt động KD', value: report.operatingDetails?.otherOperatingExpenses },
                { label: 'Lưu chuyển tiền thuần từ HĐKD', value: report.operatingActivities },
              ],
            )}

            {/* Investing Activities */}
            {section(
              'II. LƯU CHUYỂN TIỀN TỪ HOẠT ĐỘNG ĐẦU TƯ',
              [
                { label: 'Tiền chi để mua TSCĐ', value: report.investingDetails?.cashForAssets },
                { label: 'Tiền thu từ thanh lý TSCĐ', value: report.investingDetails?.cashFromAssetSales },
                { label: 'Tiền chi cho các khoản vay', value: report.investingDetails?.cashForLoans },
                { label: 'Tiền thu từ các khoản vay', value: report.investingDetails?.cashFromLoans },
                { label: 'Lưu chuyển tiền thuần từ HĐĐT', value: report.investingActivities },
              ],
            )}

            {/* Financing Activities */}
            {section(
              'III. LƯU CHUYỂN TIỀN TỪ HOẠT ĐỘNG TÀI CHÍNH',
              [
                { label: 'Tiền thu từ phát hành cổ phiếu', value: report.financingDetails?.cashFromEquity },
                { label: 'Tiền trả cổ tức', value: report.financingDetails?.cashForDividends },
                { label: 'Tiền vay từ ngân hàng', value: report.financingDetails?.cashFromBanks },
                { label: 'Tiền trả nợ', value: report.financingDetails?.cashForDebtPayment },
                { label: 'Lưu chuyển tiền thuần từ HĐTC', value: report.financingActivities },
              ],
            )}

            {/* Net Change in Cash */}
            <tr className="bg-green-100 font-bold border-t-2 border-gray-300">
              <td className="px-4 py-3 text-sm">
                LƯU CHUYỂN TIỀN THUẦN TRONG KỲ (I+II+III)
              </td>
              <td className="px-4 py-3 text-sm text-right">
                {formatCurrency(report.netCashFlow)}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                {formatCurrency(report.netCashFlowPrevious)}
              </td>
            </tr>

            {/* Opening Cash Balance */}
            <tr className="bg-blue-50">
              <td className="px-4 py-2 text-sm">
                <div className="ml-4">Tiền đầu kỳ</div>
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.openingCashBalance)}
              </td>
              <td className="px-4 py-2 text-sm text-right">
                {formatCurrency(report.openingCashBalancePrevious)}
              </td>
            </tr>

            {/* Closing Cash Balance */}
            <tr className="bg-blue-200 font-bold">
              <td className="px-4 py-3 text-sm">
                <div className="ml-4">Tiền cuối kỳ</div>
              </td>
              <td className="px-4 py-3 text-sm text-right">
                {formatCurrency(report.closingCashBalance)}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                {formatCurrency(report.closingCashBalancePrevious)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Reconciliation */}
      {report.reconciliation && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-gray-900 mb-2">Kiểm chứng lưu chuyển tiền tệ:</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              Tiền cuối kỳ (theo B03) = {formatCurrency(report.closingCashBalance)}
            </p>
            <p>
              Tiền cuối kỳ (theo BCKT) = {formatCurrency(report.reconciliation.balanceSheetCash)}
            </p>
            {report.reconciliation.difference === 0 ? (
              <p className="text-green-600 font-semibold">✅ Báo cáo cân bằng</p>
            ) : (
              <p className="text-red-600 font-semibold">
                ❌ Lệch: {formatCurrency(report.reconciliation.difference)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
