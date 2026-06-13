export type ReportType =
  | "SALES_REPORT"
  | "INVENTORY_VALUATION"
  | "STOCK_MOVEMENT"
  | "CUSTOMER_DEBT_AGING"
  | "SUPPLIER_DEBT_AGING"
  | "PROFIT_LOSS"
  | "CASH_FLOW"
  | "PRODUCT_PERFORMANCE"
  | "BRANCH_PERFORMANCE"
  | "EMPLOYEE_PERFORMANCE"
  | "WARRANTY_COST"
  | "MARKETING_SOURCE"
  | "INVENTORY_SERIAL"
  | "LOW_STOCK"
  | "SLOW_MOVING_STOCK"
  | "DEFECTIVE_STOCK"
  | "STOCKTAKE_VARIANCE"
  | "WARRANTY_ANALYSIS"
  | "EXECUTIVE_OPERATION";

export type ReportFilters = {
  fromDate: string;
  toDate: string;
  branchId: string;
  employeeId: string;
  productId: string;
  customerId: string;
  status: string;
  productCategory: string;
  page: number;
  pageSize: number;
};

export type ReportOption = {
  value: string;
  label: string;
};

export type ReportSummaryCard = {
  key: string;
  label: string;
  value: string;
  helper: string;
  tone: "orange" | "green" | "blue" | "red" | "slate";
};

export type ReportChartPoint = {
  label: string;
  primaryValue: number;
  secondaryValue?: number;
};

export type ReportTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: "currency" | "number" | "percent" | "date";
};

export type ReportTableRow = Record<string, string | number>;

export type ReportResponse = {
  title: string;
  description: string;
  chartLabel: string;
  secondaryChartLabel?: string;
  summary: ReportSummaryCard[];
  chart: ReportChartPoint[];
  tableColumns: ReportTableColumn[];
  tableRows: ReportTableRow[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  performance?: {
    largeResult: boolean;
    asyncExportRecommended: boolean;
    message: string;
    totalPages: number;
  };
  updatedAt: string;
};

export type ExportFormat = "excel" | "pdf";
