'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  PieChart,
  Settings,
  Zap,
} from 'lucide-react';

export type ReportGroup =
  | 'all'
  | 'financial'
  | 'general_ledger'
  | 'sales'
  | 'purchase'
  | 'inventory'
  | 'cash'
  | 'receivables'
  | 'payables'
  | 'payroll'
  | 'tax';

interface TabFilterProps {
  activeTab: ReportGroup;
  onTabChange: (tab: ReportGroup) => void;
  showAllTab?: boolean;
}

const TABS: { value: ReportGroup; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Tất cả', icon: <Zap size={16} /> },
  { value: 'financial', label: 'Tài chính', icon: <DollarSign size={16} /> },
  { value: 'general_ledger', label: 'Tổng hợp', icon: <BookOpen size={16} /> },
  { value: 'sales', label: 'Bán hàng', icon: <ShoppingCart size={16} /> },
  { value: 'purchase', label: 'Mua hàng', icon: <Package size={16} /> },
  { value: 'inventory', label: 'Kho hàng', icon: <Package size={16} /> },
  { value: 'cash', label: 'Tiền', icon: <DollarSign size={16} /> },
  { value: 'receivables', label: 'Phải thu', icon: <BarChart3 size={16} /> },
  { value: 'payables', label: 'Phải trả', icon: <BarChart3 size={16} /> },
  { value: 'payroll', label: 'Lương', icon: <Users size={16} /> },
  { value: 'tax', label: 'Thuế', icon: <PieChart size={16} /> },
];

export function TabFilter({ activeTab, onTabChange, showAllTab = true }: TabFilterProps) {
  const visibleTabs = showAllTab ? TABS : TABS.slice(1);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 border-b border-gray-200">
      {visibleTabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors',
            activeTab === tab.value
              ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
