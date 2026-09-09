export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';
export type JournalSourceType = 'MANUAL' | 'SALES' | 'PURCHASE' | 'CASH' | 'BANK' | 'PAYROLL';

export const JOURNAL_STATUS_LABELS: Record<JournalEntryStatus, string> = {
  DRAFT: 'Nháp',
  POSTED: 'Đã ghi sổ',
  CANCELLED: 'Đã hủy'
};

export const JOURNAL_STATUS_BADGE_TONE = {
  DRAFT: 'slate',
  POSTED: 'green',
  CANCELLED: 'red'
} as const;

export const JOURNAL_SOURCE_LABELS: Record<JournalSourceType, string> = {
  MANUAL: 'Thủ công',
  SALES: 'Bán hàng',
  PURCHASE: 'Mua hàng',
  CASH: 'Tiền mặt',
  BANK: 'Ngân hàng',
  PAYROLL: 'Lương'
};

export interface JournalEntryLine {
  id?: number;
  accountCode: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
  customerId?: number;
  supplierId?: number;
  costCenterId?: number;
}

export interface JournalEntry {
  id: number;
  entryCode: string;
  entryDate: string;
  description?: string;
  referenceNo?: string;
  sourceType: JournalSourceType;
  status: JournalEntryStatus;
  branchId: number;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  periodId?: number;
}

export interface ChartOfAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'COST_OF_GOODS_SOLD';
  parentAccountId?: number;
  parentId?: number;
  level: number;
  isDetail: boolean;
  description?: string;
}

export interface GeneralLedgerRow {
  date: string;
  entryCode: string;
  description: string;
  counterAccountCode?: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  level: number;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  hasChildren: boolean;
}

export interface AccountingPeriod {
  id: number;
  periodCode?: string;
  periodName?: string; // fallback if backend uses periodName or periodCode
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'LOCKED';
  fiscalYear?: number;
  branchId?: number;
  month?: number;
  year?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
