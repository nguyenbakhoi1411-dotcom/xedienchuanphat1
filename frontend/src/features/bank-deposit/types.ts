export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  currency: string;
  branchId: string;
  isActive: boolean;
  
  // Extra fields matching the database schema
  accountName?: string;
  bankBranch?: string;
  accountingCode?: string;
  openingBalance?: number;
  notes?: string;
}

export type ReconciliationStatus = 'UNMATCHED' | 'MATCHED' | 'IGNORED';

export interface BankTransaction {
  id: string;
  accountId: string;
  transactionDate: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
  reconciliationStatus: ReconciliationStatus;
  
  // Extra database matching fields
  docNo?: string;
  type?: 'RECEIPT' | 'PAYMENT';
  subType?: string;
  amount?: number;
  currency?: string;
  status?: 'DRAFT' | 'POSTED' | 'CANCELLED';
}

export interface BankReconciliation {
  id: string;
  accountId: string;
  period: string; // YYYY-MM
  status: string;
  difference: number;
  matchedCount: number;
  unmatchedCount: number;
  
  // Extra database fields
  statementBalance?: number;
  bookBalance?: number;
  notes?: string;
}

export interface CreateBankAccountDto {
  bankName: string;
  accountNo: string;
  openingBalance: number;
  bankBranch?: string;
  accountingCode?: string;
  currency?: string;
  notes?: string;
}

export interface UpdateBankAccountDto {
  bankName?: string;
  accountNo?: string;
  bankBranch?: string;
  accountingCode?: string;
  isActive?: boolean;
  notes?: string;
}

export interface QueryTransactionParams {
  accountId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}
