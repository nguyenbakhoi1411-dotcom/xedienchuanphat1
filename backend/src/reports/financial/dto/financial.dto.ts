import { IsDateString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { PeriodSelectorDto, CurrencyUnit, ComparisonType } from '../common/dto/common.dto';

// ============ Balance Sheet (B01-DN) ============

export enum BalanceSheetFormat {
  TT200 = 'TT200',
  TT133 = 'TT133',
}

export interface BalanceSheetItem {
  code: string;
  name: string;
  level: 1 | 2 | 3;                    // 1=Main group, 2=Subgroup, 3=Detail
  accounts: string[];                  // GL accounts to sum
  currentPeriod: number;
  previousPeriod: number;
  difference?: number;
  note?: string;
}

export class BalanceSheetDto {
  @IsDateString()
  asOfDate: string;

  @IsDateString()
  comparePeriod?: string;

  @IsEnum(CurrencyUnit)
  @IsOptional()
  currencyUnit?: CurrencyUnit;

  @IsEnum(BalanceSheetFormat)
  format?: BalanceSheetFormat;
}

export class BalanceSheetResponseDto {
  id: string;
  reportCode: 'B01-DN' | 'B01a-DNN' | 'B01b-DNN';
  generatedAt: Date;
  asOfDate: Date;
  format: BalanceSheetFormat;
  currencyUnit: CurrencyUnit;
  
  // Assets section
  assets: {
    currentAssets: BalanceSheetItem[];
    fixedAssets: BalanceSheetItem[];
    totalAssets: number;
  };

  // Liabilities & Equity section
  liabilitiesEquity: {
    currentLiabilities: BalanceSheetItem[];
    longTermLiabilities: BalanceSheetItem[];
    equity: BalanceSheetItem[];
    totalLiabilitiesEquity: number;
  };

  // Validation
  isBalanced: boolean;
  balanceError?: number;
  notes?: string;
}

// ============ Income Statement (B02-DN) ============

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

export class IncomeStatementDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsDateString()
  @IsOptional()
  compareFrom?: string;

  @IsDateString()
  @IsOptional()
  compareTo?: string;

  @IsEnum(CurrencyUnit)
  @IsOptional()
  currencyUnit?: CurrencyUnit;
}

export class IncomeStatementResponseDto {
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
    // Revenue section
    revenue: {
      grossRevenue: IncomeStatementItem;
      revenueReductions: IncomeStatementItem;
      netRevenue: IncomeStatementItem;
    };

    // Gross profit section
    grossProfit: {
      costOfGoodsSold: IncomeStatementItem;
      grossProfitValue: IncomeStatementItem;
    };

    // Operating profit section
    operatingProfit: {
      financialIncome: IncomeStatementItem;
      financialExpense: IncomeStatementItem;
      sellingExpense: IncomeStatementItem;
      administrativeExpense: IncomeStatementItem;
      operatingProfitValue: IncomeStatementItem;
    };

    // Net profit section
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

// ============ Cash Flow Statement (B03-DN) ============

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

export class CashFlowDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsEnum(CashFlowMethod)
  method?: CashFlowMethod;

  @IsEnum(CurrencyUnit)
  @IsOptional()
  currencyUnit?: CurrencyUnit;
}

export class CashFlowResponseDto {
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

  // Validation: ending balance = system GL account balance
  isReconciled?: boolean;
  reconciliationError?: number;
}

// ============ General Ledger (Sổ cái) ============

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

export class GeneralLedgerDto {
  @IsOptional()
  @Min(3)
  accountCode?: string;

  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  showAllMovements?: boolean;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class GeneralLedgerResponseDto {
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

// ============ Trial Balance (Bảng cân đối số phát sinh) ============

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  level: 1 | 2 | 3 | 4;
  beginningDebit: number;
  beginningCredit: number;
  movementDebit: number;
  movementCredit: number;
  movementDebitTotal: number;
  movementCreditTotal: number;
  endingDebit: number;
  endingCredit: number;
}

export class TrialBalanceDto {
  @IsDateString()
  asOf: string;

  @IsOptional()
  @Min(1)
  @Min(4)
  accountLevel?: number;

  @IsOptional()
  showZeroBalance?: boolean;
}

export class TrialBalanceResponseDto {
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

// ============ Journal (Nhật ký chung) ============

export interface JournalEntry {
  date: Date;
  voucherNo: string;
  description: string;
  entries: Array<{
    accountCode: string;
    accountName: string;
    debit?: number;
    credit?: number;
    description: string;
  }>;
  totalDebit: number;
  totalCredit: number;
}

export class GeneralJournalDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  voucherType?: string;

  @IsOptional()
  accountCode?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class GeneralJournalResponseDto {
  period: {
    from: Date;
    to: Date;
  };

  entries: JournalEntry[];

  totals: {
    totalEntries: number;
    totalDebit: number;
    totalCredit: number;
  };
}
