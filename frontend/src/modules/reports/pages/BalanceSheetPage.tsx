'use client';

import React, { useState } from 'react';
import { ChevronLeft, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PeriodSelector, BalanceSheetViewer } from '../../components';
import { useBalanceSheet } from '../../hooks';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function BalanceSheetPage() {
  const router = useRouter();
  const today = new Date();
  const [asOf, setAsOf] = useState(format(today, 'yyyy-MM-dd'));
  const [compareTo, setCompareTo] = useState<string | undefined>();
  const [currencyUnit, setCurrencyUnit] = useState<'vnd' | 'thousands' | 'millions'>('vnd');

  const { data: report, isLoading } = useBalanceSheet(asOf, compareTo);

  const handlePeriodChange = (from: string, to: string) => {
    setAsOf(to); // Use the end date for balance sheet
  };

  const handleComparisonChange = (from: string, to: string, type: string) => {
    setCompareTo(to);
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
            Bảng cân đối kế toán (B01-DN)
          </h1>
          <p className="text-gray-600 mt-1">
            Tóm tắt tài sản, nợ phải trả và vốn chủ sở hữu
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

              {/* Currency Unit */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Đơn vị tiền tệ
                </label>
                <select
                  value={currencyUnit}
                  onChange={(e) =>
                    setCurrencyUnit(e.target.value as 'vnd' | 'thousands' | 'millions')
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vnd">VND</option>
                  <option value="thousands">Nghìn VND</option>
                  <option value="millions">Triệu VND</option>
                </select>
              </div>

              {/* Quick Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Hướng dẫn</h3>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Nhấp vào các mũi tên để xem chi tiết</li>
                  <li>Sử dụng tab kỳ báo cáo để so sánh</li>
                  <li>Số tiền âm hiển thị trong ngoặc</li>
                </ul>
              </div>
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
              <BalanceSheetViewer
                report={report}
                isLoading={isLoading}
                currencyUnit={currencyUnit}
              />
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
