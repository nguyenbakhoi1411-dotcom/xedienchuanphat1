"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountingApi } from "./api";
import type { AccountingFilters, CreatePaymentPayload, CreateReceiptPayload, DebtFilters } from "./types";

export function useAccountingOverview() {
  return useQuery({ queryKey: ["accounting", "overview"], queryFn: () => accountingApi.overview() });
}

export function useReceipts(params: AccountingFilters) {
  return useQuery({ queryKey: ["accounting", "receipts", params], queryFn: () => accountingApi.receipts(params) });
}

export function usePayments(params: AccountingFilters) {
  return useQuery({ queryKey: ["accounting", "payments", params], queryFn: () => accountingApi.payments(params) });
}

export function useDebts(params: DebtFilters) {
  return useQuery({ queryKey: ["accounting", "debts", params], queryFn: () => accountingApi.debts(params) });
}

export function useAccounts() {
  return useQuery({ queryKey: ["accounting", "accounts"], queryFn: () => accountingApi.accounts() });
}

export function useJournalEntries() {
  return useQuery({ queryKey: ["accounting", "journal-entries"], queryFn: () => accountingApi.journalEntries() });
}

export function useAccountingReports() {
  return useQuery({
    queryKey: ["accounting", "ledger-reports"],
    queryFn: async () => {
      const toDate = new Date().toISOString().slice(0, 10);
      const fromDate = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
      const [trialBalance, balanceSheet, incomeStatement, customerDebtAging, supplierDebtAging] = await Promise.all([
        accountingApi.trialBalance(fromDate, toDate),
        accountingApi.balanceSheet(fromDate, toDate),
        accountingApi.incomeStatement(fromDate, toDate),
        accountingApi.customerDebtAging(),
        accountingApi.supplierDebtAging()
      ]);
      return { trialBalance, balanceSheet, incomeStatement, customerDebtAging, supplierDebtAging };
    }
  });
}

export function useCreateReceipt() {
  return useAccountingMutation<CreateReceiptPayload>((payload) => accountingApi.createReceipt(payload), "Da tao phieu thu");
}

export function useCreatePayment() {
  return useAccountingMutation<CreatePaymentPayload>((payload) => accountingApi.createPayment(payload), "Da tao phieu chi");
}

function useAccountingMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounting"] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the thuc hien thao tac")
  });
}
