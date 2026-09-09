'use client';

import React from 'react';
import { Calendar, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '../lib/date';
import type { DeadlineItem } from '../types';

interface DeadlineWidgetProps {
  deadlines: DeadlineItem[];
  isLoading?: boolean;
  maxItems?: number;
}

export function DeadlineWidget({
  deadlines = [],
  isLoading = false,
  maxItems = 5,
}: DeadlineWidgetProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedDeadlines = [...deadlines].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });

  const getDeadlineStatus = (dueDate: string | Date) => {
    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);

    if (today.getTime() > deadline.getTime()) {
      return 'overdue';
    }

    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil === 0) return 'today';
    if (daysUntil <= 7) return 'soon';
    return 'normal';
  };

  const getStatusColor = (status: string, priority: string) => {
    if (status === 'overdue') return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'today') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (status === 'soon') {
      return priority === 'high'
        ? 'text-red-600 bg-red-50 border-red-200'
        : 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getDaysRemaining = (dueDate: string | Date) => {
    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysRemaining;
  };

  return (
    <div className="sticky top-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-blue-600" />
        <h3 className="font-semibold text-gray-900">Thời hạn nộp báo cáo</h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : deadlines.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Không có thời hạn sắp tới</p>
      ) : (
        <div className="space-y-2">
          {sortedDeadlines.slice(0, maxItems).map((deadline) => {
            const status = getDeadlineStatus(deadline.dueDate);
            const daysRemaining = getDaysRemaining(deadline.dueDate);
            const statusColor = getStatusColor(status, deadline.priority || deadline.urgency || 'medium');

            return (
              <div
                key={deadline.id}
                className={cn(
                  'p-3 border rounded-lg transition-colors',
                  statusColor,
                  deadline.completed && 'opacity-50 line-through',
                )}
              >
                <div className="flex items-start gap-2">
                  {status === 'overdue' && <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />}
                  {status !== 'overdue' && (
                    <Clock size={14} className="flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{deadline.name || deadline.title}</p>
                    {deadline.description && (
                      <p className="text-xs opacity-75 line-clamp-1">{deadline.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs">
                        {formatDate(new Date(deadline.dueDate), 'dd/MM/yyyy')}
                      </span>
                      <span className="text-xs font-semibold">
                        {status === 'overdue' && 'Quá hạn'}
                        {status === 'today' && 'Hôm nay'}
                        {status === 'soon' && `Còn ${daysRemaining} ngày`}
                        {status === 'normal' && `Còn ${daysRemaining} ngày`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {deadlines.length > maxItems && (
            <button className="w-full mt-2 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
              Xem tất cả ({deadlines.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
