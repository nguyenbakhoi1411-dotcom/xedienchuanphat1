"use client";

import React, { useState } from "react";
import ReportNumber from "./ReportNumber";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TrialBalanceProps {
  data: any;
  loading?: boolean;
  onAccountClick?: (code: string) => void;
}

export default function TrialBalance({ data, loading, onAccountClick }: TrialBalanceProps) {
  const [showZero, setShowZero] = useState(false);
  const [collapseLevel1, setCollapseLevel1] = useState(false);

  if (loading && !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!data || !data.rows || data.rows.length === 0) {
    return <div className="text-center py-10 text-gray-500">Không có dữ liệu phát sinh trong kỳ.</div>;
  }

  const {
    rows,
    totalOpeningDebit, totalOpeningCredit,
    totalPeriodDebit, totalPeriodCredit,
    totalClosingDebit, totalClosingCredit
  } = data;

  const isBalanced = Math.abs((totalClosingDebit || 0) - (totalClosingCredit || 0)) < 1;

  const filteredRows = rows.filter((row: any) => {
    if (collapseLevel1 && row.level > 1) return false;
    if (!showZero) {
      if (row.openingDebit === 0 && row.openingCredit === 0 &&
          row.periodDebit === 0 && row.periodCredit === 0 &&
          row.closingDebit === 0 && row.closingCredit === 0) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showZero} onChange={e => setShowZero(e.target.checked)} className="rounded text-violet-600 focus:ring-violet-500" />
            <span className="text-sm text-gray-700">Hiện dòng bằng 0</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={collapseLevel1} onChange={e => setCollapseLevel1(e.target.checked)} className="rounded text-violet-600 focus:ring-violet-500" />
            <span className="text-sm text-gray-700">Chỉ hiện TK cấp 1</span>
          </label>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700 animate-pulse'}`}>
          {isBalanced ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {isBalanced ? "Cân đối" : "⚠ Mất cân đối!"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <tr>
                <th rowSpan={2} className="px-4 py-3 font-semibold border-r">Tài khoản</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-r border-b">Số dư đầu kỳ</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-r border-b">Phát sinh trong kỳ</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-b">Số dư cuối kỳ</th>
              </tr>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 text-right border-r">Nợ</th>
                <th className="px-4 py-2 text-right border-r">Có</th>
                <th className="px-4 py-2 text-right border-r">Nợ</th>
                <th className="px-4 py-2 text-right border-r">Có</th>
                <th className="px-4 py-2 text-right border-r">Nợ</th>
                <th className="px-4 py-2 text-right">Có</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row: any) => (
                <tr key={row.accountCode} className={`hover:bg-blue-50/50 transition-colors ${row.level === 1 ? 'bg-gray-50/50 font-medium' : ''}`}>
                  <td className="px-4 py-2.5 border-r whitespace-nowrap">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${(row.level - 1) * 1.5}rem` }}>
                      <button 
                        onClick={() => onAccountClick && onAccountClick(row.accountCode)}
                        className={`hover:text-violet-600 hover:underline ${row.level === 1 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                      >
                        {row.accountCode} - {row.accountName}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right border-r"><ReportNumber value={row.openingDebit} /></td>
                  <td className="px-4 py-2 text-right border-r"><ReportNumber value={row.openingCredit} /></td>
                  <td className="px-4 py-2 text-right border-r"><ReportNumber value={row.periodDebit} /></td>
                  <td className="px-4 py-2 text-right border-r"><ReportNumber value={row.periodCredit} /></td>
                  <td className="px-4 py-2 text-right border-r"><ReportNumber value={row.closingDebit} /></td>
                  <td className="px-4 py-2 text-right"><ReportNumber value={row.closingCredit} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold border-t border-gray-300 text-gray-900">
              <tr>
                <td className="px-4 py-3 text-right border-r">Tổng cộng:</td>
                <td className="px-4 py-3 text-right border-r"><ReportNumber value={totalOpeningDebit} /></td>
                <td className="px-4 py-3 text-right border-r"><ReportNumber value={totalOpeningCredit} /></td>
                <td className="px-4 py-3 text-right border-r"><ReportNumber value={totalPeriodDebit} /></td>
                <td className="px-4 py-3 text-right border-r"><ReportNumber value={totalPeriodCredit} /></td>
                <td className="px-4 py-3 text-right border-r"><ReportNumber value={totalClosingDebit} /></td>
                <td className="px-4 py-3 text-right"><ReportNumber value={totalClosingCredit} /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
