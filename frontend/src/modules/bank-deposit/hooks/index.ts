'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { bankDepositAPI } from '../api/bank-deposit.api';
import {
  BankAccount,
  BankTransaction,
  BankReconciliation,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  CreateBankReceiptRequest,
  CreateBankPaymentRequest,
  UpdateBankTransactionRequest,
  QueryTransactionRequest,
  ReconcileRequest,
} from '../types';

// ============ BANK ACCOUNT HOOKS ============

export function useBankAccounts(includeInactive = false) {
  return useQuery<BankAccount[]>({
    queryKey: ['bankAccounts', includeInactive],
    queryFn: () => bankDepositAPI.getBankAccounts(includeInactive),
  });
}

export function useBankAccount(id: string) {
  return useQuery<BankAccount>({
    queryKey: ['bankAccount', id],
    queryFn: () => bankDepositAPI.getBankAccount(id),
    enabled: !!id,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankAccountRequest) =>
      bankDepositAPI.createBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBankAccountRequest }) =>
      bankDepositAPI.updateBankAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccount', id] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

export function useDeactivateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankDepositAPI.deactivateBankAccount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccount', id] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

// ============ TRANSACTION HOOKS ============

export function useTransactions(query: QueryTransactionRequest) {
  return useQuery({
    queryKey: ['transactions', query],
    queryFn: () => bankDepositAPI.getTransactions(query),
  });
}

export function useTransaction(id: string) {
  return useQuery<BankTransaction>({
    queryKey: ['transaction', id],
    queryFn: () => bankDepositAPI.getTransaction(id),
    enabled: !!id,
  });
}

export function useCreateBankReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankReceiptRequest) =>
      bankDepositAPI.createBankReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

export function useCreateBankPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankPaymentRequest) =>
      bankDepositAPI.createBankPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBankTransactionRequest }) =>
      bankDepositAPI.updateTransaction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function usePostTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankDepositAPI.postTransaction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    },
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bankDepositAPI.cancelTransaction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ============ RECONCILIATION HOOKS ============

export function useReconciliation(accountId: string, period: string) {
  return useQuery<BankReconciliation>({
    queryKey: ['reconciliation', accountId, period],
    queryFn: () => bankDepositAPI.getReconciliation(accountId, period),
    enabled: !!accountId && !!period,
  });
}

export function useLatestReconciliation(accountId: string) {
  return useQuery<BankReconciliation | null>({
    queryKey: ['latestReconciliation', accountId],
    queryFn: () => bankDepositAPI.getLatestReconciliation(accountId),
    enabled: !!accountId,
  });
}

export function useReconcile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      period,
      data,
    }: {
      accountId: string;
      period: string;
      data: ReconcileRequest;
    }) => bankDepositAPI.reconcile(accountId, period, data),
    onSuccess: (_, { accountId, period }) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation', accountId, period] });
      queryClient.invalidateQueries({ queryKey: ['latestReconciliation', accountId] });
    },
  });
}

// ============ REPORT HOOKS ============

export function useDailySummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['dailySummary', startDate, endDate],
    queryFn: () => bankDepositAPI.getDailySummary(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useAccountBalanceReport() {
  return useQuery<BankAccount[]>({
    queryKey: ['accountBalanceReport'],
    queryFn: () => bankDepositAPI.getAccountBalanceReport(),
  });
}

export function usePendingTransactions() {
  return useQuery({
    queryKey: ['pendingTransactions'],
    queryFn: () => bankDepositAPI.getPendingTransactions(),
  });
}

export function useReconciliationStatusReport() {
  return useQuery({
    queryKey: ['reconciliationStatus'],
    queryFn: () => bankDepositAPI.getReconciliationStatusReport(),
  });
}

export function useTransactionAuditReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['transactionAudit', startDate, endDate],
    queryFn: () => bankDepositAPI.getTransactionAuditReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// ============ LOCAL STATE HOOKS ============

/**
 * Hook for managing form state with auto-save
 */
export function useAutoSaveFormState<T>(
  initialValue: T,
  onSave?: (value: T) => Promise<void>,
) {
  const [formState, setFormState] = useState<T>(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback((newValue: Partial<T>) => {
    setFormState((prev) => ({ ...prev, ...newValue }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (isDirty && onSave) {
      setIsSaving(true);
      try {
        await onSave(formState);
        setIsDirty(false);
      } finally {
        setIsSaving(false);
      }
    }
  }, [isDirty, formState, onSave]);

  return { formState, isDirty, isSaving, handleChange, handleSave };
}

/**
 * Hook for managing transaction filters
 */
export function useTransactionFilters() {
  const [filters, setFilters] = useState<QueryTransactionRequest>({
    page: 1,
    limit: 20,
  });

  const handleFilterChange = useCallback((newFilters: Partial<QueryTransactionRequest>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      // Reset to page 1 when filters change
      if (Object.keys(newFilters).some((key) => key !== 'page' && key !== 'limit')) {
        updated.page = 1;
      }
      return updated;
    });
  }, []);

  return { filters, handleFilterChange };
}
