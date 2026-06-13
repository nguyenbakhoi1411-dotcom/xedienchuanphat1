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
