export type DashboardFilters = {
  branchId: string;
  employeeId: string;
  productCategory: string;
  fromDate: string;
  toDate: string;
  month: string;
  timeRange: "TODAY" | "THIS_MONTH" | "LAST_30_DAYS" | "THIS_YEAR";
};

export type DashboardKpi = {
  key: string;
  label: string;
  value: string;
  helper: string;
  trend: string;
  tone: "orange" | "green" | "blue" | "red" | "slate";
};

export type RevenueMonthPoint = {
  month: string;
  revenue: number;
};

export type ProfitMonthPoint = {
  month: string;
  profit: number;
};

export type BranchRevenuePoint = {
  branchName: string;
  revenue: number;
};

export type TopProduct = {
  productId: number;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
};

export type TopEmployee = {
  employeeId: number;
  employeeName: string;
  orders: number;
  revenue: number;
};

export type CustomerSourcePoint = {
  source: string;
  customers: number;
};

export type WarrantyStatusPoint = {
  status: string;
  tickets: number;
  cost: number;
};

export type WarrantyTicket = {
  id: number;
  ticketNo: string;
  customerName: string;
  serialNumber: string;
  technicianName: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "WAITING_PARTS";
  createdAt: string;
};

export type DashboardResponse = {
  kpis: DashboardKpi[];
  revenueByMonth: RevenueMonthPoint[];
  revenueByBranch: BranchRevenuePoint[];
  profitByMonth: ProfitMonthPoint[];
  topProducts: TopProduct[];
  topEmployees: TopEmployee[];
  customerSources: CustomerSourcePoint[];
  warrantyStatus: WarrantyStatusPoint[];
  warrantyTickets: WarrantyTicket[];
};
