"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ChevronDown, ChevronRight, Building2 } from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { erpGroups, getErpModuleByKey } from "@/constants/navigation";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/cn";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const closeSidebar = useUiStore((state) => state.closeSidebar);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    operations: true,
    reports: true,
    catalog: true,
    settings: true,
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
    closeSidebar();
  };

  useEffect(() => {
    const activeGroup = erpGroups.find((group) =>
      group.moduleKeys.some((key) => {
        const module = getErpModuleByKey(key);
        return module && isActive(module.href);
      })
    );
    if (activeGroup) {
      setExpandedGroups((prev) => ({ ...prev, [activeGroup.key]: true }));
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 lg:hidden",
          open
            ? "bg-slate-950/60 backdrop-blur-sm opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0",
          "w-[272px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "var(--sidebar-bg)" }}
      >
        {/* Logo Header */}
        <div className="flex h-[60px] items-center justify-between px-4 border-b"
          style={{ borderColor: "var(--sidebar-border)" }}>
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 group"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>
              <img
                src="/images/logo.png"
                alt="Chuẩn Phát Logo"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold text-white">
                Chuẩn Phát
              </span>
              <span className="block truncate text-[11px] font-medium"
                style={{ color: "var(--sidebar-text)" }}>
                ERP Management
              </span>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors lg:hidden"
            style={{ color: "var(--sidebar-text)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--sidebar-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto py-4 sidebar-scroll"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          <div className="space-y-1 px-3">
            {erpGroups.map((group) => {
              const isExpanded = expandedGroups[group.key];

              return (
                <div key={group.key} className="mb-2">
                  {/* Group toggle */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="flex w-full items-center justify-between px-2 py-2 rounded-md text-left transition-colors duration-150"
                    style={{ color: "var(--sidebar-text)" }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--sidebar-group)", letterSpacing: "0.1em" }}>
                      {group.label}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Group items */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out space-y-0.5",
                      isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    )}
                  >
                    {group.moduleKeys.map((key) => {
                      const item = getErpModuleByKey(key);
                      if (!item) return null;

                      const isLinkActive = isActive(item.href);
                      const Icon = item.icon;

                      return (
                        <PermissionGuard key={item.href} permissions={item.permissions as any}>
                          <Link
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className={cn(
                              "group relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-all duration-150",
                              isLinkActive
                                ? "text-white"
                                : "hover:text-white"
                            )}
                            style={
                              isLinkActive
                                ? {
                                  background: "var(--sidebar-active-bg)",
                                  color: "var(--sidebar-text-active)",
                                }
                                : {
                                  color: "var(--sidebar-text)",
                                }
                            }
                            onMouseEnter={e => {
                              if (!isLinkActive) {
                                (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
                                (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text-active)";
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isLinkActive) {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)";
                              }
                            }}
                          >
                            {/* Active indicator */}
                            {isLinkActive && (
                              <span
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                                style={{ background: "var(--color-primary)" }}
                              />
                            )}
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0 transition-colors duration-150",
                                isLinkActive ? "text-primary-300" : "opacity-70"
                              )}
                              style={isLinkActive ? { color: "#fdba74" } : {}}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </PermissionGuard>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Branch info footer */}
        <div className="p-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(249,115,22,0.15)" }}>
              <Building2 className="h-4 w-4" style={{ color: "#fdba74" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--sidebar-text)" }}>Chi nhánh</p>
              <p
                className="mt-0.5 text-[13px] font-semibold truncate text-white"
                title={user?.branchName ?? "Chưa xác định"}
              >
                {user?.branchName ?? "Chưa xác định"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
