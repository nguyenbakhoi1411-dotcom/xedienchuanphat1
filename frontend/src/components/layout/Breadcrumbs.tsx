"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { navigationItems } from "@/constants/navigation";

const segmentLabels: Record<string, string> = {
  dashboard: "Tổng quan",
  branches: "Chi nhánh",
  products: "Sản phẩm",
  inventory: "Kho hàng",
  sales: "Bán hàng",
  customers: "Khách hàng",
  crm: "CRM",
  reminders: "Nhắc lịch",
  warranty: "Bảo hành",
  suppliers: "Nhà cung cấp",
  accounting: "Kế toán",
  reports: "Báo cáo",
  hr: "Nhân sự",
  marketing: "Marketing",
  settings: "Cài đặt",
  operations: "Vận hành"
};

function humanize(segment: string) {
  const item = navigationItems.find((navItem) => navItem.href === `/${segment}`);
  if (item) return item.label;
  if (segmentLabels[segment]) return segmentLabels[segment];

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
      <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-primary">
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Trang chủ</span>
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex min-w-0 items-center gap-2">
            <ChevronRight className="h-4 w-4 shrink-0" />
            {isLast ? (
              <span className="truncate font-medium text-text">{humanize(segment)}</span>
            ) : (
              <Link href={href} className="truncate hover:text-primary">
                {humanize(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
