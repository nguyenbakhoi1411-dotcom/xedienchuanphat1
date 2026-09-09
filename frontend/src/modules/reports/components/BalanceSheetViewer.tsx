'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Download, PrinterIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BalanceSheetReport, BalanceSheetItem } from '../types';

interface BalanceSheetViewerProps {
  report?: BalanceSheetReport;
  isLoading?: boolean;
  currencyUnit?: 'vnd' | 'thousands' | 'millions';
  fromDate?: string;
  toDate?: string;
}

interface RowProps {
  item: BalanceSheetItem;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function BalanceSheetRow({ item, level, isExpanded, onToggle }: RowProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isTotal = item.isTotalRow;

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-';
    const formatted = Math.abs(value).toLocaleString('vi-VN');
    return value < 0 ? `(${formatted})` : formatted;
  };

  return (
    <>
      <tr
        className={cn(
          level === 1 && 'bg-blue-50',
          level === 2 && 'bg-gray-50',
          isTotal && 'font-semibold bg-yellow-50',
        )}
      >
        <td className="px-4 py-2 text-sm">
          <div style={{ paddingLeft: `${level * 1.5}rem` }} className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <span className="font-medium">{item.code}</span>
          </div>
        </td>
        <td className="px-4 py-2 text-sm text-gray-700">{item.name}</td>
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
        <td className="px-4 py-2 text-xs text-gray-500">{item.note || '-'}</td>
      </tr>
      {isExpanded && hasChildren && (
        <>
          {item.children!.map((child) => (
            <BalanceSheetRow
              key={`${child.code}-${child.name}`}
              item={child}
              level={level + 1}
              isExpanded={true}
              onToggle={() => {}}
            />
          ))}
        </>
      )}
    </>
  );
}

export function BalanceSheetViewer({
  report,
  isLoading = false,
  currencyUnit = 'vnd',
  fromDate,
  toDate,
}: BalanceSheetViewerProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['assets', 'liabilities', 'equity']));

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  if (isLoading || !report) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const hasChildren = (item: BalanceSheetItem) => item.children && item.children.length > 0;

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
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>Bảng cân đối kế toán (B01-DN)</span>
          {toDate && (
            <span className="text-xs text-gray-500 font-normal">
              (Tại ngày {fmtDate(toDate)})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Xuất
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <PrinterIcon size={16} />
            In
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {report.balanceError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠️ <strong>Cảnh báo:</strong> Bảng cân đối chưa cân bằng.
            Lệch: {report.balanceError.toLocaleString('vi-VN')}
          </p>
        </div>
      )}

      {/* Balance Sheet Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Mã TK</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Chỉ tiêu</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Năm báo cáo
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                Năm trước
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Chênh lệch</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {/* Assets Section */}
            {report.assets && (
              <>
                <tr className="bg-blue-100 font-bold">
                  <td colSpan={6} className="px-4 py-3 text-sm">
                    <button
                      onClick={() => toggleRow('assets')}
                      className="flex items-center gap-2"
                    >
                      {expandedRows.has('assets') ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      TÀI SẢN (ASSETS)
                    </button>
                  </td>
                </tr>
                {expandedRows.has('assets') && (
                  <>
                    {/* Current Assets */}
                    <tr className="bg-blue-50 font-semibold">
                      <td colSpan={6} className="px-4 py-2 text-sm">
                        <div className="ml-4">
                          <button
                            onClick={() => toggleRow('current-assets')}
                            className="flex items-center gap-2"
                          >
                            {expandedRows.has('current-assets') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Tài sản ngắn hạn
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has('current-assets') && report.assets.currentAssets && (
                      <>
                        {report.assets.currentAssets.map((item) => (
                          <BalanceSheetRow
                            key={`${item.code}-${item.name}`}
                            item={item}
                            level={3}
                            isExpanded={expandedRows.has(`${item.code}-${item.name}`)}
                            onToggle={() => toggleRow(`${item.code}-${item.name}`)}
                          />
                        ))}
                      </>
                    )}

                    {/* Fixed Assets */}
                    <tr className="bg-blue-50 font-semibold">
                      <td colSpan={6} className="px-4 py-2 text-sm">
                        <div className="ml-4">
                          <button
                            onClick={() => toggleRow('fixed-assets')}
                            className="flex items-center gap-2"
                          >
                            {expandedRows.has('fixed-assets') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Tài sản dài hạn
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has('fixed-assets') && report.assets.fixedAssets && (
                      <>
                        {report.assets.fixedAssets.map((item) => (
                          <BalanceSheetRow
                            key={`${item.code}-${item.name}`}
                            item={item}
                            level={3}
                            isExpanded={expandedRows.has(`${item.code}-${item.name}`)}
                            onToggle={() => toggleRow(`${item.code}-${item.name}`)}
                          />
                        ))}
                      </>
                    )}

                    {/* Total Assets */}
                    <tr className="font-bold bg-blue-200">
                      <td className="px-4 py-2 text-sm">100</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="ml-4">CỘNG TÀI SẢN</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {report.assets.totalAssets?.toLocaleString('vi-VN') || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {report.assets.previousTotalAssets?.toLocaleString('vi-VN') || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">-</td>
                      <td className="px-4 py-2 text-sm">-</td>
                    </tr>
                  </>
                )}
              </>
            )}

            {/* Liabilities & Equity Section */}
            {report.liabilitiesEquity && (
              <>
                <tr className="bg-green-100 font-bold">
                  <td colSpan={6} className="px-4 py-3 text-sm">
                    <button
                      onClick={() => toggleRow('liabilities-equity')}
                      className="flex items-center gap-2"
                    >
                      {expandedRows.has('liabilities-equity') ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      NGUỒN VỐN (LIABILITIES & EQUITY)
                    </button>
                  </td>
                </tr>
                {expandedRows.has('liabilities-equity') && (
                  <>
                    {/* Liabilities */}
                    <tr className="bg-green-50 font-semibold">
                      <td colSpan={6} className="px-4 py-2 text-sm">
                        <div className="ml-4">
                          <button
                            onClick={() => toggleRow('liabilities')}
                            className="flex items-center gap-2"
                          >
                            {expandedRows.has('liabilities') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Nợ phải trả
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has('liabilities') && report.liabilitiesEquity.liabilities && (
                      <>
                        {report.liabilitiesEquity.liabilities.map((item) => (
                          <BalanceSheetRow
                            key={`${item.code}-${item.name}`}
                            item={item}
                            level={3}
                            isExpanded={expandedRows.has(`${item.code}-${item.name}`)}
                            onToggle={() => toggleRow(`${item.code}-${item.name}`)}
                          />
                        ))}
                      </>
                    )}

                    {/* Equity */}
                    <tr className="bg-green-50 font-semibold">
                      <td colSpan={6} className="px-4 py-2 text-sm">
                        <div className="ml-4">
                          <button
                            onClick={() => toggleRow('equity')}
                            className="flex items-center gap-2"
                          >
                            {expandedRows.has('equity') ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            Vốn chủ sở hữu
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has('equity') && report.liabilitiesEquity.equity && (
                      <>
                        {report.liabilitiesEquity.equity.map((item) => (
                          <BalanceSheetRow
                            key={`${item.code}-${item.name}`}
                            item={item}
                            level={3}
                            isExpanded={expandedRows.has(`${item.code}-${item.name}`)}
                            onToggle={() => toggleRow(`${item.code}-${item.name}`)}
                          />
                        ))}
                      </>
                    )}

                    {/* Total Liabilities & Equity */}
                    <tr className="font-bold bg-green-200">
                      <td className="px-4 py-2 text-sm">200/300</td>
                      <td className="px-4 py-2 text-sm">
                        <div className="ml-4">CỘNG NGUỒN VỐN</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {report.liabilitiesEquity.total?.toLocaleString('vi-VN') || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {report.liabilitiesEquity.previousTotal?.toLocaleString('vi-VN') || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">-</td>
                      <td className="px-4 py-2 text-sm">-</td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
