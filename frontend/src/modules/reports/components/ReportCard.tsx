'use client';

import React from 'react';
import { Heart, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  category: string;
  isFavorite?: boolean;
  lastUsed?: string;
  onView: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function ReportCard({
  id,
  icon,
  name,
  description,
  category,
  isFavorite = false,
  lastUsed,
  onView,
  onToggleFavorite,
}: ReportCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg hover:border-blue-300">
      {/* Header with icon and favorite */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0 text-blue-600 p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">{name}</h3>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(id)}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            className={cn(isFavorite && 'fill-red-500 text-red-500')}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>

      {/* Footer with last used and view button */}
      <div className="flex items-center justify-between">
        {lastUsed && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            <span>{lastUsed}</span>
          </div>
        )}
        <button
          onClick={() => onView(id)}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          Xem báo cáo
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
