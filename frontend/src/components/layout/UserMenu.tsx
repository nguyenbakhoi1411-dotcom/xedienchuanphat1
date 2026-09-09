"use client";

import { ChevronDown, LogOut, UserRound, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAccessToken } from "@/lib/auth/token";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";

export function UserMenu() {
  const router = useRouter();
  const user = useCurrentUser();
  const displayUser = user ?? {
    avatarInitials: "CP",
    fullName: "Chưa đăng nhập",
    branchName: "Vui lòng đăng nhập",
    role: "USER"
  };

  function handleLogout() {
    clearAccessToken();
    router.push("/login");
  }

  return (
    <div className="group relative">
      {/* Trigger button */}
      <button
        type="button"
        className="flex h-9 items-center gap-2.5 rounded-xl border border-border bg-white px-2 shadow-soft transition-all hover:border-slate-300 hover:bg-slate-50"
      >
        {/* Avatar */}
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          {displayUser.avatarInitials}
        </span>
        <span className="hidden min-w-0 text-left md:block">
          <span className="block truncate text-[13px] font-semibold text-text max-w-[120px]">
            {displayUser.fullName}
          </span>
        </span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 transition-transform group-hover:rotate-180 md:block" />
      </button>

      {/* Dropdown */}
      <div
        className="pointer-events-none absolute right-0 top-11 z-50 w-60 rounded-2xl border border-border bg-white p-1.5 opacity-0 shadow-dropdown transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0"
        style={{
          boxShadow: "var(--shadow-dropdown)",
          transform: "translateY(-4px)",
          transition: "opacity 0.15s, transform 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        {/* User info header */}
        <div
          className="mb-1 rounded-xl px-3 py-3"
          style={{ background: "linear-gradient(135deg, #FFF7ED, #FFEDD5)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {displayUser.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text truncate">{displayUser.fullName}</p>
              <p className="text-[11px] font-medium text-slate-500">{displayUser.role}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-primary"
        >
          <UserRound className="h-4 w-4 flex-shrink-0" />
          Hồ sơ cá nhân
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-primary"
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          Cài đặt
        </button>

        <div className="my-1 border-t border-border" />

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
