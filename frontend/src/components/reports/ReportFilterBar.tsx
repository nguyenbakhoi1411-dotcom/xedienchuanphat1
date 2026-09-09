"use client";

import React, { useState, useEffect } from "react";
import { Download, Calendar, Search } from "lucide-react";

interface ReportFilterBarProps {
  fromDate: string;
  toDate: string;
  onChange: (from: string, to: string) => void;
  onApply: () => void;
  onExport?: () => void;
  loading?: boolean;
}

const PRESETS = [
  { label: "Hôm nay", getValue: () => { const d = new Date().toISOString().slice(0, 10); return [d, d]; } },
  { label: "Tháng này", getValue: () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      return [`${y}-${m}-01`, `${y}-${m}-${String(lastDay).padStart(2, "0")}`];
  }},
  { label: "Tháng trước", getValue: () => {
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      return [`${y}-${m}-01`, `${y}-${m}-${String(lastDay).padStart(2, "0")}`];
  }},
  { label: "Năm nay", getValue: () => {
      const y = new Date().getFullYear();
      return [`${y}-01-01`, `${y}-12-31`];
  }}
];

export default function ReportFilterBar({
  fromDate,
  toDate,
  onChange,
  onApply,
  onExport,
  loading
}: ReportFilterBarProps) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (fromDate > toDate) {
      setError("Từ ngày không được lớn hơn Đến ngày");
    } else {
      setError("");
    }
  }, [fromDate, toDate]);

  const handleApply = () => {
    if (!error) onApply();
  };

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 shadow-sm print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              className="text-sm border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
              onChange={(e) => {
                const preset = PRESETS[Number(e.target.value)];
                if (preset) {
                  const [f, t] = preset.getValue();
                  onChange(f, t);
                }
              }}
              defaultValue="1"
            >
              <option value="-1">Tùy chỉnh...</option>
              {PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onChange(e.target.value, toDate)}
              className="text-sm border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            />
            <span className="text-gray-500 text-sm">đến</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onChange(fromDate, e.target.value)}
              className="text-sm border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            disabled={!!error || loading}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            Xem báo cáo
          </button>
          
          {onExport && (
            <button
              onClick={onExport}
              disabled={loading}
              className="flex items-center gap-2 border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
