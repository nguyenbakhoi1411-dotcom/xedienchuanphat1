// Transaction and reconciliation types
export enum TransactionType {
  RECEIPT = 'RECEIPT',
  PAYMENT = 'PAYMENT',
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export enum PartnerType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum ReconciliationStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  CLOSED = 'CLOSED',
}

// Bank Account
export interface BankAccount {
  id: string;
  branchId: string;
  accountNo: string;
  accountName: string;
  bankName: string;
  bankBranch: string | null;
  currency: string;
  accountingCode: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBankAccountRequest {
  accountNo: string;
  accountName: string;
  bankName: string;
  bankBranch?: string;
  currency?: string;
  accountingCode: string;
  openingBalance?: number;
  notes?: string;
}

export interface UpdateBankAccountRequest {
  accountName?: string;
  bankName?: string;
  bankBranch?: string;
  accountingCode?: string;
  isActive?: boolean;
  notes?: string;
}

// Bank Transaction
export interface BankTransaction {
  id: string;
  branchId: string;
  type: TransactionType;
  subType: string;
  docNo: string;
  docDate: string;
  bankAccountId: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountVnd: number;
  description: string | null;
  partnerType: PartnerType | null;
  partnerId: string | null;
  debitAccount: string;
  creditAccount: string;
  status: TransactionStatus;
  postedAt: Date | null;
  postedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  bankAccount?: BankAccount;
}

export interface CreateBankReceiptRequest {
  bankAccountId: string;
  subType: string;
  docDate: string;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  description?: string;
  partnerType?: PartnerType;
  partnerId?: string;
  debitAccount: string;
  creditAccount: string;
}

export interface CreateBankPaymentRequest {
  bankAccountId: string;
  subType: string;
  docDate: string;
  amount: number;
  currency?: string;
  exchangeRate?: number;
  description?: string;
  partnerType?: PartnerType;
  partnerId?: string;
  debitAccount: string;
  creditAccount: string;
}

export interface UpdateBankTransactionRequest {
  subType?: string;
  docDate?: string;
  amount?: number;
  exchangeRate?: number;
  description?: string;
  partnerType?: PartnerType;
  partnerId?: string;
}

export interface QueryTransactionRequest {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
  bankAccountId?: string;
  page?: number;
  limit?: number;
}

// Bank Reconciliation
export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  period: string;
  statementBalance: number;
  bookBalance: number;
  difference: number;
  status: ReconciliationStatus;
  reconciledAt: Date | null;
  reconciledBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  bankAccount?: BankAccount;
}

export interface ReconcileRequest {
  period: string;
  statementBalance: number;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Dropdown options
export const receiptSubTypes = [
  { value: 'bao-co', label: 'Báo có' },
  { value: 'thu-hd', label: 'Thu theo HĐ' },
  { value: 'thu-hd-many', label: 'Thu HĐ nhiều KH' },
  { value: 'chuyen-noi-bo', label: 'Chuyển nội bộ' },
  { value: 'nhan-quy', label: 'Nhận từ quỹ' },
];

export const paymentSubTypes = [
  { value: 'bao-no', label: 'Báo nợ' },
  { value: 'chi-de-nghi', label: 'Chi đề nghị' },
  { value: 'chi-hd-mua', label: 'Chi theo HĐ mua' },
  { value: 'chi-luong', label: 'Chi lương' },
  { value: 'chuyen-noi-bo', label: 'Chuyển nội bộ' },
  { value: 'nop-ngan-hang', label: 'Nộp vào NH' },
];

export const navItems = [
  { id: 1, label: 'Tất cả' },
  { id: 2, label: 'Hôm nay' },
  { id: 3, label: 'Tuần này' },
  { id: 4, label: 'Tháng này' },
  { id: 5, label: 'Khác' },
];

export const reportItems = [
  { id: 'daily-summary', title: 'Tóm tắt hàng ngày', count: 15 },
  { id: 'account-balance', title: 'Số dư tài khoản', count: 8 },
  { id: 'pending', title: 'Chứng từ chưa hạch toán', count: 3 },
  { id: 'reconciliation', title: 'Trạng thái đối chiếu', count: 12 },
  { id: 'audit', title: 'Lịch sử biến động', count: 42 },
];
