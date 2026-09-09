"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { reportsApi } from "./api";
import type { ExportFormat, ReportFilters, ReportType } from "./types";

export function useReport(type: ReportType, filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", type, filters],
    queryFn: () => reportsApi.getReport(type, filters)
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      type,
      format,
      filters
    }: {
      type: ReportType;
      format: ExportFormat;
      filters: ReportFilters;
    }) => reportsApi.exportReport(type, format, filters)
  });
}

export function useFinancialBalanceSheet(params: {
  fromDate: string;
  toDate: string;
  branchId?: number | "ALL";
  compareWithPrevious?: boolean;
}) {
  return useQuery({
    queryKey: ["reports", "financial", "balance-sheet", params],
    queryFn: () => reportsApi.getBalanceSheet(params)
  });
}

export function useFinancialProfitLoss(params: {
  fromDate: string;
  toDate: string;
  branchId?: number | "ALL";
}) {
  return useQuery({
    queryKey: ["reports", "financial", "profit-loss", params],
    queryFn: () => reportsApi.getProfitLoss(params)
  });
}

export function useFinancialCashFlow(params: {
  fromDate: string;
  toDate: string;
  branchId?: number | "ALL";
}) {
  return useQuery({
    queryKey: ["reports", "financial", "cash-flow", params],
    queryFn: () => reportsApi.getCashFlow(params)
  });
}
