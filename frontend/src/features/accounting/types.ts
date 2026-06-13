export type AccountingTab =
  | "overview"
  | "accounts"
  | "journal"
  | "receipts"
  | "payments"
  | "debts"
  | "reports"
  | "cashflow"
  | "tax-invoices"
  | "expenses"
  | "fixed-assets"
  | "vat-report";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CARD" | "E_WALLET" | "INSTALLMENT";

export type VoucherStatus = "POSTED" | "DRAFT" | "CANCELLED";

export type VoucherType = "RECEIPT" | "PAYMENT";

export type ReceiptVoucher = {
  id: number;
  voucherNo: string;
  receiptDate: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: VoucherStatus;
  reason: string;
};

export type PaymentVoucher = {
  id: number;
  voucherNo: string;
  paymentDate: string;
  supplierName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: VoucherStatus;
  reason: string;
};

export type DebtRow = {
  id: number;
  partyType: "CUSTOMER" | "SUPPLIER";
  partyName: string;
  phone: string;
  openingBalance: number;
  debitAmount: number;
  creditAmount: number;
  endingBalance: number;
};

export type CashFlowPoint = {
  period: string;
  cashIn: number;
  cashOut: number;
};

export type FinancialKpis = {
  revenue: number;
  grossProfit: number;
  netProfit: number;
  cashBalance: number;
  bankBalance: number;
  receivable: number;
  payable: number;
  cashIn: number;
  cashOut: number;
};

export type ProfitLossReport = {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
};

export type CashFlowReport = {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  series: CashFlowPoint[];
};

export type AccountingOverview = {
  kpis: FinancialKpis;
  profitLoss: ProfitLossReport;
  cashFlow: CashFlowReport;
  cashFunds: Array<{ id: number; name: string; balance: number }>;
  bankAccounts: Array<{ id: number; bankName: string; accountNumber: string; balance: number }>;
};

export type BankAccountOption = {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder?: string;
  currentBalance?: number;
  balance?: number;
};

export type AccountingFilters = {
  keyword: string;
  status: "ALL" | VoucherStatus;
  method: "ALL" | PaymentMethod;
  page: number;
  pageSize: number;
};

export type DebtFilters = {
  keyword: string;
  partyType: "ALL" | "CUSTOMER" | "SUPPLIER";
  page: number;
  pageSize: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE" | "COST_OF_GOODS_SOLD";

export type ChartOfAccount = {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentAccountId?: number | null;
  active: boolean;
  description?: string | null;
};

export type JournalEntryStatus = "DRAFT" | "POSTED" | "CANCELLED";

export type JournalEntryLine = {
  id: number;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string | null;
  customerId?: number | null;
  supplierId?: number | null;
  productId?: number | null;
  branchId?: number | null;
  taxAmount?: number | null;
};

export type JournalEntry = {
  id: number;
  entryCode?: string | null;
  entryDate: string;
  referenceType: string;
  referenceId?: string | null;
  description?: string | null;
  status: JournalEntryStatus;
  createdBy: string;
  postedBy?: string | null;
  cancelledBy?: string | null;
  branchId?: number | null;
  totalDebit: number;
  totalCredit: number;
  lines: JournalEntryLine[];
};

export type LedgerReportRow = {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitAmount: number;
  creditAmount: number;
  balance: number;
};

export type FinancialStatement = {
  fromDate: string;
  toDate: string;
  rows: LedgerReportRow[];
  totalDebit: number;
  totalCredit: number;
};

export type DebtAgingRow = {
  partyType: "CUSTOMER" | "SUPPLIER";
  partyId: number;
  partyName: string;
  bucket0To30: number;
  bucket31To60: number;
  bucket61To90: number;
  bucketOver90: number;
  total: number;
};

export type CreateReceiptPayload = {
  voucherNo: string;
  receiptDate: string;
  customerId: number;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: number;
  reason: string;
};

export type CreatePaymentPayload = {
  voucherNo: string;
  paymentDate: string;
  supplierId: number;
  supplierName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: number;
  reason: string;
};

// ── Tax Invoice (Hóa đơn VAT) ──

export type InvoiceStatus = "DRAFT" | "ISSUED" | "ADJUSTED" | "REPLACED" | "CANCELLED";
export type InvoiceType = "OUTPUT" | "INPUT";

export type TaxInvoice = {
  id: number;
  invoiceCode: string;
  invoiceSerial?: string | null;
  invoiceDate: string;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  customerId?: number | null;
  supplierId?: number | null;
  eInvoiceProvider?: string | null;
  eInvoiceNo?: string | null;
  eInvoiceStatus?: string | null;
  taxBaseAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  relatedOrderNo?: string | null;
  relatedReturnNo?: string | null;
  branchId: number;
  createdBy: string;
  createdAt: string;
  issuedAt?: string | null;
  note?: string | null;
};

export type CreateTaxInvoicePayload = {
  invoiceCode: string;
  invoiceSerial?: string;
  invoiceDate: string;
  customerId?: number;
  supplierId?: number;
  taxBaseAmount: number;
  vatRate: number;
  vatAmount?: number;
  relatedOrderNo?: string;
  relatedReturnNo?: string;
  branchId: number;
  note?: string;
};

export type VatReport = {
  year: number;
  month: number;
  branchId: number;
  outputTaxBase: number;
  outputVatAmount: number;
  inputTaxBase: number;
  inputVatAmount: number;
  vatPayable: number;
  vatRefundable: number;
  outputInvoices: TaxInvoice[];
  inputInvoices: TaxInvoice[];
};

// ── Expense (Chi phí vận hành) ──

export type ExpenseCategory = "SALARY" | "RENT" | "UTILITIES" | "MARKETING" | "MAINTENANCE" | "DEPRECIATION" | "OTHER";
export type ExpenseStatus = "DRAFT" | "POSTED" | "CANCELLED";

export type Expense = {
  id: number;
  expenseCode: string;
  expenseDate: string;
  category: ExpenseCategory;
  amount: number;
  description?: string | null;
  branchId: number;
  accountCode: string;
  contraAccount?: string | null;
  journalEntryId?: number | null;
  status: ExpenseStatus;
  createdBy: string;
  createdAt: string;
  postedBy?: string | null;
  postedAt?: string | null;
};

export type CreateExpensePayload = {
  expenseDate?: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  branchId: number;
  accountCode?: string;
  contraAccount?: string;
};

// ── Fixed Asset (Tài sản cố định) ──

export type FixedAssetStatus = "ACTIVE" | "DISPOSED" | "FULLY_DEPRECIATED";
export type DepreciationMethod = "STRAIGHT_LINE" | "DECLINING_BALANCE";

export type FixedAsset = {
  id: number;
  assetCode: string;
  assetName: string;
  category: string;
  status: FixedAssetStatus;
  purchaseDate: string;
  costAmount: number;
  residualValue: number;
  usefulLifeMonths: number;
  depreciationMethod: DepreciationMethod;
  accumulatedDepreciation: number;
  bookValue: number;
  branchId: number;
  accountCode: string;
  depreciationAccountCode: string;
  expenseAccountCode: string;
  purchaseOrderNo?: string | null;
  supplierName?: string | null;
  note?: string | null;
  disposedAt?: string | null;
  disposalAmount?: number | null;
  createdAt: string;
};

export type DepreciationLine = {
  assetId: number;
  assetCode: string;
  assetName: string;
  amount: number;
  result: string;
};

export type DepreciationRunResult = {
  year: number;
  month: number;
  lines: DepreciationLine[];
  totalAmount: number;
};

export type CreateFixedAssetPayload = {
  assetName: string;
  category: string;
  purchaseDate: string;
  costAmount: number;
  residualValue?: number;
  usefulLifeMonths: number;
  depreciationMethod?: DepreciationMethod;
  branchId: number;
  accountCode?: string;
  depreciationAccountCode?: string;
  expenseAccountCode?: string;
  purchaseOrderNo?: string;
  supplierName?: string;
  note?: string;
};
