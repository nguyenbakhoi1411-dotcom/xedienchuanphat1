"use client";

import { Menu, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NotificationButton } from "@/components/layout/NotificationButton";
import { UserMenu } from "@/components/layout/UserMenu";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur lg:px-6">
      <button
        type="button"
        aria-label="Mo menu"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-slate-600 shadow-soft hover:bg-orange-50 hover:text-primary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <label className="hidden h-10 w-80 items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 text-sm text-slate-500 transition focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 xl:flex">
        <Search className="h-4 w-4 shrink-0" />
        <input
          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          placeholder="Tìm đơn hàng, khách hàng, sản phẩm"
          aria-label="Tìm kiếm toàn cục"
        />
      </label>

      <NotificationButton />
      <UserMenu />
    </header>
  );
}
