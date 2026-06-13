import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  BalanceSheetResponseDto,
  BalanceSheetFormat,
  IncomeStatementResponseDto,
  CashFlowResponseDto,
  CashFlowMethod,
  BalanceSheetItem,
  IncomeStatementItem,
} from '../dto/financial.dto';
import { GeneralLedgerDataService } from '../../common/services/general-ledger-data.service';
import { CurrencyUnit } from '../../common/dto/common.dto';

/**
 * Service tính toán các báo cáo tài chính chính
 * B01-DN: Bảng cân đối kế toán (Balance Sheet)
 * B02-DN: Báo cáo kết quả HĐKD (Income Statement)
 * B03-DN: Báo cáo LCTT (Cash Flow Statement)
 */
@Injectable()
export class FinancialReportService {
  constructor(
    private dataSource: DataSource,
    private glDataService: GeneralLedgerDataService,
  ) {}

  /**
   * B01-DN: Bảng cân đối kế toán (Balance Sheet)
   * Theo chuẩn Thông tư 200
   */
  async getBalanceSheet(
    asOfDate: Date,
    comparePeriod?: Date,
    format: BalanceSheetFormat = BalanceSheetFormat.TT200,
    currencyUnit: CurrencyUnit = CurrencyUnit.VND,
  ): Promise<BalanceSheetResponseDto> {
    const asOfDateStr = asOfDate.toISOString().split('T')[0];
    const compareDateStr = comparePeriod
      ? comparePeriod.toISOString().split('T')[0]
      : null;

    // ============ ASSETS ============
    // A. Current Assets (TK 1xxx)
    const currentAssets = await this.getBalanceSheetSection(
      '100',
      asOfDateStr,
      compareDateStr,
      currencyUnit,
    );

    // B. Fixed Assets (TK 2xxx)
    const fixedAssets = await this.getBalanceSheetSection(
      '200',
      asOfDateStr,
      compareDateStr,
      currencyUnit,
    );

    const totalAssets =
      (currentAssets.reduce((sum, item) => sum + item.currentPeriod, 0) || 0) +
      (fixedAssets.reduce((sum, item) => sum + item.currentPeriod, 0) || 0);

    // ============ LIABILITIES & EQUITY ============
    // C. Current Liabilities (TK 3xxx)
    const currentLiabilities = await this.getBalanceSheetSection(
      '300',
      asOfDateStr,
      compareDateStr,
      currencyUnit,
    );

    // D. Long-term Liabilities (TK 4xxx excluding 410-430)
    const longTermLiabilities = await this.getBalanceSheetSection(
      '330',
      asOfDateStr,
      compareDateStr,
      currencyUnit,
    );

    // E. Equity (TK 410-430)
    const equity = await this.getBalanceSheetSection(
      '400',
      asOfDateStr,
      compareDateStr,
      currencyUnit,
    );

    const totalLiabilitiesEquity =
      (currentLiabilities.reduce((sum, item) => sum + item.currentPeriod, 0) ||
        0) +
      (longTermLiabilities.reduce((sum, item) => sum + item.currentPeriod, 0) ||
        0) +
      (equity.reduce((sum, item) => sum + item.currentPeriod, 0) || 0);

    // ============ VALIDATION ============
    const balanceError = Math.abs(totalAssets - totalLiabilitiesEquity);
    const isBalanced = balanceError < 1; // cho phép sai số < 1 đơn vị tiền

    return {
      id: `B01-${asOfDateStr}`,
      reportCode: 'B01-DN',
      generatedAt: new Date(),
      asOfDate,
      format,
      currencyUnit,
      assets: {
        currentAssets,
        fixedAssets,
        totalAssets,
      },
      liabilitiesEquity: {
        currentLiabilities,
        longTermLiabilities,
        equity,
        totalLiabilitiesEquity,
      },
      isBalanced,
      balanceError: !isBalanced ? balanceError : undefined,
      notes: !isBalanced
        ? `Báo cáo không cân. Chênh lệch: ${balanceError.toLocaleString('vi-VN')}`
        : undefined,
    };
  }

  /**
   * B02-DN: Báo cáo kết quả kinh doanh (Income Statement)
   * Theo chuẩn Thông tư 200
   */
  async getIncomeStatement(
    fromDate: Date,
    toDate: Date,
    compareFromDate?: Date,
    compareToDate?: Date,
    currencyUnit: CurrencyUnit = CurrencyUnit.VND,
  ): Promise<IncomeStatementResponseDto> {
    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = toDate.toISOString().split('T')[0];

    // Helper: lấy giá trị của TK trong kỳ
    const getAccountValue = async (
      accountCodes: string[],
      from: Date,
      to: Date,
      type: 'debit' | 'credit',
    ): Promise<number> => {
      const query = `
        SELECT COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0 END), 0) as total
        FROM gl_movements
        WHERE account_code IN (${accountCodes.map(() => '?').join(',')})
          AND date BETWEEN ? AND ?
      `;

      const result = await this.dataSource.query(query, [
        type.toUpperCase(),
        ...accountCodes,
        from,
        to,
      ]);

      return result[0]?.total || 0;
    };

    // ============ SECTION 1: REVENUE ============
    const grossRevenue = new IncomeStatementItem();
    grossRevenue.code = '01';
    grossRevenue.name = 'Doanh thu bán hàng và cung cấp dịch vụ';
    grossRevenue.currentValue = await getAccountValue(['511', '512'], fromDate, toDate, 'credit');

    const revenueReductions = new IncomeStatementItem();
    revenueReductions.code = '02';
    revenueReductions.name = 'Các khoản giảm trừ doanh thu';
    revenueReductions.currentValue = await getAccountValue(['521'], fromDate, toDate, 'debit');

    const netRevenue = new IncomeStatementItem();
    netRevenue.code = '10';
    netRevenue.name = 'Doanh thu thuần';
    netRevenue.currentValue = grossRevenue.currentValue - revenueReductions.currentValue;
    netRevenue.isTotalRow = true;

    // ============ SECTION 2: GROSS PROFIT ============
    const costOfGoodsSold = new IncomeStatementItem();
    costOfGoodsSold.code = '11';
    costOfGoodsSold.name = 'Giá vốn hàng bán';
    costOfGoodsSold.currentValue = await getAccountValue(['632'], fromDate, toDate, 'debit');

    const grossProfitValue = new IncomeStatementItem();
    grossProfitValue.code = '20';
    grossProfitValue.name = 'Lợi nhuận gộp';
    grossProfitValue.currentValue = netRevenue.currentValue - costOfGoodsSold.currentValue;
    grossProfitValue.isTotalRow = true;

    // ============ SECTION 3: OPERATING PROFIT ============
    const financialIncome = new IncomeStatementItem();
    financialIncome.code = '21';
    financialIncome.name = 'Doanh thu hoạt động tài chính';
    financialIncome.currentValue = await getAccountValue(['515'], fromDate, toDate, 'credit');

    const financialExpense = new IncomeStatementItem();
    financialExpense.code = '22';
    financialExpense.name = 'Chi phí tài chính';
    financialExpense.currentValue = await getAccountValue(['635'], fromDate, toDate, 'debit');

    const sellingExpense = new IncomeStatementItem();
    sellingExpense.code = '25';
    sellingExpense.name = 'Chi phí bán hàng';
    sellingExpense.currentValue = await getAccountValue(['641'], fromDate, toDate, 'debit');

    const administrativeExpense = new IncomeStatementItem();
    administrativeExpense.code = '26';
    administrativeExpense.name = 'Chi phí quản lý doanh nghiệp';
    administrativeExpense.currentValue = await getAccountValue(['642'], fromDate, toDate, 'debit');

    const operatingProfitValue = new IncomeStatementItem();
    operatingProfitValue.code = '30';
    operatingProfitValue.name = 'Lợi nhuận thuần từ hoạt động kinh doanh';
    operatingProfitValue.currentValue =
      grossProfitValue.currentValue +
      financialIncome.currentValue -
      financialExpense.currentValue -
      sellingExpense.currentValue -
      administrativeExpense.currentValue;
    operatingProfitValue.isTotalRow = true;

    // ============ SECTION 4: NET PROFIT ============
    const otherIncome = new IncomeStatementItem();
    otherIncome.code = '31';
    otherIncome.name = 'Thu nhập khác';
    otherIncome.currentValue = await getAccountValue(['711'], fromDate, toDate, 'credit');

    const otherExpense = new IncomeStatementItem();
    otherExpense.code = '32';
    otherExpense.name = 'Chi phí khác';
    otherExpense.currentValue = await getAccountValue(['811'], fromDate, toDate, 'debit');

    const profitBeforeTax = new IncomeStatementItem();
    profitBeforeTax.code = '50';
    profitBeforeTax.name = 'Tổng lợi nhuận kế toán trước thuế';
    profitBeforeTax.currentValue =
      operatingProfitValue.currentValue +
      otherIncome.currentValue -
      otherExpense.currentValue;
    profitBeforeTax.isTotalRow = true;

    const incomeTax = new IncomeStatementItem();
    incomeTax.code = '51-52';
    incomeTax.name = 'Chi phí thuế TNDN';
    incomeTax.currentValue =
      (await getAccountValue(['8211'], fromDate, toDate, 'debit')) +
      (await getAccountValue(['8212'], fromDate, toDate, 'debit'));

    const netProfitValue = new IncomeStatementItem();
    netProfitValue.code = '60';
    netProfitValue.name = 'Lợi nhuận sau thuế TNDN';
    netProfitValue.currentValue = profitBeforeTax.currentValue - incomeTax.currentValue;
    netProfitValue.isTotalRow = true;

    // ============ METRICS ============
    const metrics = {
      grossProfitMargin: (grossProfitValue.currentValue / netRevenue.currentValue) * 100 || 0,
      operatingMargin: (operatingProfitValue.currentValue / netRevenue.currentValue) * 100 || 0,
      netProfitMargin: (netProfitValue.currentValue / netRevenue.currentValue) * 100 || 0,
    };

    return {
      id: `B02-${fromStr}-${toStr}`,
      reportCode: 'B02-DN',
      generatedAt: new Date(),
      period: { from: fromDate, to: toDate },
      comparePeriod: compareFromDate
        ? { from: compareFromDate, to: compareToDate }
        : undefined,
      currencyUnit,
      sections: {
        revenue: {
          grossRevenue,
          revenueReductions,
          netRevenue,
        },
        grossProfit: {
          costOfGoodsSold,
          grossProfitValue,
        },
        operatingProfit: {
          financialIncome,
          financialExpense,
          sellingExpense,
          administrativeExpense,
          operatingProfitValue,
        },
        netProfit: {
          otherIncome,
          otherExpense,
          profitBeforeTax,
          incomeTax,
          netProfitValue,
        },
      },
      metrics,
    };
  }

  /**
   * B03-DN: Báo cáo lưu chuyển tiền tệ (Cash Flow Statement)
   * Phương pháp Trực tiếp (Direct Method)
   */
  async getCashFlow(
    fromDate: Date,
    toDate: Date,
    method: CashFlowMethod = CashFlowMethod.DIRECT,
    currencyUnit: CurrencyUnit = CurrencyUnit.VND,
  ): Promise<CashFlowResponseDto> {
    // TODO: Implement detailed cash flow calculation
    // For now, return basic structure

    return {
      id: `B03-${fromDate.toISOString().split('T')[0]}`,
      reportCode: 'B03-DN',
      generatedAt: new Date(),
      period: { from: fromDate, to: toDate },
      method,
      currencyUnit,
      sections: {
        operatingActivities: [],
        investingActivities: [],
        financingActivities: [],
      },
      summary: {
        netCashFlowPeriod: 0,
        beginningBalance: 0,
        endingBalance: 0,
      },
    };
  }

  /**
   * Helper: Lấy phần của Bảng cân đối (Assets/Liabilities/Equity)
   */
  private async getBalanceSheetSection(
    sectionCode: string,
    asOfDate: string,
    compareDateStr?: string | null,
    currencyUnit?: CurrencyUnit,
  ): Promise<BalanceSheetItem[]> {
    // TODO: Query database based on section code and chart of accounts
    // This is a placeholder
    return [];
  }
}
