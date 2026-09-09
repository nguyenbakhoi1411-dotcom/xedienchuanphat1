'use client';

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PeriodSelector, CashFlowViewer } from '../components';
import { useCashFlow } from '../hooks';
import { formatDate, startOfYear } from '../lib/date';

export function CashFlowPage() {
  const router = useRouter();
  const today = new Date();
  const [from, setFrom] = useState(formatDate(startOfYear(today), 'yyyy-MM-dd'));
  const [to, setTo] = useState(formatDate(today, 'yyyy-MM-dd'));
  const [method, setMethod] = useState<'direct' | 'indirect'>('direct');

  const { data: report, isLoading } = useCashFlow(from, to, method);

  const handlePeriodChange = (fromDate: string, toDate: string) => {
    setFrom(fromDate);
    setTo(toDate);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <ChevronLeft size={16} />
              Quay lại
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Báo cáo lưu chuyển tiền tệ (B03-DN)
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích dòng tiền từ hoạt động kinh doanh, đầu tư và tài chính
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <PeriodSelector
                onPeriodChange={handlePeriodChange}
                hideComparison={true}
              />

              {/* Method Selection */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Phương pháp tính
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="direct"
                      checked={method === 'direct'}
                      onChange={() => setMethod('direct')}
                      className="w-3 h-3 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Phương pháp trực tiếp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="method"
                      value="indirect"
                      checked={method === 'indirect'}
                      onChange={() => setMethod('indirect')}
                      className="w-3 h-3 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Phương pháp gián tiếp</span>
                  </label>
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Giải thích</h3>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Dòng tiền từ HĐKD: Tiền tạo ra từ kinh doanh</li>
                  <li>Dòng tiền từ HĐĐT: Tiền đầu tư vào tài sản</li>
                  <li>Dòng tiền từ HĐTC: Tiền từ vay nợ và cấp vốn</li>
                  <li>Nêu tổng âm: Tiền đang giảm</li>
                </ul>
              </div>

              {/* Cash Flow Indicators */}
              {report && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Chỉ tiêu quan trọng</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">HĐKD:</span>
                      <span className={`font-semibold ${
                        report.operatingActivities && report.operatingActivities > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {report.operatingActivities?.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">HĐĐT:</span>
                      <span className={`font-semibold ${
                        report.investingActivities && report.investingActivities > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {report.investingActivities?.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">HĐTC:</span>
                      <span className={`font-semibold ${
                        report.financingActivities && report.financingActivities > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {report.financingActivities?.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                      <span className="text-gray-600 font-semibold">Lưu chuyển ròng:</span>
                      <span className={`font-bold ${
                        report.netCashFlow && report.netCashFlow > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {report.netCashFlow?.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-gray-600">Đang tải báo cáo...</span>
                </div>
              </div>
            ) : report ? (
              <CashFlowViewer report={report} isLoading={isLoading} />
            ) : (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
