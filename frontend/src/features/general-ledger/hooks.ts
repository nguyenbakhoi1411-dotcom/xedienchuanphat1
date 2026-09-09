"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generalLedgerApi } from "./api";
import type { JournalEntry, ChartOfAccount } from "./types";

export function useJournalEntries(params: {
  page?: number;
  size?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  sourceType?: string;
  accountCode?: string;
  branchId?: number;
}) {
  return useQuery({
    queryKey: ["journal-entries", params],
    queryFn: () => generalLedgerApi.listJournalEntries(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useJournalEntryDetail(id?: number | null) {
  return useQuery({
    queryKey: ["journal-entries", "detail", id],
    queryFn: () => generalLedgerApi.getJournalEntry(id as number),
    enabled: Boolean(id),
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<JournalEntry, 'id' | 'entryCode' | 'totalDebit' | 'totalCredit' | 'createdBy' | 'status'>) =>
      generalLedgerApi.createJournalEntry(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Tạo bút toán thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Tạo bút toán thất bại");
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JournalEntry> }) =>
      generalLedgerApi.updateJournalEntry(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success("Cập nhật bút toán thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Cập nhật bút toán thất bại");
    },
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => generalLedgerApi.postJournalEntry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      await queryClient.invalidateQueries({ queryKey: ["general-ledger-report"] });
      await queryClient.invalidateQueries({ queryKey: ["trial-balance-report"] });
      toast.success("Ghi sổ thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Ghi sổ thất bại");
    },
  });
}

export function useReverseJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => generalLedgerApi.reverseJournalEntry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      await queryClient.invalidateQueries({ queryKey: ["general-ledger-report"] });
      await queryClient.invalidateQueries({ queryKey: ["trial-balance-report"] });
      toast.success("Đảo ngược bút toán thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Đảo ngược bút toán thất bại");
    },
  });
}

export function useCancelJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => generalLedgerApi.cancelJournalEntry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      await queryClient.invalidateQueries({ queryKey: ["general-ledger-report"] });
      await queryClient.invalidateQueries({ queryKey: ["trial-balance-report"] });
      toast.success("Hủy bút toán thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Hủy bút toán thất bại");
    },
  });
}

export function useChartOfAccounts() {
  return useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: () => generalLedgerApi.getChartOfAccounts(),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ChartOfAccount, 'id' | 'level' | 'isDetail'>) =>
      generalLedgerApi.createAccount(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      toast.success("Thêm tài khoản thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Thêm tài khoản thất bại");
    },
  });
}

export function useGeneralLedgerReport(params: { accountCode: string; fromDate: string; toDate: string; branchId?: number }) {
  return useQuery({
    queryKey: ["general-ledger-report", params],
    queryFn: () => generalLedgerApi.getGeneralLedger(params),
    enabled: Boolean(params.accountCode && params.fromDate && params.toDate),
  });
}

export function useTrialBalanceReport(params: { fromDate: string; toDate: string; branchId?: number }) {
  return useQuery({
    queryKey: ["trial-balance-report", params],
    queryFn: () => generalLedgerApi.getTrialBalance(params),
    enabled: Boolean(params.fromDate && params.toDate),
  });
}

export function useAccountingPeriods() {
  return useQuery({
    queryKey: ["accounting-periods"],
    queryFn: () => generalLedgerApi.getPeriods(),
  });
}
