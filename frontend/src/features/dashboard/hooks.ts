"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./api";
import type { DashboardFilters } from "./types";

export function useDashboard(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => dashboardApi.getDashboard(filters)
  });
}
