'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { bankDepositApi } from '../api/bank-deposit.api';
import type {
  BankAccount,
  BankAccountSummary,
  BankTransaction,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  PagedResponse,
} from '../types';

export interface QueryTransactionRequest {
  bankAccountId?: string | number;
  startDate?: string;
  endDate?: string;
  loaiGiaoDich?: string;
  trangThaiDoiChieu?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// BANK ACCOUNT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useBankAccounts(includeInactive = false) {
  return useQuery<BankAccount[]>({
    queryKey: ['bankAccounts', includeInactive],
    queryFn: () => bankDepositApi.getAccounts(includeInactive),
  });
}

export function useBankAccount(id: string | number) {
  return useQuery<BankAccount>({
    queryKey: ['bankAccount', id],
    queryFn: () => bankDepositApi.getAccount(id),
    enabled: !!id,
  });
}

export function useAccountSummary(
  accountId: string | number | null | undefined,
  fromDate?: string,
  toDate?: string,
) {
  return useQuery<BankAccountSummary>({
    queryKey: ['accountSummary', accountId, fromDate, toDate],
    queryFn: () => bankDepositApi.getAccountSummary(accountId!, fromDate, toDate),
    enabled: !!accountId,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankAccountRequest) => bankDepositApi.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Tạo tài khoản ngân hàng thành công');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message;
      toast.error(msg || 'Tạo tài khoản thất bại');
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateBankAccountRequest;
    }) => bankDepositApi.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccount', id] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Cập nhật tài khoản thành công');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message;
      toast.error(msg || 'Cập nhật tài khoản thất bại');
    },
  });
}

export function useDeactivateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => bankDepositApi.deactivateAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Vô hiệu hóa tài khoản thành công');
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useTransactions(query: QueryTransactionRequest) {
  return useQuery<PagedResponse<BankTransaction>>({
    queryKey: ['transactions', query],
    queryFn: () => bankDepositApi.getTransactions(query),
    // Keep previous data while fetching next page
    placeholderData: (prev) => prev,
  });
}

/** Alias used by page.tsx */
export const useBankTransactions = useTransactions;

export function useBankTransaction(id: string | number) {
  return useQuery<BankTransaction>({
    queryKey: ['transaction', id],
    queryFn: () => bankDepositApi.getTransaction(id),
    enabled: !!id,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bankDepositApi.createReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message;
      toast.error(msg || 'Tạo phiếu thu thất bại');
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bankDepositApi.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message;
      toast.error(msg || 'Tạo phiếu chi thất bại');
    },
  });
}

export function usePostTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => bankDepositApi.postTransaction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      toast.success('Hạch toán giao dịch thành công');
    },
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => bankDepositApi.cancelTransaction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Hủy giao dịch thành công');
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STATEMENT / RECONCILIATION HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useImportStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      bankAccountId,
      nganHang,
    }: {
      file: File;
      bankAccountId: string | number;
      nganHang: string;
    }) => bankDepositApi.importStatement(file, bankAccountId, nganHang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statementLines'] });
      toast.success('Nhập sao kê thành công');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message;
      toast.error(msg || 'Nhập sao kê thất bại');
    },
  });
}

export function useStatementLines(
  statementId: string | number | null | undefined,
  filter?: string,
  page = 0,
  size = 50,
) {
  return useQuery({
    queryKey: ['statementLines', statementId, filter, page, size],
    queryFn: () => bankDepositApi.getStatementLines(statementId!, filter, page, size),
    enabled: !!statementId,
  });
}

export function useAutoMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statementId: string | number) => bankDepositApi.runAutoMatch(statementId),
    onSuccess: (result, statementId) => {
      queryClient.invalidateQueries({ queryKey: ['statementLines', statementId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(
        `Tự động ghép: ${result.soTuDongGhep} khớp, ${result.soCanXemLai} cần xem lại`,
      );
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message;
      toast.error(msg || 'Tự động ghép thất bại');
    },
  });
}

export function useMatchBankReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      lineId,
      bankTransactionId,
    }: {
      statementId: string | number;
      lineId: string | number;
      bankTransactionId: string | number;
    }) => bankDepositApi.manualMatch(statementId, lineId, bankTransactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['statementLines', variables.statementId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success('Ghép đôi giao dịch thành công');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message;
      toast.error(msg || 'Ghép đôi giao dịch thất bại');
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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
    setFilters((prev: any) => {
      const updated = { ...prev, ...newFilters };
      // Reset to page 1 when any non-pagination filter changes
      if (Object.keys(newFilters).some((key) => key !== 'page' && key !== 'limit')) {
        updated.page = 1;
      }
      return updated;
    });
  }, []);

  return { filters, handleFilterChange };
}

// Legacy aliases kept for any code that still imports from this file by old name
export {
  useTransactions as useBankReconciliation,
};

export const useCreateBankPayment = useCreatePayment;
export const useCreateBankReceipt = useCreateReceipt;
