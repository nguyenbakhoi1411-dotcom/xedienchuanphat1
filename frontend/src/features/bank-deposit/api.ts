import axios from 'axios';
import type { BankAccount, BankTransaction, BankReconciliation, CreateBankAccountDto, UpdateBankAccountDto } from './types';

export const bankApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BANK_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor to copy token from localStorage
bankApi.interceptors.request.use(cfg => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    cfg.headers.Authorization = 'Bearer ' + token;
  }
  return cfg;
});

// Interceptor to format NestJS connection errors
bankApi.interceptors.response.use(
  response => response,
  error => {
    // If it is a connection error (e.g., NestJS server is offline)
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.message?.toLowerCase().includes('network error') ||
      error.message?.toLowerCase().includes('econnrefused')
    ) {
      error.message = 'Không thể kết nối server ngân hàng';
    }
    return Promise.reject(error);
  }
);

// Map backend BankAccount (using accountNo) to frontend BankAccount (using accountNumber)
const mapAccount = (acc: any): BankAccount => ({
  id: acc.id,
  bankName: acc.bankName,
  accountNumber: acc.accountNo || acc.accountNumber || '',
  currentBalance: Number(acc.currentBalance ?? 0),
  currency: acc.currency || 'VND',
  branchId: acc.branchId,
  isActive: acc.isActive,
  // Preserve original properties
  accountName: acc.accountName,
  bankBranch: acc.bankBranch,
  accountingCode: acc.accountingCode,
  openingBalance: acc.openingBalance,
  notes: acc.notes,
});

// Map backend BankTransaction (using docDate, status) to frontend BankTransaction
const mapTransaction = (tx: any): BankTransaction => {
  const isReceipt = tx.type === 'RECEIPT';
  return {
    id: tx.id,
    accountId: tx.bankAccountId || tx.accountId,
    transactionDate: tx.docDate || tx.transactionDate || '',
    description: tx.description || '',
    credit: isReceipt ? Number(tx.amount || 0) : 0,
    debit: !isReceipt ? Number(tx.amount || 0) : 0,
    balance: Number(tx.bankAccount?.currentBalance || tx.balance || 0),
    reconciliationStatus: tx.reconciliationStatus || (tx.status === 'POSTED' ? 'MATCHED' : 'UNMATCHED'),
    // Preserve original properties
    docNo: tx.docNo,
    type: tx.type,
    subType: tx.subType,
    amount: tx.amount,
    currency: tx.currency,
    status: tx.status,
  };
};

// Map backend BankReconciliation to frontend BankReconciliation
const mapReconciliation = (rec: any): BankReconciliation => ({
  id: rec.id,
  accountId: rec.bankAccountId || rec.accountId,
  period: rec.period,
  status: rec.status || 'OPEN',
  difference: Number(rec.difference ?? 0),
  matchedCount: Number(rec.matchedCount ?? 0),
  unmatchedCount: Number(rec.unmatchedCount ?? 0),
  // Preserve original properties
  statementBalance: rec.statementBalance,
  bookBalance: rec.bookBalance,
  notes: rec.notes,
});

export const bankDepositApi = {
  // GET /api/bank-deposit/accounts
  getAccounts: async (): Promise<BankAccount[]> => {
    const res = await bankApi.get('/bank-deposit/accounts');
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map(mapAccount);
  },

  // GET /api/bank-deposit/transactions?accountId&fromDate&toDate&page&size
  getTransactions: async (params?: {
    accountId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ data: BankTransaction[]; total: number }> => {
    // Map params to backend naming: accountId -> bankAccountId, fromDate -> startDate, toDate -> endDate, size -> limit
    const queryParams: Record<string, any> = {};
    if (params?.accountId) queryParams.bankAccountId = params.accountId;
    if (params?.fromDate) queryParams.startDate = params.fromDate;
    if (params?.toDate) queryParams.endDate = params.toDate;
    if (params?.page) queryParams.page = params.page;
    if (params?.size) queryParams.limit = params.size;

    const res = await bankApi.get('/bank-deposit/transactions', { params: queryParams });
    const data = res.data?.data || [];
    const total = res.data?.total || 0;

    return {
      data: data.map(mapTransaction),
      total,
    };
  },

  // POST /api/bank-deposit/transactions
  createTransaction: async (data: any): Promise<BankTransaction> => {
    // In NestJS controller, transaction creation is split into POST /receipts and POST /payments.
    // If user calls createTransaction directly, we route it accordingly or call POST /bank-deposit/transactions
    let res;
    if (data.type === 'RECEIPT' || data.voucherType === 'RECEIPT') {
      res = await bankApi.post('/bank-deposit/receipts', {
        bankAccountId: data.accountId || data.bankAccountId,
        subType: data.subType || 'bao-co',
        docDate: data.transactionDate || data.docDate,
        amount: data.amount || data.credit || 0,
        currency: data.currency || 'VND',
        exchangeRate: data.exchangeRate || 1,
        description: data.description || '',
        debitAccount: data.debitAccount || '1121', // Standard bank account code
        creditAccount: data.creditAccount || '5111',
      });
    } else if (data.type === 'PAYMENT' || data.voucherType === 'PAYMENT') {
      res = await bankApi.post('/bank-deposit/payments', {
        bankAccountId: data.accountId || data.bankAccountId,
        subType: data.subType || 'bao-no',
        docDate: data.transactionDate || data.docDate,
        amount: data.amount || data.debit || 0,
        currency: data.currency || 'VND',
        exchangeRate: data.exchangeRate || 1,
        description: data.description || '',
        debitAccount: data.debitAccount || '6422',
        creditAccount: data.creditAccount || '1121',
      });
    } else {
      // Direct POST fallback
      res = await bankApi.post('/bank-deposit/transactions', data);
    }
    return mapTransaction(res.data);
  },

  // POST /api/bank-deposit/transactions/import (multipart/form-data)
  importTransactions: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await bankApi.post('/bank-deposit/transactions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // GET /api/bank-deposit/reconciliations?accountId&period
  getReconciliations: async (params: { accountId: string; period: string }): Promise<BankReconciliation | null> => {
    try {
      // Maps to GET /bank-deposit/reconciliation/:accountId/:period
      const res = await bankApi.get(`/bank-deposit/reconciliation/${params.accountId}/${params.period}`);
      return mapReconciliation(res.data);
    } catch (err: any) {
      // If NestJS returns 404 (NotFound), we gracefully return a default empty reconciliation state instead of crashing
      if (err.response?.status === 404) {
        return {
          id: `draft-${params.accountId}-${params.period}`,
          accountId: params.accountId,
          period: params.period,
          status: 'OPEN',
          difference: 0,
          matchedCount: 0,
          unmatchedCount: 0,
          statementBalance: 0,
          bookBalance: 0,
          notes: '',
        };
      }
      throw err;
    }
  },

  // POST /api/bank-deposit/reconciliations
  createReconciliation: async (data: { accountId: string; period: string; statementBalance: number; notes?: string }): Promise<BankReconciliation> => {
    // Maps to POST /bank-deposit/reconciliation/:accountId/:period
    const res = await bankApi.post(`/bank-deposit/reconciliation/${data.accountId}/${data.period}`, {
      statementBalance: data.statementBalance,
      notes: data.notes,
    });
    return mapReconciliation(res.data);
  },

  // POST /api/bank-deposit/reconciliations/{id}/match
  matchReconciliation: async (id: string, data: { bankTransactionIds: string[]; systemTransactionIds: string[] }): Promise<any> => {
    // If backend doesn't support match endpoint directly, we make a call and handle the return, or fallback gracefully
    const res = await bankApi.post(`/bank-deposit/reconciliations/${id}/match`, data);
    return res.data;
  },

  // Bank Accounts creation/update methods for the Tài khoản NH tab
  createAccount: async (data: CreateBankAccountDto): Promise<BankAccount> => {
    const res = await bankApi.post('/bank-deposit/accounts', data);
    return mapAccount(res.data);
  },

  updateAccount: async (id: string, data: UpdateBankAccountDto): Promise<BankAccount> => {
    const res = await bankApi.put(`/bank-deposit/accounts/${id}`, data);
    return mapAccount(res.data);
  },

  deactivateAccount: async (id: string): Promise<BankAccount> => {
    const res = await bankApi.delete(`/bank-deposit/accounts/${id}`);
    return mapAccount(res.data);
  },
};
