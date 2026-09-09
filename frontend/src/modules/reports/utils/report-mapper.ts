import { FinancialStatement } from "@/features/accounting/types";
import { BalanceSheetReport, BalanceSheetItem, IncomeStatementReport, CashFlowReport } from "../types";

export function mapToBalanceSheetReport(statement: FinancialStatement, asOfDate: string): BalanceSheetReport {
  const currentAssets: BalanceSheetItem[] = [];
  const fixedAssets: BalanceSheetItem[] = [];
  const liabilities: BalanceSheetItem[] = [];
  const equity: BalanceSheetItem[] = [];

  let totalCurrentAssets = 0;
  let totalFixedAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  for (const row of statement.rows) {
    const item: BalanceSheetItem = {
      code: row.accountCode,
      name: row.accountName,
      level: row.accountCode.length <= 3 ? 1 : 2,
      currentPeriod: row.balance,
      previousPeriod: 0,
      difference: row.balance
    };

    if (row.accountCode.startsWith('1')) {
      currentAssets.push(item);
      totalCurrentAssets += row.balance;
    } else if (row.accountCode.startsWith('2')) {
      fixedAssets.push(item);
      totalFixedAssets += row.balance;
    } else if (row.accountCode.startsWith('3')) {
      liabilities.push(item);
      totalLiabilities += Math.abs(row.balance);
      item.currentPeriod = Math.abs(row.balance);
      item.difference = Math.abs(row.balance);
    } else if (row.accountCode.startsWith('4')) {
      equity.push(item);
      totalEquity += Math.abs(row.balance);
      item.currentPeriod = Math.abs(row.balance);
      item.difference = Math.abs(row.balance);
    }
  }

  const totalAssets = totalCurrentAssets + totalFixedAssets;
  const totalLiabilitiesEquity = totalLiabilities + totalEquity;

  return {
    id: 'BS-' + Date.now(),
    reportCode: 'B01-DN',
    generatedAt: new Date(),
    asOfDate: new Date(asOfDate),
    format: 'TT200' as any,
    currencyUnit: 'VND' as any,
    assets: {
      currentAssets,
      fixedAssets,
      totalAssets
    },
    liabilitiesEquity: {
      liabilities,
      equity,
      total: totalLiabilitiesEquity
    },
    isBalanced: totalAssets === totalLiabilitiesEquity,
    balanceError: Math.abs(totalAssets - totalLiabilitiesEquity)
  };
}

export function mapToIncomeStatementReport(statement: FinancialStatement, fromDate: string, toDate: string): IncomeStatementReport {
  let grossRevenue = 0;
  let revenueReductions = 0;
  let cogs = 0;
  let financialIncome = 0;
  let financialExpense = 0;
  let sellingExpense = 0;
  let adminExpense = 0;
  let otherIncome = 0;
  let otherExpense = 0;
  let incomeTax = 0;

  for (const row of statement.rows) {
    const bal = Math.abs(row.balance);
    if (row.accountCode.startsWith('511')) grossRevenue += bal;
    else if (row.accountCode.startsWith('521')) revenueReductions += bal;
    else if (row.accountCode.startsWith('632')) cogs += bal;
    else if (row.accountCode.startsWith('515')) financialIncome += bal;
    else if (row.accountCode.startsWith('635')) financialExpense += bal;
    else if (row.accountCode.startsWith('641')) sellingExpense += bal;
    else if (row.accountCode.startsWith('642')) adminExpense += bal;
    else if (row.accountCode.startsWith('711')) otherIncome += bal;
    else if (row.accountCode.startsWith('811')) otherExpense += bal;
    else if (row.accountCode.startsWith('821')) incomeTax += bal;
  }

  const netRevenue = grossRevenue - revenueReductions;
  const grossProfit = netRevenue - cogs;
  const operatingProfit = grossProfit + financialIncome - financialExpense - sellingExpense - adminExpense;
  const otherProfit = otherIncome - otherExpense;
  const profitBeforeTax = operatingProfit + otherProfit;
  const netProfit = profitBeforeTax - incomeTax;

  const createItem = (code: string, name: string, val: number) => ({ code, name, currentValue: val, previousValue: 0, difference: val });

  return {
    id: 'IS-' + Date.now(),
    reportCode: 'B02-DN',
    generatedAt: new Date(),
    period: { from: new Date(fromDate), to: new Date(toDate) },
    currencyUnit: 'VND' as any,
    sections: {
      revenue: {
        grossRevenue: createItem('01', 'Doanh thu bán hàng và cung cấp dịch vụ', grossRevenue),
        revenueReductions: createItem('02', 'Các khoản giảm trừ doanh thu', revenueReductions),
        netRevenue: createItem('10', 'Doanh thu thuần', netRevenue)
      },
      grossProfit: {
        costOfGoodsSold: createItem('11', 'Giá vốn hàng bán', cogs),
        grossProfitValue: createItem('20', 'Lợi nhuận gộp', grossProfit)
      },
      operatingProfit: {
        financialIncome: createItem('21', 'Doanh thu hoạt động tài chính', financialIncome),
        financialExpense: createItem('22', 'Chi phí tài chính', financialExpense),
        sellingExpense: createItem('25', 'Chi phí bán hàng', sellingExpense),
        administrativeExpense: createItem('26', 'Chi phí QLDN', adminExpense),
        operatingProfitValue: createItem('30', 'Lợi nhuận thuần từ HĐKD', operatingProfit)
      },
      netProfit: {
        otherIncome: createItem('31', 'Thu nhập khác', otherIncome),
        otherExpense: createItem('32', 'Chi phí khác', otherExpense),
        profitBeforeTax: createItem('50', 'Tổng lợi nhuận kế toán trước thuế', profitBeforeTax),
        incomeTax: createItem('51', 'Chi phí thuế TNDN', incomeTax),
        netProfitValue: createItem('60', 'Lợi nhuận sau thuế', netProfit)
      }
    }
  };
}

export function mapToCashFlowReport(statement: FinancialStatement, fromDate: string, toDate: string): CashFlowReport {
  let cashIn = 0;
  let cashOut = 0;

  for (const row of statement.rows) {
    if (row.accountCode.startsWith('111') || row.accountCode.startsWith('112')) {
      cashIn += row.debitAmount;
      cashOut += row.creditAmount;
    }
  }

  return {
    id: 'CF-' + Date.now(),
    reportCode: 'B03-DN',
    generatedAt: new Date(),
    period: { from: new Date(fromDate), to: new Date(toDate) },
    method: 'direct' as any,
    currencyUnit: 'VND' as any,
    sections: {
      operatingActivities: [
        { code: '01', name: 'Tiền thu từ bán hàng, cung cấp dịch vụ và doanh thu khác', value: cashIn },
        { code: '02', name: 'Tiền chi trả cho người cung cấp hàng hóa và dịch vụ', value: -cashOut },
      ],
      investingActivities: [],
      financingActivities: []
    },
    summary: {
      netCashFlowPeriod: cashIn - cashOut,
      beginningBalance: 0,
      endingBalance: cashIn - cashOut
    }
  };
}

export function mapToGeneralLedgerReport(response: any): any {
  if (!response) return null;
  const isDebitBalance = response.accountCode?.startsWith('1') || response.accountCode?.startsWith('2');
  
  // Calculate beginning balance (always positive, place in debit or credit based on account type)
  const begBal = Math.abs(response.openingBalance || 0);
  let begDebit = 0;
  let begCredit = 0;
  if (response.openingBalance > 0) begDebit = begBal;
  else if (response.openingBalance < 0) begCredit = begBal;
  else {
    if (isDebitBalance) begDebit = begBal;
    else begCredit = begBal;
  }

  // Map entries
  let totalDebit = 0;
  let totalCredit = 0;
  
  const entries = (response.lines || []).map((line: any) => {
    totalDebit += line.debitAmount || 0;
    totalCredit += line.creditAmount || 0;
    return {
      date: line.date,
      voucherNo: line.entryCode || String(line.entryId),
      voucherDate: line.date,
      description: line.description,
      counterAccount: line.counterAccountCode,
      debit: line.debitAmount,
      credit: line.creditAmount,
      debitBalance: isDebitBalance ? line.balance : 0,
      creditBalance: !isDebitBalance ? line.balance : 0
    };
  });

  // Calculate ending balance
  const endBal = Math.abs(response.closingBalance || 0);
  let endDebit = 0;
  let endCredit = 0;
  if (response.closingBalance > 0) endDebit = endBal;
  else if (response.closingBalance < 0) endCredit = endBal;
  else {
    if (isDebitBalance) endDebit = endBal;
    else endCredit = endBal;
  }

  return {
    accountCode: response.accountCode,
    accountName: response.accountName,
    period: { from: response.fromDate, to: response.toDate },
    beginningBalance: { debit: begDebit, credit: begCredit },
    entries,
    totals: { totalDebit, totalCredit },
    endingBalance: { debit: endDebit, credit: endCredit }
  };
}
