import { api } from "@/lib/api/axios";
import type { DashboardFilters, DashboardResponse } from "./types";

export const dashboardApi = {
  async getDashboard(filters: DashboardFilters): Promise<DashboardResponse> {
    const response = await api.get<DashboardResponse>("/api/dashboard", {
      params: {
        branchId: filters.branchId === "all" ? undefined : filters.branchId,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        month: filters.month === "all" ? undefined : filters.month,
        timeRange: filters.timeRange
      }
    });
    return response.data;
  },
  async getSummary(branchId?: number) {
    return api.get("/api/dashboard/summary", { params: { branchId } }).then(r => r.data);
  },
  async getRevenueByMonth(year: number, branchId?: number) {
    return api.get("/api/dashboard/revenue-by-month", { params: { year, branchId } }).then(r => r.data);
  },
  async getTopProducts(limit = 5, branchId?: number) {
    return api.get("/api/dashboard/top-products", { params: { limit, branchId } }).then(r => r.data);
  }
};
