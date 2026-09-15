'use client';

import React from 'react';
import { ChevronRight, Loader } from 'lucide-react';

interface RecentReportItemProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  viewedAt?: string;
  onView: (id: string) => void;
}

export function RecentReportItem({ id, name, icon, viewedAt, onView }: RecentReportItemProps) {
  return (
    <button
      onClick={() => onView(id)}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
    >
      <div className="flex-shrink-0 text-gray-600 group-hover:text-blue-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        {viewedAt && <p className="text-xs text-gray-500">{viewedAt}</p>}
      </div>
      <ChevronRight size={16} className="flex-shrink-0 text-gray-400 group-hover:text-blue-600" />
    </button>
  );
}

interface RecentReportsSectionProps {
  reports: Omit<RecentReportItemProps, 'onView'>[];
  onView: (id: string) => void;
  isLoading?: boolean;
}

export function RecentReportsSection({
  reports,
  onView,
  isLoading = false,
}: RecentReportsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">Chưa sử dụng báo cáo nào</p>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <RecentReportItem
          key={report.id}
          id={report.id}
          name={report.name}
          icon={report.icon}
          viewedAt={report.viewedAt}
          onView={onView}
        />
      ))}
    </div>
  );
}
