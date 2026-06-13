'use client';

import React from 'react';
import { FileText, TrendingUp, Clock, Settings, Activity } from 'lucide-react';
import { reportItems } from '../types';

interface ReportPanelProps {
  onReportClick?: (reportId: string) => void;
}

const reportIcons: Record<string, React.ReactNode> = {
  'daily-summary': <TrendingUp className="h-5 w-5 text-blue-500" />,
  'account-balance': <FileText className="h-5 w-5 text-green-500" />,
  'pending': <Clock className="h-5 w-5 text-orange-500" />,
  'reconciliation': <Settings className="h-5 w-5 text-purple-500" />,
  'audit': <Activity className="h-5 w-5 text-red-500" />,
};

export function ReportPanel({ onReportClick }: ReportPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Báo cáo</h3>

      <div className="space-y-2">
        {reportItems.map((report) => (
          <button
            key={report.id}
            onClick={() => onReportClick?.(report.id)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition-all hover:border-orange-300 hover:bg-orange-50"
          >
            <div className="flex items-center gap-3">
              {reportIcons[report.id] || <FileText className="h-5 w-5" />}
              <span className="text-sm font-medium text-gray-700">{report.title}</span>
            </div>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {report.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {reportItems.length === 0 && (
        <div className="rounded-lg bg-gray-50 py-8 text-center">
          <p className="text-sm text-gray-500">Không có báo cáo</p>
        </div>
      )}
    </div>
  );
}
