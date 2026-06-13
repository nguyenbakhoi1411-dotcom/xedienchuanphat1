'use client';

import React from 'react';
import { ReportCard } from './ReportCard';
import { cn } from '@/lib/utils';

export interface ReportItem {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  category: string;
  isFavorite?: boolean;
  lastUsed?: string;
}

interface ReportGridProps {
  reports: ReportItem[];
  onView: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  columns?: 2 | 3 | 4;
}

export function ReportGrid({
  reports,
  onView,
  onToggleFavorite,
  isLoading = false,
  isEmpty = false,
  columns = 3,
}: ReportGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div>
      {isLoading ? (
        <div className={cn('grid gap-4', gridCols[columns])}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg font-medium mb-2">Không tìm thấy báo cáo</p>
          <p className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className={cn('grid gap-4', gridCols[columns])}>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              id={report.id}
              icon={report.icon}
              name={report.name}
              description={report.description}
              category={report.category}
              isFavorite={report.isFavorite}
              lastUsed={report.lastUsed}
              onView={onView}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
