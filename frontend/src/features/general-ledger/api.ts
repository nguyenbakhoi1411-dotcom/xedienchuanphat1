import { api } from '@/lib/api/axios';
import type { AxiosResponse } from 'axios';
import type {
  JournalEntry,
  ChartOfAccount,
  GeneralLedgerRow,
  TrialBalanceRow,
  AccountingPeriod,
  PageResponse
} from './types';

const d = <T>(r: AxiosResponse<T>): T => r.data;

export interface GeneralLedgerResponse {
  accountCode: string;
  accountName: string;
  fromDate: string;
  toDate: string;
  openingBalance: number;
  closingBalance: number;
  lines: GeneralLedgerRow[];
}

export interface TrialBalanceResponse {
  fromDate: string;
  toDate: string;
  rows: TrialBalanceRow[];
  totalOpeningDebit: number;
  totalOpeningCredit: number;
  totalPeriodDebit: number;
  totalPeriodCredit: number;
  totalClosingDebit: number;
  totalClosingCredit: number;
}

export const generalLedgerApi = {
  listJournalEntries: (params: {
    page?: number;
    size?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    sourceType?: string;
    accountCode?: string;
    branchId?: number;
  }) =>
    api.get<PageResponse<JournalEntry>>('/api/v1/accounting/journal-entries', { params }).then(d),

  getJournalEntry: (id: number) =>
    api.get<JournalEntry>(`/api/v1/accounting/journal-entries/${id}`).then(d),

  createJournalEntry: (data: Omit<JournalEntry, 'id' | 'entryCode' | 'totalDebit' | 'totalCredit' | 'createdBy' | 'status'>) =>
    api.post<JournalEntry>('/api/v1/accounting/journal-entries', data).then(d),

  updateJournalEntry: (id: number, data: Partial<JournalEntry>) =>
    api.put<JournalEntry>(`/api/v1/accounting/journal-entries/${id}`, data).then(d),

  postJournalEntry: (id: number) =>
    api.post<JournalEntry>(`/api/v1/accounting/journal-entries/${id}/post`).then(d),

  reverseJournalEntry: (id: number) =>
    api.post<JournalEntry>(`/api/v1/accounting/journal-entries/${id}/reverse`).then(d),

  cancelJournalEntry: (id: number) =>
    api.post<JournalEntry>(`/api/v1/accounting/journal-entries/${id}/cancel`).then(d),

  getChartOfAccounts: () =>
    api.get<PageResponse<ChartOfAccount>>('/api/v1/accounting/chart-of-accounts', { params: { page: 0, pageSize: 1000 } }).then(d),

  createAccount: (data: Omit<ChartOfAccount, 'id' | 'level' | 'isDetail'>) =>
    api.post<ChartOfAccount>('/api/v1/accounting/chart-of-accounts', data).then(d),

  getGeneralLedger: (params: { accountCode: string; fromDate: string; toDate: string; branchId?: number }) =>
    api.get<GeneralLedgerResponse>('/api/v1/reports/general-ledger', { params }).then(d),

  getTrialBalance: (params: { fromDate: string; toDate: string; branchId?: number }) =>
    api.get<TrialBalanceResponse>('/api/v1/reports/trial-balance', { params }).then(d),

  getPeriods: () =>
    api.get<AccountingPeriod[]>('/api/v1/accounting/periods').then(d)
};
