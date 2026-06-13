'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PeriodSelectorProps {
  onPeriodChange?: (from: string, to: string) => void;
  onComparisonChange?: (from: string, to: string, type: string) => void;
  hideComparison?: boolean;
  compact?: boolean;
}

type PeriodType = 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom';
type ComparisonType = 'none' | 'previous-period' | 'year-over-year';

export function PeriodSelector({
  onPeriodChange,
  onComparisonChange,
  hideComparison = false,
  compact = false,
}: PeriodSelectorProps) {
  const today = new Date();
  const [periodType, setPeriodType] = useState<PeriodType>('this-month');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('none');
  const [customFrom, setCustomFrom] = useState<string>(
    format(startOfMonth(today), 'yyyy-MM-dd'),
  );
  const [customTo, setCustomTo] = useState<string>(format(today, 'yyyy-MM-dd'));
  const [showCustom, setShowCustom] = useState(false);

  const getPeriodRange = (type: PeriodType) => {
    const now = new Date();
    switch (type) {
      case 'this-month':
        return {
          from: format(startOfMonth(now), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd'),
        };
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return {
          from: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          to: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        };
      case 'this-quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        return {
          from: format(quarterStart, 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd'),
        };
      case 'this-year':
        return {
          from: format(startOfYear(now), 'yyyy-MM-dd'),
          to: format(now, 'yyyy-MM-dd'),
        };
      case 'custom':
        return { from: customFrom, to: customTo };
      default:
        return { from: '', to: '' };
    }
  };

  const getComparisonRange = (comparisonType: ComparisonType, mainFrom: string, mainTo: string) => {
    if (comparisonType === 'none') return null;

    const mainFromDate = new Date(mainFrom);
    const mainToDate = new Date(mainTo);
    const daysDiff = Math.floor((mainToDate.getTime() - mainFromDate.getTime()) / (1000 * 60 * 60 * 24));

    if (comparisonType === 'previous-period') {
      const prevFromDate = new Date(mainFromDate);
      prevFromDate.setDate(prevFromDate.getDate() - daysDiff - 1);
      const prevToDate = new Date(mainFromDate);
      prevToDate.setDate(prevToDate.getDate() - 1);
      return {
        from: format(prevFromDate, 'yyyy-MM-dd'),
        to: format(prevToDate, 'yyyy-MM-dd'),
      };
    }

    if (comparisonType === 'year-over-year') {
      const prevFromDate = new Date(mainFromDate);
      prevFromDate.setFullYear(prevFromDate.getFullYear() - 1);
      const prevToDate = new Date(mainToDate);
      prevToDate.setFullYear(prevToDate.getFullYear() - 1);
      return {
        from: format(prevFromDate, 'yyyy-MM-dd'),
        to: format(prevToDate, 'yyyy-MM-dd'),
      };
    }

    return null;
  };

  const handlePeriodChange = (type: PeriodType) => {
    setPeriodType(type);
    if (type !== 'custom') {
      setShowCustom(false);
      const range = getPeriodRange(type);
      onPeriodChange?.(range.from, range.to);
    }
  };

  const handleCustomPeriod = () => {
    onPeriodChange?.(customFrom, customTo);
  };

  const handleComparisonChange = (type: ComparisonType) => {
    setComparisonType(type);
    const mainRange = getPeriodRange(periodType === 'custom' ? periodType : periodType);
    const compRange = getComparisonRange(type, mainRange.from, mainRange.to);
    if (compRange) {
      onComparisonChange?.(compRange.from, compRange.to, type);
    }
  };

  const mainRange = getPeriodRange(periodType);
  const displayFrom = format(new Date(mainRange.from), 'dd/MM/yyyy');
  const displayTo = format(new Date(mainRange.to), 'dd/MM/yyyy');

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-500" />
        <span className="text-sm text-gray-600">
          {displayFrom} - {displayTo}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Period Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Kỳ báo cáo</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'this-month' as PeriodType, label: 'Tháng này' },
            { value: 'last-month' as PeriodType, label: 'Tháng trước' },
            { value: 'this-quarter' as PeriodType, label: 'Quý này' },
            { value: 'this-year' as PeriodType, label: 'Năm nay' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handlePeriodChange(value)}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                periodType === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`w-full px-3 py-2 text-xs font-medium rounded transition-colors ${
            periodType === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Tùy chọn
        </button>

        {showCustom && (
          <div className="space-y-2 p-2 bg-white rounded border border-gray-200">
            <div>
              <label className="text-xs text-gray-600">Từ ngày</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Đến ngày</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <button
              onClick={() => {
                handlePeriodChange('custom');
                handleCustomPeriod();
              }}
              className="w-full px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>

      {/* Selected Period Display */}
      <div className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200">
        <Calendar size={14} className="text-blue-600" />
        <span className="text-xs text-gray-700">
          <strong>Kỳ báo cáo:</strong> {displayFrom} - {displayTo}
        </span>
      </div>

      {/* Comparison Selection */}
      {!hideComparison && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <label className="text-sm font-semibold text-gray-700">So sánh với</label>
          <div className="space-y-1">
            {[
              { value: 'none' as ComparisonType, label: 'Không so sánh' },
              { value: 'previous-period' as ComparisonType, label: 'Kỳ trước' },
              { value: 'year-over-year' as ComparisonType, label: 'Năm trước (YoY)' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="comparison"
                  value={value}
                  checked={comparisonType === value}
                  onChange={() => handleComparisonChange(value)}
                  className="w-3 h-3 text-blue-600"
                />
                <span className="text-xs text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
