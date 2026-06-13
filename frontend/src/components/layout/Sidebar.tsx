"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { navigationGroups } from "@/constants/navigation";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { cn } from "@/lib/cn";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-white shadow-sm">
              CP
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-text">Chuẩn Phát</span>
              <span className="block truncate text-xs text-slate-500">Quản trị vận hành</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Dong menu"
            onClick={onClose}
            className="erp-action-icon lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-normal text-slate-400">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <PermissionGuard key={item.href} permissions={item.permissions}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                            isActive
                              ? "bg-orange-50 text-primary shadow-[inset_3px_0_0_#f97316]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-text"
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </PermissionGuard>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-sm font-semibold text-text">Chi nhánh hiện tại</p>
            <p className="mt-1 text-sm font-semibold text-primary">{user?.branchName ?? "Chưa xác định"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
