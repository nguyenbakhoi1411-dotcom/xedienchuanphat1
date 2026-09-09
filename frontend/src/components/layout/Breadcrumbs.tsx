"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { navigationItems } from "@/constants/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = (pathname || "").split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const navItem = navigationItems.find(n => n.href === href);
    return { href, label: navItem?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1) };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-orange-50 hover:text-primary"
        title="Trang chủ"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-text text-[13px]">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-slate-400 text-[13px] hover:text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
