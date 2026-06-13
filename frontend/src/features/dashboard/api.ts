import { api } from "@/lib/api/axios";
import type { DashboardFilters, DashboardResponse } from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

const branchRevenueBase = [
  { branchName: "Gò Vấp", revenue: 420_000_000 },
  { branchName: "Thủ Đức", revenue: 310_000_000 },
  { branchName: "Quận 7", revenue: 265_000_000 },
  { branchName: "Tân Bình", revenue: 185_000_000 }
];

const revenueByMonth = [
  { month: "T1", revenue: 820_000_000 },
  { month: "T2", revenue: 760_000_000 },
  { month: "T3", revenue: 940_000_000 },
  { month: "T4", revenue: 1_020_000_000 },
  { month: "T5", revenue: 1_160_000_000 },
  { month: "T6", revenue: 1_240_000_000 },
  { month: "T7", revenue: 1_180_000_000 },
  { month: "T8", revenue: 1_320_000_000 },
  { month: "T9", revenue: 1_410_000_000 },
  { month: "T10", revenue: 1_360_000_000 },
  { month: "T11", revenue: 1_480_000_000 },
  { month: "T12", revenue: 1_620_000_000 }
];

export const dashboardApi = {
  async getDashboard(filters: DashboardFilters): Promise<DashboardResponse> {
    if (!enableMock) {
      const response = await api.get<DashboardResponse>("/api/dashboard", {
        params: {
          branchId: filters.branchId === "all" ? undefined : filters.branchId,
          employeeId: filters.employeeId === "all" ? undefined : filters.employeeId,
          productCategory: filters.productCategory === "all" ? undefined : filters.productCategory,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
          month: filters.month === "all" ? undefined : filters.month,
          timeRange: filters.timeRange
        }
      });
      return response.data;
    }
    await new Promise((resolve) => setTimeout(resolve, 650));

    const branchMultiplier = filters.branchId === "all" ? 1 : 0.42;
    const rangeMultiplier =
      filters.timeRange === "TODAY"
        ? 0.08
        : filters.timeRange === "THIS_MONTH"
          ? 0.42
          : filters.timeRange === "LAST_30_DAYS"
            ? 0.5
            : 1;

    const multiplier = branchMultiplier * rangeMultiplier;
    const hasEmptyData = filters.branchId === "empty";

    return {
      kpis: [
        {
          key: "todayRevenue",
          label: "Doanh thu hôm nay",
          value: formatCompactMoney(128_500_000 * branchMultiplier),
          helper: "Đã ghi nhận từ đơn hàng đã thanh toán",
          trend: "+12,4%",
          tone: "orange"
        },
        {
          key: "monthRevenue",
          label: "Doanh thu tháng",
          value: formatCompactMoney(2_840_000_000 * branchMultiplier),
          helper: "So với cùng kỳ tháng trước",
          trend: "+8,7%",
          tone: "green"
        },
        {
          key: "orders",
          label: "Đơn hàng mới",
          value: String(Math.round(386 * multiplier + 24)),
          helper: "Đơn hàng mới và đã xác nhận",
          trend: "+31",
          tone: "blue"
        },
        {
          key: "overdueDebt",
          label: "Công nợ quá hạn",
          value: formatCompactMoney(186_000_000 * branchMultiplier),
          helper: "Khoản phải thu đã quá hạn",
          trend: "Cần xử lý",
          tone: "red"
        },
        {
          key: "lowStock",
          label: "Tồn kho thấp",
          value: String(Math.round(19 * branchMultiplier + 4)),
          helper: "Dưới ngưỡng tồn tối thiểu",
          trend: "Cần nhập",
          tone: "red"
        },
        {
          key: "warrantyProcessing",
          label: "Phiếu bảo hành đang xử lý",
          value: String(Math.round(23 * branchMultiplier + 3)),
          helper: "Phiếu chưa hoàn tất/trả xe",
          trend: "Đang mở",
          tone: "orange"
        },
        {
          key: "careLeads",
          label: "Lead cần chăm sóc",
          value: String(Math.round(41 * multiplier + 5)),
          helper: "Lead đến hạn chăm sóc",
          trend: "+7",
          tone: "blue"
        },
        {
          key: "systemAlerts",
          label: "Cảnh báo hệ thống",
          value: String(Math.round(6 * branchMultiplier + 1)),
          helper: "Tồn âm, công nợ, dữ liệu bất thường",
          trend: "Kiểm tra",
          tone: "slate"
        }
      ],
      revenueByMonth: hasEmptyData
        ? []
        : revenueByMonth.map((item) => ({
            ...item,
            revenue: Math.round(item.revenue * branchMultiplier)
          })),
      revenueByBranch: hasEmptyData ? [] : branchRevenueBase,
      profitByMonth: hasEmptyData
        ? []
        : revenueByMonth.map((item) => ({
            month: item.month,
            profit: Math.round(item.revenue * 0.28 * branchMultiplier)
          })),
      topProducts: hasEmptyData
        ? []
        : [
            { productId: 1, productName: "Xe máy điện CP S1", sku: "CP-S1", quantitySold: 58, revenue: 812_000_000 },
            { productId: 2, productName: "Bình ắc quy LFP", sku: "PIN-LFP", quantitySold: 44, revenue: 286_000_000 },
            { productId: 3, productName: "Xe máy điện CP City", sku: "CP-CITY", quantitySold: 39, revenue: 604_000_000 },
            { productId: 4, productName: "Bộ sạc nhanh", sku: "SAC-NHANH", quantitySold: 35, revenue: 98_000_000 },
            { productId: 5, productName: "Lốp xe điện", sku: "LOP-XD", quantitySold: 31, revenue: 52_000_000 }
          ],
      topEmployees: hasEmptyData
        ? []
        : [
            { employeeId: 102, employeeName: "Nguyễn Hoài An", orders: 74, revenue: 238_000_000 },
            { employeeId: 103, employeeName: "Lê Bảo Minh", orders: 61, revenue: 206_000_000 },
            { employeeId: 104, employeeName: "Trần Gia Phúc", orders: 49, revenue: 174_000_000 }
          ],
      customerSources: hasEmptyData
        ? []
        : [
            { source: "Facebook", customers: 31 },
            { source: "Zalo", customers: 18 },
            { source: "Giới thiệu", customers: 14 },
            { source: "Tại cửa hàng", customers: 9 }
          ],
      warrantyStatus: hasEmptyData
        ? []
        : [
            { status: "IN_PROGRESS", tickets: 14, cost: 9_200_000 },
            { status: "WAITING_PARTS", tickets: 9, cost: 7_600_000 },
            { status: "ASSIGNED", tickets: 18, cost: 6_800_000 }
          ],
      warrantyTickets: hasEmptyData
        ? []
        : [
            {
              id: 101,
              ticketNo: "SC-2026-0101",
              customerName: "Nguyễn Văn A",
              serialNumber: "CP-S1-00921",
              technicianName: "Lê Minh",
              status: "IN_PROGRESS",
              createdAt: "2026-06-06"
            },
            {
              id: 102,
              ticketNo: "SC-2026-0102",
              customerName: "Trần Thị B",
              serialNumber: "CP-CITY-00418",
              technicianName: "Hoàng Phúc",
              status: "WAITING_PARTS",
              createdAt: "2026-06-05"
            },
            {
              id: 103,
              ticketNo: "SC-2026-0103",
              customerName: "Phạm Quốc C",
              serialNumber: "CP-S1-01007",
              technicianName: "Đăng Khoa",
              status: "ASSIGNED",
              createdAt: "2026-06-05"
            }
          ]
    };
  }
};

function formatCompactMoney(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  return `${(value / 1_000_000).toFixed(1)}M`;
}
