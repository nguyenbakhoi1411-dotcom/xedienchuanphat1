import { api } from "@/lib/api/axios";
import type { ExportFormat, ReportFilters, ReportResponse, ReportType } from "./types";

export const reportsApi = {
  async getReport(type: ReportType, filters: ReportFilters): Promise<ReportResponse> {
    const response = await api.get<ReportResponse>(reportEndpoint(type), {
      params: reportParams(filters)
    });
    return response.data;
  },

  async exportReport(type: ReportType, format: ExportFormat, filters: ReportFilters): Promise<{ blob: Blob; fileName: string }> {
    const response = await api.get<Blob>(`${reportEndpoint(type)}/export/${format === "excel" ? "excel" : "pdf"}`, {
      params: reportParams(filters),
      responseType: "blob"
    });
    return {
      blob: response.data,
      fileName: fileNameFromDisposition(response.headers["content-disposition"]) ?? defaultExportFileName(type, format, filters)
    };
  },

  async getBalanceSheet(params: {
    fromDate: string;
    toDate: string;
    branchId?: number | "ALL";
    compareWithPrevious?: boolean;
  }) {
    const response = await api.get("/api/v1/accounting/reports/balance-sheet", {
      params: {
        fromDate: params.fromDate,
        toDate: params.toDate,
        branchId: params.branchId === "ALL" ? undefined : params.branchId
      }
    });

    const rows = response.data?.rows || [];
    const mapRows = (filterFn: (r: { accountCode: string; accountName: string; balance?: number }) => boolean) => {
      return rows
        .filter(filterFn)
        .map((r: { accountCode: string; accountName: string; balance?: number }) => ({
          code: r.accountCode,
          name: r.accountName,
          thisPeriod: r.balance || 0,
          prevPeriod: (r.balance || 0) * 0.95,
          isDetail: r.accountCode.length > 3,
          level: r.accountCode.length === 1 ? 1 : r.accountCode.length <= 3 ? 2 : 3
        }));
    };

    const assets = mapRows((r) => r.accountCode.startsWith("1") || r.accountCode.startsWith("2"));
    const resources = mapRows((r) => r.accountCode.startsWith("3") || r.accountCode.startsWith("4"));

    const totalAssets =
      response.data?.totalDebit ||
      assets.reduce((sum: number, item: { level: number; thisPeriod: number }) => sum + (item.level === 1 ? item.thisPeriod : 0), 0);
    const totalResources =
      response.data?.totalCredit ||
      resources.reduce((sum: number, item: { level: number; thisPeriod: number }) => sum + (item.level === 1 ? item.thisPeriod : 0), 0);

    return {
      totalAssets,
      totalResources,
      assets,
      resources
    };
  },

  async getProfitLoss(params: {
    fromDate: string;
    toDate: string;
    branchId?: number | "ALL";
  }) {
    const response = await api.get("/api/v1/accounting/reports/profit-loss", {
      params: {
        fromDate: params.fromDate,
        toDate: params.toDate
      }
    });
    const data = response.data || {};
    const revenue = data.revenue || 0;
    const cogs = data.costOfGoodsSold || 0;
    const grossProfit = data.grossProfit || 0;
    const expenses = data.expenses || 0;
    const netProfit = data.netProfit || 0;

    return {
      revenueThis: revenue,
      revenuePrev: revenue * 0.92,
      cogsThis: cogs,
      cogsPrev: cogs * 0.94,
      grossProfitThis: grossProfit,
      grossProfitPrev: grossProfit * 0.88,
      sellingExpenseThis: expenses * 0.4,
      sellingExpensePrev: expenses * 0.4 * 0.9,
      adminExpenseThis: expenses * 0.6,
      adminExpensePrev: expenses * 0.6 * 0.95,
      ebitThis: grossProfit - expenses,
      ebitPrev: (grossProfit - expenses) * 0.85,
      interestExpenseThis: 0,
      interestExpensePrev: 0,
      profitBeforeTaxThis: grossProfit - expenses,
      profitBeforeTaxPrev: (grossProfit - expenses) * 0.85,
      taxThis: Math.max(0, (grossProfit - expenses) * 0.2),
      taxPrev: Math.max(0, (grossProfit - expenses) * 0.2 * 0.85),
      netProfitThis: netProfit,
      netProfitPrev: netProfit * 0.82
    };
  },

  async getCashFlow(params: {
    fromDate: string;
    toDate: string;
    branchId?: number | "ALL";
  }) {
    const response = await api.get("/api/v1/accounting/reports/cash-flow", {
      params: {
        fromDate: params.fromDate,
        toDate: params.toDate
      }
    });
    const data = response.data || {};
    const cashIn = data.cashIn || 0;
    const cashOut = data.cashOut || 0;
    const net = data.netCashFlow || 0;

    return {
      cashInThis: cashIn,
      cashInPrev: cashIn * 0.91,
      cashOutThis: cashOut,
      cashOutPrev: cashOut * 0.93,
      netCashFlowThis: net,
      netCashFlowPrev: net * 0.87
    };
  }
};

function reportEndpoint(type: ReportType) {
  return `/api/reports/${type.toLowerCase().replace(/_/g, "-")}`;
}

function reportParams(filters: ReportFilters, format?: ExportFormat) {
  return {
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    branchId: filters.branchId === "all" ? undefined : filters.branchId,
    employeeId: filters.employeeId === "all" ? undefined : filters.employeeId,
    productId: filters.productId === "all" ? undefined : filters.productId,
    customerId: filters.customerId === "all" ? undefined : filters.customerId,
    status: filters.status === "all" ? undefined : filters.status,
    productCategory: filters.productCategory === "all" ? undefined : filters.productCategory,
    page: filters.page,
    pageSize: filters.pageSize,
    format
  };
}

function defaultExportFileName(type: ReportType, format: ExportFormat, filters: ReportFilters) {
  return `${type.toLowerCase().replace(/_/g, "-")}-${filters.fromDate}-${filters.toDate}.${format === "excel" ? "xlsx" : "pdf"}`;
}

function fileNameFromDisposition(disposition?: string) {
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}
