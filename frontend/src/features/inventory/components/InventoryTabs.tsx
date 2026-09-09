"use client";

import React, { useState } from 'react';
import {
  BarChart2, PackagePlus, PackageMinus, ArrowLeftRight,
  ClipboardList, FileBarChart, Package, Warehouse, History,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { InventoryTab } from '@/features/inventory/types';

const TABS: Array<{ id: InventoryTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'process',    label: 'Quy trình',         icon: GitBranch },
  { id: 'dashboard',  label: 'Biểu đồ',            icon: BarChart2 },
  { id: 'receipts',   label: 'Nhập kho',            icon: PackagePlus },
  { id: 'issues',     label: 'Xuất kho',            icon: PackageMinus },
  { id: 'transfers',  label: 'Chuyển kho',          icon: ArrowLeftRight },
  { id: 'stocktake',  label: 'Kiểm kê',             icon: ClipboardList },
  { id: 'costing',    label: 'Tính giá xuất kho',   icon: FileBarChart },
  { id: 'reports',    label: 'Báo cáo',             icon: FileBarChart },
  { id: 'products',   label: 'Hàng hóa, dịch vụ',  icon: Package },
  { id: 'warehouses', label: 'Kho',                 icon: Warehouse },
];

interface Props {
  value: InventoryTab;
  onChange: (v: InventoryTab) => void;
}

export function InventoryTabs({ value, onChange }: Props) {
  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
      <nav className="flex overflow-x-auto px-4" aria-label="Tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = value === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors shrink-0',
                active
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
