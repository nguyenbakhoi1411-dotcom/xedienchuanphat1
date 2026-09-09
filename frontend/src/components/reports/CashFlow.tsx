"use client";

import React from "react";
import ReportNumber from "./ReportNumber";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface CashFlowProps {
  data: any;
  loading?: boolean;
}

export default function CashFlow({ data, loading }: CashFlowProps) {
  if (loading && !data) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  }

  if (!data) return null;

  const { cashIn, cashOut, netCashFlow } = data;
  
  // NOTE: Cash flow data is aggregated from standard endpoints.
  // In a full implementation, the endpoint should return details.
  // We mock the sections for UI completeness based on standard TT200 structure.

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Tổng Thu</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            <ReportNumber value={cashIn} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Tổng Chi</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            <ReportNumber value={cashOut} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-violet-600 mb-2">
            <div className="p-1.5 bg-violet-50 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Lưu Chuyển Tiền Thuần</span>
          </div>
          <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            <ReportNumber value={netCashFlow} showSign />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 uppercase">Báo cáo lưu chuyển tiền tệ</h3>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-normal">Chỉ tiêu</th>
              <th className="px-6 py-3 font-normal text-right w-48">Số tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="bg-gray-50/50">
              <td className="px-6 py-3 font-bold text-gray-900 uppercase" colSpan={2}>I. Lưu chuyển tiền từ hoạt động kinh doanh</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700 pl-10">1. Tiền thu từ bán hàng, cung cấp dịch vụ và doanh thu khác</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={cashIn} /></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700 pl-10">2. Tiền chi trả cho người cung cấp hàng hóa và dịch vụ, NV...</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={cashOut > 0 ? -cashOut : cashOut} parentheses /></td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-3 text-gray-900">Lưu chuyển tiền thuần từ hoạt động kinh doanh</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={netCashFlow} parentheses /></td>
            </tr>

            <tr className="bg-gray-50/50">
              <td className="px-6 py-3 font-bold text-gray-900 uppercase" colSpan={2}>II. Lưu chuyển tiền từ hoạt động đầu tư</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-gray-500 italic text-center" colSpan={2}>Không có dữ liệu phát sinh</td>
            </tr>

            <tr className="bg-gray-50/50">
              <td className="px-6 py-3 font-bold text-gray-900 uppercase" colSpan={2}>III. Lưu chuyển tiền từ hoạt động tài chính</td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-gray-500 italic text-center" colSpan={2}>Không có dữ liệu phát sinh</td>
            </tr>
          </tbody>
          <tfoot className="border-t-2 border-gray-200">
            <tr className={netCashFlow >= 0 ? "bg-emerald-50" : "bg-red-50"}>
              <td className="px-6 py-4 font-bold text-gray-900 uppercase">Lưu chuyển tiền thuần trong kỳ</td>
              <td className="px-6 py-4 text-right font-bold text-lg">
                <ReportNumber value={netCashFlow} type={netCashFlow >= 0 ? "profit" : "cost"} parentheses />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
