"use client";

import { Menu, Search, Bell } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NotificationButton } from "@/components/layout/NotificationButton";
import { UserMenu } from "@/components/layout/UserMenu";
import { useState } from "react";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 flex h-[60px] items-center gap-3 px-4 lg:px-6 no-print"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 2px 12px rgba(15,23,42,0.03)",
      }}
    >
      {/* Hamburger (mobile) */}
      <button
        type="button"
        aria-label="Mở menu"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-slate-600 shadow-soft transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-primary lg:hidden"
      >
        <Menu className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
      </button>

      {/* Breadcrumbs */}
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      {/* Global search */}
      <div
        className="hidden xl:flex h-9 w-72 items-center gap-2.5 rounded-xl border px-3 text-sm transition-all duration-200"
        style={{
          borderColor: searchFocused ? "var(--color-primary)" : "var(--color-border)",
          background: searchFocused ? "white" : "var(--color-surface-muted, #F8FAFC)",
          boxShadow: searchFocused ? "var(--focus-ring)" : "none",
        }}
      >
        <Search
          className="h-4 w-4 shrink-0 transition-colors"
          style={{ color: searchFocused ? "var(--color-primary)" : "#94A3B8" }}
        />
        <input
          className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Tìm đơn hàng, khách hàng..."
          aria-label="Tìm kiếm toàn cục"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd
          className="hidden shrink-0 select-none items-center gap-0.5 rounded border border-border bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 lg:flex"
        >
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  );
}
