'use client';

import React, { useState } from 'react';
import { navItems } from '../types';

interface OpsNavBarProps {
  activeTab?: number;
  onTabChange?: (tabId: number) => void;
}

export function OpsNavBar({ activeTab = 1, onTabChange }: OpsNavBarProps) {
  const [selected, setSelected] = useState(activeTab);

  const handleTabClick = (tabId: number) => {
    setSelected(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="flex gap-2 border-b border-gray-200 bg-white p-4">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleTabClick(item.id)}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            selected === item.id
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
