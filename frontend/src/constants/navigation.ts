import {
  BarChart3,
  Boxes,
  Building2,
  CalendarClock,
  ClipboardList,
  FileBarChart,
  Handshake,
  LayoutDashboard,
  Megaphone,
  Package,
  Receipt,
  ServerCog,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigationGroups: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      {
        label: "Tổng quan",
        href: "/dashboard",
        icon: LayoutDashboard,
        permissions: ["DASHBOARD_VIEW"]
      }
    ]
  },
  {
    label: "Bán hàng",
    items: [
      {
        label: "Bán hàng",
        href: "/sales",
        icon: ShoppingCart,
        permissions: ["SALES_VIEW"]
      }
    ]
  },
  {
    label: "Khách hàng/CRM",
    items: [
      {
        label: "Khách hàng",
        href: "/customers",
        icon: Users,
        permissions: ["CUSTOMER_VIEW"]
      },
      {
        label: "CRM",
        href: "/crm",
        icon: Users,
        permissions: ["CUSTOMER_VIEW"]
      },
      {
        label: "Nhắc lịch",
        href: "/reminders",
        icon: CalendarClock,
        permissions: ["CUSTOMER_VIEW"]
      }
    ]
  },
  {
    label: "Kho hàng",
    items: [
      {
        label: "Kho hàng",
        href: "/inventory",
        icon: Boxes,
        permissions: ["INVENTORY_VIEW"]
      }
    ]
  },
  {
    label: "Sản phẩm",
    items: [
      {
        label: "Sản phẩm",
        href: "/products",
        icon: Package,
        permissions: ["PRODUCT_VIEW"]
      }
    ]
  },
  {
    label: "Bảo hành/Dịch vụ",
    items: [
      {
        label: "Bảo hành",
        href: "/warranty",
        icon: ShieldCheck,
        permissions: ["WARRANTY_VIEW"]
      }
    ]
  },
  {
    label: "Mua hàng/Nhà cung cấp",
    items: [
      {
        label: "Nhà cung cấp",
        href: "/suppliers",
        icon: Handshake,
        permissions: ["SUPPLIER_VIEW"]
      }
    ]
  },
  {
    label: "Kế toán",
    items: [
      {
        label: "Kế toán",
        href: "/accounting",
        icon: Receipt,
        permissions: ["ACCOUNTING_VIEW"]
      }
    ]
  },
  {
    label: "Báo cáo",
    items: [
      {
        label: "Báo cáo",
        href: "/reports",
        icon: FileBarChart,
        permissions: ["REPORT_VIEW"]
      }
    ]
  },
  {
    label: "Nhân sự",
    items: [
      {
        label: "Nhân sự & phân quyền",
        href: "/hr",
        icon: ClipboardList,
        permissions: ["HR_VIEW"]
      }
    ]
  },
  {
    label: "Marketing",
    items: [
      {
        label: "Marketing",
        href: "/marketing",
        icon: Megaphone,
        permissions: ["MARKETING_VIEW"]
      }
    ]
  },
  {
    label: "Hệ thống",
    items: [
      {
        label: "Chi nhánh",
        href: "/branches",
        icon: Building2,
        permissions: ["BRANCH_VIEW"]
      },
      {
        label: "Cài đặt",
        href: "/settings",
        icon: Settings,
        permissions: ["SETTING_MANAGE"]
      },
      {
        label: "Vận hành",
        href: "/operations",
        icon: ServerCog,
        permissions: ["SETTING_MANAGE"]
      }
    ]
  }
];

export const navigationItems: NavItem[] = navigationGroups.flatMap((group) => group.items);

export const dashboardKpis = [
  { label: "Doanh thu hôm nay", value: "128,5 triệu", trend: "+12,4%", icon: BarChart3 },
  { label: "Đơn hàng mới", value: "42", trend: "+8", icon: ShoppingCart },
  { label: "Tồn kho thấp", value: "16", trend: "Cần xử lý", icon: Boxes },
  { label: "Phiếu bảo hành", value: "9", trend: "Đang mở", icon: ShieldCheck }
];
