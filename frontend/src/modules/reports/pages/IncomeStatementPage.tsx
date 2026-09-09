'use client';

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PeriodSelector, IncomeStatementViewer } from '../components';
import { useIncomeStatement } from '../hooks';
import { formatDate, startOfYear } from '../lib/date';

export function IncomeStatementPage() {
  const router = useRouter();
  const today = new Date();
  const [from, setFrom] = useState(formatDate(startOfYear(today), 'yyyy-MM-dd'));
  const [to, setTo] = useState(formatDate(today, 'yyyy-MM-dd'));
  const [compareFrom, setCompareFrom] = useState<string | undefined>();
  const [compareTo, setCompareTo] = useState<string | undefined>();

  const { data: report, isLoading } = useIncomeStatement(from, to, compareFrom, compareTo);

  const handlePeriodChange = (fromDate: string, toDate: string) => {
    setFrom(fromDate);
    setTo(toDate);
  };

  const handleComparisonChange = (fromDate: string, toDate: string, type: string) => {
    setCompareFrom(fromDate);
    setCompareTo(toDate);
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
            Báo cáo kết quả hoạt động (B02-DN)
          </h1>
          <p className="text-gray-600 mt-1">
            Tóm tắt doanh thu, lợi nhuận và các chỉ tiêu hiệu quả
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Period Selector */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <PeriodSelector
                onPeriodChange={handlePeriodChange}
                onComparisonChange={handleComparisonChange}
              />

              {/* Analysis Tips */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-semibold text-green-900 mb-2">📊 Phân tích</h3>
                <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                  <li>Theo dõi biến động doanh thu</li>
                  <li>Phân tích tỷ lệ lợi nhuận</li>
                  <li>So sánh với kỳ trước</li>
                  <li>Đánh giá hiệu quả hoạt động</li>
                </ul>
              </div>

              {/* Report Key Metrics */}
              {report && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Chỉ tiêu chính</h3>
                  <div className="space-y-2 text-xs">
                    {report.metrics?.grossProfitMargin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hệ số lợi nhuận gộp:</span>
                        <span className="font-semibold">
                          {report.metrics.grossProfitMargin.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {report.metrics?.operatingMargin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hệ số LNĐT:</span>
                        <span className="font-semibold">
                          {report.metrics.operatingMargin.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {report.metrics?.netProfitMargin && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hệ số lợi nhuận thuần:</span>
                        <span className="font-semibold">
                          {report.metrics.netProfitMargin.toFixed(1)}%
                        </span>
                      </div>
                    )}
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
              <IncomeStatementViewer report={report} isLoading={isLoading} />
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
