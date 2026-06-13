"use client";

import { Users, Building2, UserCheck, Settings } from "lucide-react";

interface BottomNavProps {
  onTabChange?: (tab: string) => void;
}

const navItems = [
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "suppliers", label: "Nhà cung cấp", icon: Building2 },
  { id: "employees", label: "Nhân viên", icon: UserCheck },
  { id: "options", label: "Tùy chọn", icon: Settings }
];

export function BottomNavigation({ onTabChange }: BottomNavProps) {
  return (
    <nav className="border-t border-border">
      <div className="flex items-center justify-start gap-2 px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-orange-50 hover:text-primary transition-colors"
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
