"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";
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
      <button
        type="button"
        className="flex h-10 items-center gap-3 rounded-lg border border-border bg-white px-2.5 shadow-soft transition-colors hover:bg-slate-50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-primary">
          {displayUser.avatarInitials}
        </span>
        <span className="hidden min-w-0 text-left md:block">
          <span className="block truncate text-sm font-semibold text-text">{displayUser.fullName}</span>
          <span className="block truncate text-xs text-slate-500">{displayUser.branchName}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-slate-500 md:block" />
      </button>

      <div className="pointer-events-none absolute right-0 top-12 z-50 w-64 rounded-lg border border-border bg-white p-2 opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-text">{displayUser.fullName}</p>
          <p className="text-xs text-slate-500">{displayUser.role}</p>
        </div>
        <button className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50 hover:text-primary">
          <UserRound className="h-4 w-4" />
          Hồ sơ cá nhân
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50 hover:text-primary"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
