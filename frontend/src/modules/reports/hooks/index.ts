'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '../api/reports.api';
import {
  ReportList,
  BalanceSheetReport,
  IncomeStatementReport,
  CashFlowReport,
  GeneralLedgerReport,
  TrialBalanceReport,
  FilterPreset,
  FavoriteReport,
  RecentReport,
  DeadlineItem,
} from '../types';

// ============ REPORT HUB ============

export function useReportList(group?: string) {
  return useQuery<ReportList>({
    queryKey: ['reports', 'list', group],
    queryFn: () => reportsAPI.getReportList(group),
  });
}

export function useReportInfo(reportId: string) {
  return useQuery({
    queryKey: ['reports', 'info', reportId],
    queryFn: () => reportsAPI.getReportInfo(reportId),
    enabled: !!reportId,
  });
}

// ============ FAVORITES & RECENT ============

export function useFavoriteReports() {
  return useQuery<FavoriteReport[]>({
    queryKey: ['reports', 'favorites'],
    queryFn: () => reportsAPI.getFavoriteReports(),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => reportsAPI.toggleFavorite(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'favorites'] });
    },
  });
}

export function useRecentReports(limit: number = 5) {
  return useQuery<RecentReport[]>({
    queryKey: ['reports', 'recent', limit],
    queryFn: () => reportsAPI.getRecentReports(limit),
  });
}

// ============ FILTER PRESETS ============

export function useFilterPresets(reportId: string) {
  return useQuery<FilterPreset[]>({
    queryKey: ['reports', 'filters', reportId],
    queryFn: () => reportsAPI.getFilterPresets(reportId),
    enabled: !!reportId,
  });
}

export function useSaveFilterPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      name,
      filters,
    }: {
      reportId: string;
      name: string;
      filters: any;
    }) => reportsAPI.saveFilterPreset(reportId, name, filters),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'filters', reportId] });
    },
  });
}

export function useDeleteFilterPreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presetId: string) => reportsAPI.deleteFilterPreset(presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'filters'] });
    },
  });
}

// ============ DEADLINES ============

export function useUpcomingDeadlines() {
  return useQuery<DeadlineItem[]>({
    queryKey: ['reports', 'deadlines'],
    queryFn: () => reportsAPI.getUpcomingDeadlines(),
    refetchInterval: 1000 * 60 * 60, // Refresh hourly
  });
}

// ============ FINANCIAL REPORTS ============

export function useBalanceSheet(asOf?: string, compareTo?: string) {
  return useQuery<BalanceSheetReport>({
    queryKey: ['reports', 'balance-sheet', asOf, compareTo],
    queryFn: () => reportsAPI.getBalanceSheet(asOf || '', compareTo),
    enabled: !!asOf,
  });
}

export function useIncomeStatement(
  from?: string,
  to?: string,
  compareFrom?: string,
  compareTo?: string,
) {
  return useQuery<IncomeStatementReport>({
    queryKey: ['reports', 'income-statement', from, to, compareFrom, compareTo],
    queryFn: () => reportsAPI.getIncomeStatement(from || '', to || '', compareFrom, compareTo),
    enabled: !!(from && to),
  });
}

export function useCashFlow(from?: string, to?: string, method?: string) {
  return useQuery<CashFlowReport>({
    queryKey: ['reports', 'cash-flow', from, to, method],
    queryFn: () =>
      reportsAPI.getCashFlow(
        from || '',
        to || '',
        method as 'direct' | 'indirect',
      ),
    enabled: !!(from && to),
  });
}

// ============ GENERAL LEDGER ============

export function useGeneralLedger(accountCode?: string, from?: string, to?: string) {
  return useQuery<GeneralLedgerReport>({
    queryKey: ['reports', 'general-ledger', accountCode, from, to],
    queryFn: () => reportsAPI.getGeneralLedger(accountCode || '', from || '', to || ''),
    enabled: !!(accountCode && from && to),
  });
}

export function useTrialBalance(asOf?: string, level?: number) {
  return useQuery<TrialBalanceReport>({
    queryKey: ['reports', 'trial-balance', asOf, level],
    queryFn: () => reportsAPI.getTrialBalance(asOf || '', level),
    enabled: !!asOf,
  });
}

// ============ EXPORT ============

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      reportId,
      format,
      filters,
    }: {
      reportId: string;
      format: 'excel' | 'pdf' | 'csv';
      filters?: any;
    }) => reportsAPI.exportReport(reportId, format, filters),
  });
}

export function useSendReportEmail() {
  return useMutation({
    mutationFn: ({
      reportId,
      to,
      format,
    }: {
      reportId: string;
      to: string[];
      format: 'excel' | 'pdf' | 'both';
    }) => reportsAPI.sendReportEmail(reportId, to, format),
  });
}

// ============ SALES REPORTS ============

export function useSalesByProduct(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'sales-by-product', from, to],
    queryFn: () => reportsAPI.getSalesByProduct(from || '', to || ''),
    enabled: !!(from && to),
  });
}

export function useSalesByCustomer(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'sales-by-customer', from, to],
    queryFn: () => reportsAPI.getSalesByCustomer(from || '', to || ''),
    enabled: !!(from && to),
  });
}

export function useSalesTrend(from?: string, to?: string, interval?: string) {
  return useQuery({
    queryKey: ['reports', 'sales-trend', from, to, interval],
    queryFn: () => reportsAPI.getSalesTrend(from || '', to || '', interval),
    enabled: !!(from && to),
  });
}

// ============ RECEIVABLES REPORTS ============

export function useReceivablesSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'receivables-summary', from, to],
    queryFn: () => reportsAPI.getReceivablesSummary(from || '', to || ''),
    enabled: !!(from && to),
  });
}

export function useAgingReport(asOf?: string) {
  return useQuery({
    queryKey: ['reports', 'aging-report', asOf],
    queryFn: () => reportsAPI.getAgingReport(asOf || ''),
    enabled: !!asOf,
  });
}

// ============ PURCHASE REPORTS ============

export function usePurchaseByVendor(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'purchase-by-vendor', from, to],
    queryFn: () => reportsAPI.getPurchaseByVendor(from || '', to || ''),
    enabled: !!(from && to),
  });
}

export function usePurchaseDetail(from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'purchase-detail', from, to],
    queryFn: () => reportsAPI.getPurchaseDetail(from || '', to || ''),
    enabled: !!(from && to),
  });
}

// ============ INVENTORY REPORTS ============

export function useInventorySummary(asOf?: string) {
  return useQuery({
    queryKey: ['reports', 'inventory-summary', asOf],
    queryFn: () => reportsAPI.getInventorySummary(asOf || ''),
    enabled: !!asOf,
  });
}

export function useStockCard(productId?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['reports', 'stock-card', productId, from, to],
    queryFn: () => reportsAPI.getStockCard(productId || '', from || '', to || ''),
    enabled: !!(productId && from && to),
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: () => reportsAPI.getLowStockItems(),
  });
}

// ============ PAYROLL REPORTS ============

export function usePayrollSummary(period?: string) {
  return useQuery({
    queryKey: ['reports', 'payroll-summary', period],
    queryFn: () => reportsAPI.getPayrollSummary(period || ''),
    enabled: !!period,
  });
}

export function usePayrollSlip(employeeId?: string, period?: string) {
  return useQuery({
    queryKey: ['reports', 'payroll-slip', employeeId, period],
    queryFn: () => reportsAPI.getPayrollSlip(employeeId || '', period || ''),
    enabled: !!(employeeId && period),
  });
}

export function useInsuranceSummary(period?: string) {
  return useQuery({
    queryKey: ['reports', 'insurance-summary', period],
    queryFn: () => reportsAPI.getInsuranceSummary(period || ''),
    enabled: !!period,
  });
}

// ============ DASHBOARD ============

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: ['reports', 'dashboard', 'executive'],
    queryFn: () => reportsAPI.getExecutiveDashboard(),
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['reports', 'dashboard', 'kpis'],
    queryFn: () => reportsAPI.getDashboardKPIs(),
    refetchInterval: 1000 * 60 * 5,
  });
}
