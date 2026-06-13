"use client";

import { ExternalLink } from "lucide-react";

interface ReportsListProps {
  onReportSelect?: (report: string) => void;
}

const reports = [
  "Bảng kê số dư tiền theo ngày",
  "Dòng tiền",
  "S03a1-DNN: Sổ nhật ký thu tiền",
  "Sổ kế toán chi tiết quỹ tiền mặt",
  "S03a2-DNN: Sổ nhật ký chi tiền"
];

export function ReportsList({ onReportSelect }: ReportsListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-text">BÁO CÁO</h2>
      </div>

      {/* Reports List */}
      <div className="space-y-2">
        {reports.map((report, idx) => (
          <button
            key={idx}
            onClick={() => onReportSelect?.(report)}
            className="group flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm text-text hover:bg-orange-50 hover:text-primary transition-colors"
          >
            <span className="mt-1 text-slate-400 group-hover:text-primary">•</span>
            <span className="flex-1">{report}</span>
          </button>
        ))}
      </div>

      {/* View All Reports Link */}
      <div className="border-t border-border pt-3">
        <button className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          Tất cả báo cáo
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
