import {
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  ClipboardList,
  Coins,
  CreditCard,
  FileBarChart,
  FileText,
  Landmark,
  LayoutDashboard,
  Package,
  PackageCheck,
  Receipt,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  WalletCards,
  Heart,
  Users,
  Activity,
  Barcode,
  Bell,
  Megaphone,
  GitBranch
} from "lucide-react";
import type { ErpModule, NavItem } from "@/types/navigation";

export type NavGroup = {
  label: string;
  items: NavItem[];
};

const emptyText = ["Chưa cấu hình"];

export const erpModules: ErpModule[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    permissions: ["DASHBOARD_VIEW"],
    description: "Bảng điều hành tổng hợp theo chi nhánh, doanh thu, công nợ, tồn kho và cảnh báo vận hành.",
    process: ["Doanh thu", "Công nợ", "Tồn kho", "Cảnh báo"],
    documents: ["Đơn mới", "Phiếu đang xử lý", "Chứng từ chờ duyệt"],
    reports: ["KPI ngày", "KPI tháng", "Cảnh báo hệ thống"],
    settings: ["Chỉ tiêu dashboard", "Phạm vi chi nhánh", "Mẫu cảnh báo"]
  },
  {
    key: "cash",
    label: "Tiền mặt",
    href: "/cash",
    icon: Banknote,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Quản lý thu chi tiền mặt, kiểm kê quỹ và sổ quỹ theo từng chi nhánh.",
    process: ["Thu tiền", "Kiểm kê quỹ", "Chi tiền"],
    documents: ["Phiếu thu", "Phiếu chi", "Tạm ứng", "Hoàn ứng"],
    reports: ["Sổ quỹ", "Dòng tiền", "Nhật ký thu tiền", "Nhật ký chi tiền"],
    settings: ["Mục thu", "Mục chi", "Quỹ tiền mặt"],
    shortcuts: ["Tạo phiếu thu", "Tạo phiếu chi", "Kiểm kê quỹ"]
  },
  {
    key: "bank-deposit",
    label: "Tiền gửi",
    href: "/bank-deposit",
    icon: Landmark,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Quản lý giao dịch ngân hàng, chuyển khoản và đối chiếu sao kê.",
    process: ["Thu tiền ngân hàng", "Đối chiếu ngân hàng", "Chi tiền ngân hàng"],
    documents: ["Thu tiền gửi", "Chi tiền gửi", "Chuyển khoản"],
    reports: ["Sổ ngân hàng", "Đối chiếu ngân hàng", "Dòng tiền"],
    settings: ["Tài khoản ngân hàng"],
    shortcuts: ["Nhập sao kê", "Tạo chuyển khoản", "Đối chiếu nhanh"]
  },
  {
    key: "accounting",
    label: "Tổng hợp",
    href: "/accounting",
    icon: ClipboardList,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Trục kế toán tổng hợp từ nghiệp vụ phát sinh đến sổ cái, cân đối và báo cáo tài chính.",
    process: ["Business Modules", "Journal Entry", "General Ledger", "Bảng cân đối số phát sinh", "Financial Statements"],
    documents: ["Journal Entry", "Recurring Journal", "Closing Entry"],
    reports: ["Sổ nhật ký chung", "Sổ cái", "Sổ chi tiết", "Cân đối tài khoản"],
    settings: ["Kỳ kế toán", "Quy tắc hạch toán", "Tài khoản kết chuyển"]
  },
  {
    key: "purchasing",
    label: "Mua hàng",
    href: "/purchasing",
    icon: Truck,
    permissions: ["SUPPLIER_VIEW"],
    description: "Chu trình mua hàng từ đề nghị mua đến nhập kho, hóa đơn mua và thanh toán nhà cung cấp.",
    process: ["Đề nghị mua", "Đơn mua hàng", "Nhập kho", "Hóa đơn mua", "Thanh toán NCC"],
    documents: ["Purchase Request", "Purchase Order", "Goods Receipt", "Purchase Invoice", "Payment"],
    reports: ["Công nợ NCC", "Mua hàng", "Hàng nhập"],
    settings: ["Điều khoản mua", "Nhóm nhà cung cấp", "Luồng duyệt mua hàng"]
  },
  {
    key: "sales",
    label: "Bán hàng",
    href: "/sales",
    icon: ShoppingCart,
    permissions: ["SALES_VIEW"],
    description: "Quy trình bán hàng thống nhất từ báo giá đến đơn bán, xuất kho, hóa đơn và thu tiền.",
    process: ["Báo giá", "Đơn bán", "Xuất kho", "Hóa đơn", "Thu tiền"],
    documents: ["Quotation", "Sales Order", "Delivery Order", "Invoice", "Receipt"],
    reports: ["Doanh thu", "Công nợ KH", "Top sản phẩm"],
    settings: ["Chính sách giá", "Chiết khấu", "Điều khoản bán hàng"]
  },
  {
    key: "invoices",
    label: "Hóa đơn",
    href: "/invoices",
    icon: Receipt,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Quản lý hóa đơn điện tử, phát hành, tra cứu và xử lý hóa đơn sai sót.",
    process: ["Phát hành hóa đơn", "Tra cứu", "Xử lý sai sót", "Báo cáo tình hình sử dụng"],
    documents: ["Hóa đơn điện tử", "Hóa đơn nháp", "Biên bản điều chỉnh"],
    reports: ["Bảng kê hóa đơn", "Tình hình sử dụng hóa đơn"],
    settings: ["Mẫu hóa đơn", "Dải số hóa đơn", "Ký hiệu hóa đơn"]
  },
  {
    key: "inventory",
    label: "Kho",
    href: "/inventory",
    icon: Boxes,
    permissions: ["INVENTORY_VIEW"],
    description: "Kiểm soát nhập xuất tồn, điều chuyển, kiểm kê và giá vốn.",
    process: ["Nhập kho", "Điều chuyển", "Xuất kho", "Kiểm kê"],
    documents: ["Phiếu nhập", "Phiếu xuất", "Điều chuyển", "Kiểm kê"],
    reports: ["Nhập xuất tồn", "Tồn kho", "Giá vốn"],
    settings: ["Kho", "Phương pháp tính giá", "Quy tắc kiểm kê"]
  },
  {
    key: "tools",
    label: "Công cụ dụng cụ",
    href: "/tools",
    icon: PackageCheck,
    permissions: ["INVENTORY_VIEW"],
    description: "Theo dõi cấp phát, phân bổ và thu hồi công cụ dụng cụ.",
    process: ["Ghi tăng CCDC", "Cấp phát", "Phân bổ", "Thu hồi"],
    documents: ["Công cụ dụng cụ", "Phiếu cấp phát", "Bảng phân bổ"],
    reports: ["Danh sách CCDC", "Phân bổ CCDC", "CCDC theo bộ phận"],
    settings: ["Loại CCDC", "Chu kỳ phân bổ", "Bộ phận sử dụng"]
  },
  {
    key: "assets",
    label: "Tài sản cố định",
    href: "/assets",
    icon: Building2,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Quản lý vòng đời tài sản cố định từ ghi tăng, khấu hao đến thanh lý.",
    process: ["Ghi tăng tài sản", "Khấu hao", "Thanh lý"],
    documents: ["Fixed Asset", "Depreciation", "Disposal"],
    reports: ["Danh sách tài sản", "Khấu hao", "Giá trị còn lại"],
    settings: ["Loại tài sản", "Phương pháp khấu hao", "Nguồn hình thành"]
  },
  {
    key: "expenses",
    label: "Chi phí",
    href: "/expenses",
    icon: CreditCard,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Quản lý đề nghị chi, duyệt chi, thanh toán và hạch toán chi phí.",
    process: ["Đề nghị chi", "Duyệt", "Thanh toán", "Hạch toán"],
    documents: ["Expense Request", "Expense Voucher"],
    reports: ["Chi phí theo phòng ban", "Chi phí theo chi nhánh"],
    settings: ["Khoản mục chi phí", "Hạn mức duyệt", "Trung tâm chi phí"]
  },
  {
    key: "tax",
    label: "Thuế",
    href: "/tax",
    icon: Scale,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Quản lý VAT đầu vào, VAT đầu ra và tờ khai thuế.",
    process: ["Hóa đơn đầu vào", "VAT đầu vào", "Hóa đơn đầu ra", "VAT đầu ra", "Tờ khai thuế"],
    documents: ["Hóa đơn đầu vào", "Hóa đơn đầu ra", "Tờ khai thuế"],
    reports: ["VAT đầu vào", "VAT đầu ra", "Thuế GTGT"],
    settings: ["Thuế suất", "Kỳ kê khai", "Tài khoản thuế"]
  },
  {
    key: "costing",
    label: "Giá thành",
    href: "/costing",
    icon: Calculator,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Tập hợp chi phí, phân bổ và tính giá thành sản phẩm/dịch vụ.",
    process: ["Tập hợp chi phí", "Phân bổ", "Tính giá thành", "Kết chuyển"],
    documents: ["Bảng phân bổ", "Phiếu tính giá thành", "Bút toán kết chuyển"],
    reports: ["Giá thành sản phẩm", "Biến động giá vốn", "Chi phí cấu thành"],
    settings: ["Đối tượng tập hợp", "Tiêu thức phân bổ", "Kỳ tính giá thành"]
  },
  {
    key: "reports",
    label: "Báo cáo",
    href: "/reports",
    icon: FileBarChart,
    permissions: ["REPORT_VIEW"],
    description: "Trung tâm báo cáo tài chính, kế toán, công nợ, kho và quản trị.",
    process: ["Chọn kỳ báo cáo", "Lọc chi nhánh", "Xem báo cáo", "Xuất dữ liệu"],
    documents: ["Mẫu báo cáo", "Lịch xuất báo cáo", "Báo cáo đã lưu"],
    reports: ["Balance Sheet", "Profit & Loss", "Cash Flow", "Notes"],
    settings: ["Mẫu báo cáo", "Phân quyền xem báo cáo", "Lịch gửi báo cáo"],
    reportGroups: [
      { title: "Báo cáo tài chính", items: ["Balance Sheet", "Profit & Loss", "Cash Flow", "Notes"] },
      { title: "Báo cáo kế toán", items: ["Sổ cái", "Nhật ký", "Cân đối phát sinh"] },
      { title: "Báo cáo công nợ", items: ["Phải thu", "Phải trả"] },
      { title: "Báo cáo kho", items: ["Nhập xuất tồn", "Tồn kho"] },
      { title: "Báo cáo quản trị", items: ["Lợi nhuận", "Doanh thu", "KPI"] }
    ]
  },
  {
    key: "financial-analysis",
    label: "Phân tích tài chính",
    href: "/financial-analysis",
    icon: BarChart3,
    permissions: ["REPORT_VIEW"],
    description: "Phân tích dòng tiền, lợi nhuận, hiệu quả tồn kho và hiệu suất chi nhánh.",
    process: ["Thu thập dữ liệu", "Phân tích chỉ số", "So sánh kỳ", "Khuyến nghị"],
    documents: ["Bảng phân tích", "Kịch bản tài chính", "Dashboard KPI"],
    reports: ["Biên lợi nhuận", "Dòng tiền", "Vòng quay tồn kho", "Hiệu quả chi nhánh"],
    settings: ["Chỉ số phân tích", "Ngưỡng cảnh báo", "Kỳ so sánh"]
  },
  {
    key: "catalog",
    label: "Danh mục",
    href: "/catalog",
    icon: Tags,
    permissions: ["DASHBOARD_VIEW"],
    description: "Danh mục dùng chung cho toàn hệ thống, tránh trùng lặp dữ liệu nền.",
    process: ["Tạo danh mục", "Chuẩn hóa mã", "Kiểm tra trùng", "Đồng bộ module"],
    documents: ["Khách hàng", "Nhà cung cấp", "Sản phẩm", "Chart Of Accounts"],
    reports: ["Danh mục thiếu thông tin", "Danh mục trùng lặp", "Lịch sử thay đổi"],
    settings: ["Quy tắc mã", "Trường bắt buộc", "Phân quyền danh mục"],
    catalogGroups: [
      { title: "Đối tượng", items: ["Khách hàng", "Nhà cung cấp", "Nhân viên"] },
      { title: "Hàng hóa", items: ["Sản phẩm", "Danh mục", "Đơn vị tính", "Kho"] },
      { title: "Tài khoản", items: ["Chart Of Accounts", "Account Mapping"] },
      { title: "Tài chính", items: ["Ngân hàng", "Thuế", "Tiền tệ"] },
      { title: "Tổ chức", items: ["Chi nhánh", "Phòng ban"] }
    ]
  },
  {
    key: "opening-balances",
    label: "Số dư đầu kỳ",
    href: "/opening-balances",
    icon: WalletCards,
    permissions: ["ACCOUNTING_VIEW"],
    description: "Nhập và kiểm tra số dư đầu kỳ cho tiền, công nợ, kho và tài khoản kế toán.",
    process: ["Nhập số dư", "Đối chiếu", "Khóa số dư", "Mở kỳ"],
    documents: ["Số dư tài khoản", "Số dư công nợ", "Tồn kho đầu kỳ"],
    reports: ["Bảng cân đối đầu kỳ", "Sai lệch số dư", "Lịch sử điều chỉnh"],
    settings: ["Kỳ bắt đầu", "Quy tắc nhập liệu", "Quyền điều chỉnh"]
  },
  {
    key: "crm",
    label: "Khách hàng (CRM)",
    href: "/crm",
    icon: Heart,
    permissions: ["DASHBOARD_VIEW"],
    description: "Quản lý quan hệ khách hàng, cơ hội bán hàng, chiến dịch chăm sóc và hỗ trợ khách hàng.",
    process: ["Chăm sóc KH", "Cơ hội bán hàng", "Chiến dịch"],
    documents: ["Hồ sơ KH", "Yêu cầu hỗ trợ"],
    reports: ["Báo cáo CRM", "Phân tích khách hàng"],
    settings: ["Nhóm khách hàng", "Mẫu phản hồi"]
  },
  {
    key: "hr",
    label: "Nhân sự (HR)",
    href: "/hr",
    icon: Users,
    permissions: ["DASHBOARD_VIEW"],
    description: "Quản lý hồ sơ nhân viên, chấm công, tính lương và hợp đồng lao động.",
    process: ["Hồ sơ", "Chấm công", "Tính lương"],
    documents: ["Hợp đồng lao động", "Bảng lương"],
    reports: ["Báo cáo nhân sự", "Biến động nhân sự"],
    settings: ["Phòng ban", "Ca làm việc"]
  },
  {
    key: "operations",
    label: "Vận hành",
    href: "/operations",
    icon: Activity,
    permissions: ["DASHBOARD_VIEW"],
    description: "Quản lý quy trình vận hành dịch vụ, theo dõi công việc và lịch trình giao hàng.",
    process: ["Giao việc", "Giám sát vận hành", "Xử lý sự cố"],
    documents: ["Phiếu vận hành", "Lịch trình giao hàng"],
    reports: ["Hiệu suất vận hành", "Thời gian xử lý"],
    settings: ["Quy trình vận hành", "Nhóm kỹ thuật"]
  },
  {
    key: "serials",
    label: "Số serial",
    href: "/serials",
    icon: Barcode,
    permissions: ["INVENTORY_VIEW"],
    description: "Quản lý và truy vết lịch sử số serial sản phẩm, kiểm soát bảo hành.",
    process: ["Khai báo serial", "Truy vết lịch sử", "Kiểm tra bảo hành"],
    documents: ["Phiếu serial", "Lịch sử bảo hành"],
    reports: ["Báo cáo serial", "Tỷ lệ lỗi"],
    settings: ["Quy tắc tạo serial"]
  },
  {
    key: "reminders",
    label: "Nhắc nhở",
    href: "/reminders",
    icon: Bell,
    permissions: ["DASHBOARD_VIEW"],
    description: "Quản lý thông báo, lịch nhắc gia hạn hợp đồng, bảo hành và thanh toán.",
    process: ["Tạo lịch nhắc", "Gửi cảnh báo", "Theo dõi"],
    documents: ["Lịch nhắc nhở", "Nhật ký cảnh báo"],
    reports: ["Báo cáo nhắc nhở", "Tỷ lệ xử lý trễ"],
    settings: ["Kênh nhận thông báo"]
  },
  {
    key: "marketing",
    label: "Marketing",
    href: "/marketing",
    icon: Megaphone,
    permissions: ["DASHBOARD_VIEW"],
    description: "Quản lý chiến dịch quảng bá, khuyến mãi, gửi mail chăm sóc và phân tích hiệu quả.",
    process: ["Chiến dịch", "Khuyến mãi", "Gửi tin nhắn"],
    documents: ["Kế hoạch marketing", "Mã giảm giá"],
    reports: ["Hiệu quả chiến dịch", "Tương tác khách hàng"],
    settings: ["Mẫu email/sms"]
  },
  {
    key: "settings",
    label: "Thiết lập",
    href: "/settings",
    icon: Settings,
    permissions: ["SETTING_VIEW"],
    description: "Thiết lập hệ thống, phân quyền, chi nhánh, đánh số chứng từ và tích hợp.",
    process: ["Cấu hình hệ thống", "Phân quyền", "Đánh số chứng từ", "Tích hợp"],
    documents: ["Người dùng", "Vai trò", "Chi nhánh", "Nhật ký hệ thống"],
    reports: ["Nhật ký truy cập", "Thay đổi cấu hình", "Quyền theo vai trò"],
    settings: ["Thông tin công ty", "Phân quyền", "Mẫu chứng từ", "Tích hợp API"]
  },
  {
    key: "branches",
    label: "Chi nhánh",
    href: "/branches",
    icon: GitBranch,
    permissions: ["SETTING_VIEW"],
    description: "Quản lý thông tin chi nhánh, cấu hình địa bàn hoạt động và phân quyền quản lý.",
    process: ["Tạo chi nhánh", "Thiết lập thông tin", "Phân quyền"],
    documents: ["Hồ sơ chi nhánh"],
    reports: ["Báo cáo hoạt động chi nhánh"],
    settings: ["Cấu hình kho chi nhánh"]
  }
].map((module) => ({
  shortcuts: ["Tạo chứng từ", "Xuất báo cáo", "Mở danh sách"],
  favorites: module.reports.slice(0, 3),
  recentDocuments: module.documents.length ? module.documents.slice(0, 3) : emptyText,
  ...module
}));

export const navigationGroups: NavGroup[] = [
  {
    label: "ERP Navigation",
    items: erpModules
  }
];

export const navigationItems: NavItem[] = erpModules;

export type ErpGroupKey = "operations" | "reports" | "catalog" | "settings";

export type ErpGroup = {
  key: ErpGroupKey;
  label: string;
  moduleKeys: string[];
};

export const erpGroups: ErpGroup[] = [
  {
    key: "operations",
    label: "1. Nghiệp vụ",
    moduleKeys: [
      "dashboard",
      "cash",
      "bank-deposit",
      "purchasing",
      "sales",
      "invoices",
      "inventory",
      "tools",
      "assets",
      "expenses",
      "tax",
      "costing",
      "accounting",
      "opening-balances",
      "crm",
      "hr",
      "operations",
      "serials",
      "reminders",
      "marketing"
    ]
  },
  {
    key: "reports",
    label: "2. Báo cáo",
    moduleKeys: ["reports", "financial-analysis"]
  },
  {
    key: "catalog",
    label: "3. Danh mục",
    moduleKeys: ["catalog"]
  },
  {
    key: "settings",
    label: "4. Thiết lập",
    moduleKeys: ["settings", "branches"]
  }
];

export function getErpModuleByHref(href: string) {
  return erpModules.find((module) => module.href === href);
}

export function getErpModuleByKey(key: string) {
  return erpModules.find((module) => module.key === key);
}

export const dashboardKpis = [
  { label: "Doanh thu hôm nay", value: "128,5 triệu", trend: "+12,4%", icon: BarChart3 },
  { label: "Đơn hàng mới", value: "42", trend: "+8", icon: ShoppingCart },
  { label: "Tồn kho thấp", value: "16", trend: "Cần xử lý", icon: Boxes },
  { label: "Phiếu bảo hành", value: "9", trend: "Đang mở", icon: ShieldCheck }
];
