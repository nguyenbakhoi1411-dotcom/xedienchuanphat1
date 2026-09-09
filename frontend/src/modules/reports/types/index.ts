// ============ Report Enums ============

export enum ReportGroup {
  FINANCIAL = 'financial',
  GENERAL_LEDGER = 'general_ledger',
  SALES = 'sales',
  PURCHASE = 'purchase',
  INVENTORY = 'inventory',
  CASH = 'cash',
  RECEIVABLES = 'receivables',
  PAYABLES = 'payables',
  TAX = 'tax',
  PAYROLL = 'payroll',
  MANAGEMENT = 'management',
}

export enum PeriodType {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export enum ComparisonType {
  PREV_PERIOD = 'prev_period',
  SAME_PERIOD_LAST_YEAR = 'same_period_last_year',
  NONE = 'none',
}

export enum CurrencyUnit {
  VND = 'VND',
  THOUSANDS = 'thousands',
  MILLIONS = 'millions',
}

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
  CSV = 'csv',
}

// ============ Report Info ============

export interface ReportInfo {
  id: string;
  code: string;
  name: string;
  description?: string;
  group: ReportGroup;
  icon: string;
  accentColor: string;
  isNew?: boolean;
  isPopular?: boolean;
  tags?: string[];
}

export interface ReportList {
  reports: ReportInfo[];
  total: number;
  groups: Record<ReportGroup, number>;
}

// ============ Period & Filters ============

export interface PeriodSelector {
  type: PeriodType;
  year: number;
  month?: number;
  quarter?: number;
  dateFrom?: Date;
  dateTo?: Date;
  compareWith?: ComparisonType;
}

export interface FilterPreset {
  id: string;
  reportId: string;
  name: string;
  filters: any;
  isDefault: boolean;
  createdAt: Date;
}

// ============ Report Data ============

export interface ReportRow {
  code?: string;
  name: string;
  level?: number;
  currentValue: number;
  previousValue?: number;
  difference?: number;
  percentChange?: number;
  note?: string;
  [key: string]: any;
}

export interface ReportData {
  id: string;
  name: string;
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  data: ReportRow[];
  summary?: {
    totalRows: number;
    totalValue?: number;
  };
  metadata?: Record<string, any>;
}

// ============ Balance Sheet (B01) ============

export enum BalanceSheetFormat {
  TT200 = 'TT200',
  TT133 = 'TT133',
}

export interface BalanceSheetItem {
  code: string;
  name: string;
  level: 1 | 2 | 3;
  currentPeriod: number;
  previousPeriod?: number;
  difference?: number;
  note?: string;
  children?: BalanceSheetItem[];
  isTotalRow?: boolean;
}

export interface BalanceSheetReport {
  id: string;
  reportCode: 'B01-DN' | 'B01a-DNN' | 'B01b-DNN';
  generatedAt: Date;
  asOfDate: Date;
  format: BalanceSheetFormat;
  currencyUnit: CurrencyUnit;
  
  assets: {
    currentAssets?: BalanceSheetItem[];
    fixedAssets?: BalanceSheetItem[];
    totalAssets?: number;
    previousTotalAssets?: number;
    [key: string]: any;
  };

  liabilitiesEquity: {
    currentLiabilities?: BalanceSheetItem[];
    longTermLiabilities?: BalanceSheetItem[];
    equity?: BalanceSheetItem[];
    totalLiabilitiesEquity?: number;
    liabilities?: BalanceSheetItem[];
    total?: number;
    previousTotal?: number;
    [key: string]: any;
  };

  isBalanced: boolean;
  balanceError?: number;
  notes?: string;
  [key: string]: any;
}

// ============ Income Statement (B02) ============

export interface IncomeStatementItem {
  code: string;
  name: string;
  currentValue: number;
  previousValue?: number;
  difference?: number;
  percentChange?: number;
  note?: string;
  isTotalRow?: boolean;
}

export interface IncomeStatementReport {
  id: string;
  reportCode: 'B02-DN' | 'B02-DNN';
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  comparePeriod?: {
    from: Date;
    to: Date;
  };
  currencyUnit: CurrencyUnit;

  sections: {
    revenue: {
      grossRevenue: IncomeStatementItem;
      revenueReductions: IncomeStatementItem;
      netRevenue: IncomeStatementItem;
    };
    grossProfit: {
      costOfGoodsSold: IncomeStatementItem;
      grossProfitValue: IncomeStatementItem;
    };
    operatingProfit: {
      financialIncome: IncomeStatementItem;
      financialExpense: IncomeStatementItem;
      sellingExpense: IncomeStatementItem;
      administrativeExpense: IncomeStatementItem;
      operatingProfitValue: IncomeStatementItem;
    };
    netProfit: {
      otherIncome: IncomeStatementItem;
      otherExpense: IncomeStatementItem;
      profitBeforeTax: IncomeStatementItem;
      incomeTax: IncomeStatementItem;
      netProfitValue: IncomeStatementItem;
    };
  };

  metrics?: {
    grossProfitMargin?: number;
    operatingMargin?: number;
    netProfitMargin?: number;
  };
}

// ============ Cash Flow (B03) ============

export enum CashFlowMethod {
  DIRECT = 'direct',
  INDIRECT = 'indirect',
}

export interface CashFlowItem {
  code: string;
  name: string;
  value: number;
  isTotalRow?: boolean;
  note?: string;
}

export interface CashFlowReport {
  id: string;
  reportCode: 'B03-DN' | 'B03-DN-GT' | 'B03-DNN';
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  method: CashFlowMethod;
  currencyUnit: CurrencyUnit;

  sections: {
    operatingActivities: CashFlowItem[];
    investingActivities: CashFlowItem[];
    financingActivities: CashFlowItem[];
  };

  summary: {
    netCashFlowPeriod: number;
    beginningBalance: number;
    exchangeRateEffect?: number;
    endingBalance: number;
  };

  isReconciled?: boolean;
  reconciliationError?: number;
}

// ============ General Ledger ============

export interface LedgerEntry {
  date: Date;
  voucherNo: string;
  voucherDate: Date;
  description: string;
  counterAccount: string;
  debit: number;
  credit: number;
  debitBalance: number;
  creditBalance: number;
}

export interface GeneralLedgerReport {
  accountCode: string;
  accountName: string;
  period: {
    from: Date;
    to: Date;
  };
  
  beginningBalance: {
    debit: number;
    credit: number;
  };

  entries: LedgerEntry[];

  totals: {
    totalDebit: number;
    totalCredit: number;
  };

  endingBalance: {
    debit: number;
    credit: number;
  };
}

// ============ Bảng cân đối số phát sinh ============

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  level: 1 | 2 | 3 | 4;
  beginningDebit: number;
  beginningCredit: number;
  movementDebit: number;
  movementCredit: number;
  endingDebit: number;
  endingCredit: number;
}

export interface TrialBalanceReport {
  asOfDate: Date;
  accountLevel: number;
  generatedAt: Date;

  rows: TrialBalanceRow[];

  totals: {
    beginningDebitTotal: number;
    beginningCreditTotal: number;
    movementDebitTotal: number;
    movementCreditTotal: number;
    endingDebitTotal: number;
    endingCreditTotal: number;
  };

  validation: {
    isBeginningBalanced: boolean;
    isMovementBalanced: boolean;
    isEndingBalanced: boolean;
  };
}

// ============ Favorite & Recent ============

export interface FavoriteReport {
  reportId: string;
  position: number;
  addedAt: Date;
}

export interface RecentReport {
  reportId: string;
  viewedAt: Date;
  viewCount: number;
}

// ============ Deadline ============

export interface DeadlineItem {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  urgency: 'low' | 'medium' | 'high';
  type: 'tax' | 'insurance' | 'financial' | 'other';
  completed: boolean;
}

// ============ Export Options ============

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  sheetName?: string;
  includeHeader?: boolean;
  dateFormat?: string;
  currencyFormat?: string;
}

export interface EmailReportOptions {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachment: 'pdf' | 'excel' | 'both';
  schedule?: {
    frequency: 'once' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}
