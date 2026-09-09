import { api } from "@/lib/api/axios";
import type {
  AccountingFilters,
  BankAccountOption,
  AccountingOverview,
  ChartOfAccount,
  CashFlowReport,
  CreateExpensePayload,
  CreateFixedAssetPayload,
  CreatePaymentPayload,
  CreateReceiptPayload,
  CreateTaxInvoicePayload,
  DebtAgingRow,
  DebtFilters,
  DebtRow,
  DepreciationRunResult,
  Expense,
  FinancialStatement,
  FixedAsset,
  JournalEntry,
  PageResponse,
  PaymentVoucher,
  ProfitLossReport,
  ReceiptVoucher,
  TaxInvoice,
  VatReport,
  OpeningBalanceRow,
  OpeningBalanceLockPayload
} from "./types";

export const accountingApi = {
  async overview(): Promise<AccountingOverview> {
    const toDate = new Date().toISOString().slice(0, 10);
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [cashFlowResponse, profitLossResponse, debtsResponse, bankAccountsResponse] = await Promise.all([
      api.get<CashFlowReport>("/api/accounting/reports/cash-flow", { params: { fromDate, toDate } }),
      api.get<ProfitLossReport>("/api/accounting/reports/profit-loss", { params: { fromDate, toDate } }),
      api.get<PageResponse<DebtRow>>("/api/accounting/debts", { params: { page: 0, pageSize: 200 } }),
      api.get<BankAccountOption[]>("/api/accounting/bank-accounts")
    ]);
    const receivable = debtsResponse.data.items.filter((item) => item.partyType === "CUSTOMER").reduce((sum, item) => sum + Number(item.endingBalance), 0);
    const payable = debtsResponse.data.items.filter((item) => item.partyType === "SUPPLIER").reduce((sum, item) => sum + Number(item.endingBalance), 0);
    const profitLoss = normalizeProfitLoss(profitLossResponse.data);
    const cashFlow = normalizeCashFlow(cashFlowResponse.data);
    return {
      kpis: { revenue: profitLoss.revenue, grossProfit: profitLoss.grossProfit, netProfit: profitLoss.netProfit, cashBalance: 0, bankBalance: 0, receivable, payable, cashIn: cashFlow.cashIn, cashOut: cashFlow.cashOut },
      profitLoss,
      cashFlow,
      cashFunds: [],
      bankAccounts: bankAccountsResponse.data.map((item) => ({ id: item.id, bankName: item.bankName, accountNumber: item.accountNumber, balance: Number(item.currentBalance ?? item.balance ?? 0) }))
    };
  },

  async cashFlow(fromDate: string, toDate: string): Promise<CashFlowReport> {
    const response = await api.get<CashFlowReport>("/api/accounting/reports/cash-flow", { params: { fromDate, toDate } });
    return normalizeCashFlow(response.data);
  },

  async cashFlowLedger(fromDate: string, toDate: string): Promise<FinancialStatement> {
    const response = await api.get<FinancialStatement>("/api/accounting/reports/cash-flow-ledger", { params: { fromDate, toDate } });
    return normalizeStatement(response.data);
  },

  async receipts(params: AccountingFilters): Promise<PageResponse<ReceiptVoucher>> {
    const response = await api.get<PageResponse<ReceiptVoucher>>("/api/accounting/receipts", { params: { page: Math.max(params.page - 1, 0), pageSize: params.pageSize } });
    return { ...response.data, page: response.data.page + 1, items: response.data.items.map((item) => ({ ...item, amount: Number(item.amount), customerName: item.customerName || "", status: item.status ?? "POSTED" })) };
  },

  async payments(params: AccountingFilters): Promise<PageResponse<PaymentVoucher>> {
    const response = await api.get<PageResponse<PaymentVoucher>>("/api/accounting/payments", { params: { page: Math.max(params.page - 1, 0), pageSize: params.pageSize } });
    return { ...response.data, page: response.data.page + 1, items: response.data.items.map((item) => ({ ...item, amount: Number(item.amount), supplierName: item.supplierName || "", status: item.status ?? "POSTED" })) };
  },

  async debts(params: DebtFilters): Promise<PageResponse<DebtRow>> {
    const response = await api.get<PageResponse<DebtRow>>("/api/accounting/debts", { params: { partyType: params.partyType === "ALL" ? undefined : params.partyType, page: Math.max(params.page - 1, 0), pageSize: params.pageSize } });
    const keyword = params.keyword.trim().toLowerCase();
    const items = response.data.items.map((item) => ({ ...item, openingBalance: Number(item.openingBalance), debitAmount: Number(item.debitAmount), creditAmount: Number(item.creditAmount), endingBalance: Number(item.endingBalance), phone: item.phone ?? "" })).filter((item) => !keyword || item.partyName.toLowerCase().includes(keyword) || item.phone.includes(keyword));
    return { ...response.data, page: response.data.page + 1, items };
  },

  async accounts(): Promise<PageResponse<ChartOfAccount>> {
    const response = await api.get<PageResponse<ChartOfAccount>>("/api/accounting/accounts", { params: { active: true, page: 0, pageSize: 200 } });
    return { ...response.data, page: response.data.page + 1, items: response.data.items.map((item) => ({ ...item, active: Boolean(item.active) })) };
  },

  async journalEntries(): Promise<PageResponse<JournalEntry>> {
    const response = await api.get<PageResponse<JournalEntry>>("/api/accounting/journal-entries", { params: { page: 0, pageSize: 50 } });
    return { ...response.data, page: response.data.page + 1, items: response.data.items.map((item) => ({ ...item, totalDebit: Number(item.totalDebit), totalCredit: Number(item.totalCredit), lines: item.lines.map((line) => ({ ...line, debitAmount: Number(line.debitAmount), creditAmount: Number(line.creditAmount) })) })) };
  },

  async trialBalance(fromDate: string, toDate: string): Promise<FinancialStatement> {
    const response = await api.get<FinancialStatement>("/api/accounting/reports/trial-balance", { params: { fromDate, toDate } });
    return normalizeStatement(response.data);
  },

  async balanceSheet(fromDate: string, toDate: string): Promise<FinancialStatement> {
    const response = await api.get<FinancialStatement>("/api/accounting/reports/balance-sheet", { params: { fromDate, toDate } });
    return normalizeStatement(response.data);
  },

  async incomeStatement(fromDate: string, toDate: string): Promise<FinancialStatement> {
    const response = await api.get<FinancialStatement>("/api/accounting/reports/income-statement", { params: { fromDate, toDate } });
    return normalizeStatement(response.data);
  },

  async generalLedger(accountCode: string, fromDate: string, toDate: string, branchId?: number): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/general-ledger", { params: { accountCode, fromDate, toDate, branchId } });
    return response.data;
  },

  async customerDebtAging(): Promise<DebtAgingRow[]> {
    const response = await api.get<DebtAgingRow[]>("/api/accounting/reports/customer-debt-aging");
    return response.data.map(normalizeAgingRow);
  },

  async supplierDebtAging(): Promise<DebtAgingRow[]> {
    const response = await api.get<DebtAgingRow[]>("/api/accounting/reports/supplier-debt-aging");
    return response.data.map(normalizeAgingRow);
  },

  async createReceipt(payload: CreateReceiptPayload): Promise<ReceiptVoucher> {
    const response = await api.post<{ sourceNo: string; paidAmount: number }>("/api/accounting/receipts", { ...payload, bankAccountId: payload.paymentMethod === "BANK_TRANSFER" ? payload.bankAccountId : undefined });
    return { ...payload, id: Date.now(), voucherNo: response.data.sourceNo, amount: Number(response.data.paidAmount), status: "POSTED" };
  },

  async createPayment(payload: CreatePaymentPayload): Promise<PaymentVoucher> {
    const response = await api.post<{ sourceNo: string; paidAmount: number }>("/api/accounting/payments", { ...payload, bankAccountId: payload.paymentMethod === "BANK_TRANSFER" ? payload.bankAccountId : undefined });
    return { ...payload, id: Date.now(), voucherNo: response.data.sourceNo, amount: Number(response.data.paidAmount), status: "POSTED" };
  },

  async bankAccounts(): Promise<BankAccountOption[]> {
    const response = await api.get<BankAccountOption[]>("/api/accounting/bank-accounts");
    return response.data;
  },

  // ── Tax Invoices ──

  async outputInvoices(branchId?: number, status?: string, page = 0, pageSize = 20): Promise<PageResponse<TaxInvoice>> {
    const response = await api.get<PageResponse<TaxInvoice>>("/api/accounting/tax-invoices/output", { params: { branchId, status, page, pageSize } });
    return { ...response.data, items: response.data.items.map(normalizeTaxInvoice) };
  },

  async inputInvoices(branchId?: number, status?: string, page = 0, pageSize = 20): Promise<PageResponse<TaxInvoice>> {
    const response = await api.get<PageResponse<TaxInvoice>>("/api/accounting/tax-invoices/input", { params: { branchId, status, page, pageSize } });
    return { ...response.data, items: response.data.items.map(normalizeTaxInvoice) };
  },

  async createOutputInvoice(payload: CreateTaxInvoicePayload): Promise<TaxInvoice> {
    const response = await api.post<TaxInvoice>("/api/accounting/tax-invoices/output", payload);
    return normalizeTaxInvoice(response.data);
  },

  async createInputInvoice(payload: CreateTaxInvoicePayload): Promise<TaxInvoice> {
    const response = await api.post<TaxInvoice>("/api/accounting/tax-invoices/input", payload);
    return normalizeTaxInvoice(response.data);
  },

  async issueInvoice(id: number): Promise<TaxInvoice> {
    const response = await api.post<TaxInvoice>(`/api/accounting/tax-invoices/${id}/issue`);
    return normalizeTaxInvoice(response.data);
  },

  async cancelInvoice(id: number, reason: string): Promise<TaxInvoice> {
    const response = await api.post<TaxInvoice>(`/api/accounting/tax-invoices/${id}/cancel`, { reason });
    return normalizeTaxInvoice(response.data);
  },

  async vatReport(year: number, month: number, branchId?: number): Promise<VatReport> {
    const response = await api.get<VatReport>("/api/accounting/reports/vat-report", { params: { year, month, branchId } });
    return {
      ...response.data,
      outputTaxBase: Number(response.data.outputTaxBase),
      outputVatAmount: Number(response.data.outputVatAmount),
      inputTaxBase: Number(response.data.inputTaxBase),
      inputVatAmount: Number(response.data.inputVatAmount),
      vatPayable: Number(response.data.vatPayable),
      vatRefundable: Number(response.data.vatRefundable),
      outputInvoices: response.data.outputInvoices.map(normalizeTaxInvoice),
      inputInvoices: response.data.inputInvoices.map(normalizeTaxInvoice)
    };
  },

  // ── Expenses ──

  async expenses(branchId?: number, category?: string, page = 0, pageSize = 20): Promise<PageResponse<Expense>> {
    const response = await api.get<PageResponse<Expense>>("/api/accounting/expenses", { params: { branchId, category, page, pageSize } });
    return { ...response.data, items: response.data.items.map((e) => ({ ...e, amount: Number(e.amount) })) };
  },

  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    const response = await api.post<Expense>("/api/accounting/expenses", payload);
    return { ...response.data, amount: Number(response.data.amount) };
  },

  async postExpense(id: number): Promise<Expense> {
    const response = await api.post<Expense>(`/api/accounting/expenses/${id}/post`);
    return { ...response.data, amount: Number(response.data.amount) };
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/api/accounting/expenses/${id}`);
  },

  // ── Fixed Assets ──

  async fixedAssets(branchId?: number): Promise<FixedAsset[]> {
    const response = await api.get<FixedAsset[]>("/api/accounting/fixed-assets", { params: { branchId } });
    return response.data.map(normalizeFixedAsset);
  },

  async createFixedAsset(payload: CreateFixedAssetPayload): Promise<FixedAsset> {
    const response = await api.post<FixedAsset>("/api/accounting/fixed-assets", payload);
    return normalizeFixedAsset(response.data);
  },

  async runDepreciation(year: number, month: number): Promise<DepreciationRunResult> {
    const response = await api.post<DepreciationRunResult>("/api/accounting/fixed-assets/run-depreciation", null, { params: { year, month } });
    return { ...response.data, totalAmount: Number(response.data.totalAmount), lines: response.data.lines.map((l) => ({ ...l, amount: Number(l.amount) })) };
  },

  async disposeAsset(id: number, disposalAmount: number, note: string): Promise<FixedAsset> {
    const response = await api.post<FixedAsset>(`/api/accounting/fixed-assets/${id}/dispose`, { disposalAmount, note });
    return normalizeFixedAsset(response.data);
  },

  async getOpeningBalances(periodId: number, branchId?: number): Promise<OpeningBalanceRow[]> {
    const response = await api.get<OpeningBalanceRow[]>("/api/v1/accounting/opening-balances", {
      params: { periodId, branchId }
    });
    return response.data.map(normalizeOpeningBalance);
  },

  async bulkUpsertOpeningBalances(requests: OpeningBalanceRow[]): Promise<OpeningBalanceRow[]> {
    const response = await api.post<OpeningBalanceRow[]>("/api/v1/accounting/opening-balances", requests);
    return response.data.map(normalizeOpeningBalance);
  },

  async lockOpeningBalances(payload: OpeningBalanceLockPayload, branchId?: number): Promise<OpeningBalanceRow[]> {
    const response = await api.post<OpeningBalanceRow[]>("/api/v1/accounting/opening-balances/lock", payload, {
      params: { branchId }
    });
    return response.data.map(normalizeOpeningBalance);
  },

  // ── Cost Centers ──
  async costCenters(keyword: string, page = 0, size = 50): Promise<PageResponse<any>> {
    const response = await api.get<PageResponse<any>>("/api/accounting/cost-centers", { params: { keyword, page, size } });
    return response.data;
  },

  async createCostCenter(payload: { code: string; name: string; description?: string }): Promise<any> {
    const response = await api.post<any>("/api/accounting/cost-centers", payload);
    return response.data;
  },

  async deactivateCostCenter(id: number): Promise<any> {
    const response = await api.post<any>(`/api/accounting/cost-centers/${id}/deactivate`);
    return response.data;
  },

  // ── Recurring Journals ──
  async recurringJournals(keyword: string, page = 0, size = 50): Promise<PageResponse<any>> {
    const response = await api.get<PageResponse<any>>("/api/accounting/recurring-journals", { params: { keyword, page, size } });
    return response.data;
  },

  async createRecurringJournal(payload: any): Promise<any> {
    const response = await api.post<any>("/api/accounting/recurring-journals", payload);
    return response.data;
  },

  async runRecurringJournals(runDate: string): Promise<void> {
    await api.post(`/api/accounting/recurring-journals/run?runDate=${runDate}`);
  },

  // ── Reports: new endpoints ──

  async journalLedger(params: {
    fromDate: string;
    toDate: string;
    branchId?: number;
    accountCode?: string;
    referenceType?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PageResponse<JournalEntry>> {
    const response = await api.get<PageResponse<JournalEntry>>("/api/accounting/reports/journal-ledger", {
      params: { ...params, page: params.page ?? 0, pageSize: params.pageSize ?? 50 },
    });
    return {
      ...response.data,
      items: response.data.items.map((item) => ({
        ...item,
        totalDebit: Number(item.totalDebit),
        totalCredit: Number(item.totalCredit),
        lines: (item.lines ?? []).map((l) => ({
          ...l,
          debitAmount: Number(l.debitAmount),
          creditAmount: Number(l.creditAmount),
        })),
      })),
    };
  },

  async trialBalanceRaw(fromDate: string, toDate: string, branchId?: number): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/trial-balance", {
      params: { fromDate, toDate, branchId },
    });
    return response.data;
  },

  async balanceSheetRaw(fromDate: string, toDate: string): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/balance-sheet", {
      params: { fromDate, toDate },
    });
    return response.data;
  },

  async incomeStatementRaw(fromDate: string, toDate: string): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/income-statement", {
      params: { fromDate, toDate },
    });
    return response.data;
  },

  async profitLossRaw(fromDate: string, toDate: string): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/profit-loss", {
      params: { fromDate, toDate },
    });
    return response.data;
  },

  async cashFlowRaw(fromDate: string, toDate: string): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/cash-flow", {
      params: { fromDate, toDate },
    });
    return response.data;
  },

  async customerDebtAgingRaw(asOfDate?: string): Promise<any[]> {
    const response = await api.get<any[]>("/api/accounting/reports/customer-debt-aging", {
      params: { asOfDate },
    });
    return response.data;
  },

  async supplierDebtAgingRaw(asOfDate?: string): Promise<any[]> {
    const response = await api.get<any[]>("/api/accounting/reports/supplier-debt-aging", {
      params: { asOfDate },
    });
    return response.data;
  },

  async generalLedgerRaw(accountCode: string, fromDate: string, toDate: string, branchId?: number): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/general-ledger", {
      params: { accountCode, fromDate, toDate, branchId },
    });
    return response.data;
  },

  async detailDebtReceivable(customerId: number, fromDate: string, toDate: string): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/detail-debt/receivable", {
      params: { customerId, fromDate, toDate },
    });
    return response.data;
  },

  async detailDebtPayable(supplierId: number, fromDate: string, toDate: string): Promise<any> {
    const response = await api.get<any>("/api/accounting/reports/detail-debt/payable", {
      params: { supplierId, fromDate, toDate },
    });
    return response.data;
  },
};

// ── Normalizers ──

function normalizeOpeningBalance(b: OpeningBalanceRow): OpeningBalanceRow {
  return {
    ...b,
    debitBalance: Number(b.debitBalance),
    creditBalance: Number(b.creditBalance)
  };
}

function normalizeTaxInvoice(t: TaxInvoice): TaxInvoice {
  return { ...t, taxBaseAmount: Number(t.taxBaseAmount), vatRate: Number(t.vatRate), vatAmount: Number(t.vatAmount), totalAmount: Number(t.totalAmount) };
}

function normalizeFixedAsset(a: FixedAsset): FixedAsset {
  return { ...a, costAmount: Number(a.costAmount), residualValue: Number(a.residualValue), accumulatedDepreciation: Number(a.accumulatedDepreciation), bookValue: Number(a.bookValue) };
}

function normalizeProfitLoss(report: ProfitLossReport): ProfitLossReport {
  return { revenue: Number(report.revenue), costOfGoodsSold: Number(report.costOfGoodsSold), grossProfit: Number(report.grossProfit), expenses: Number(report.expenses), netProfit: Number(report.netProfit) };
}

function normalizeCashFlow(report: CashFlowReport): CashFlowReport {
  return { cashIn: Number(report.cashIn), cashOut: Number(report.cashOut), netCashFlow: Number(report.netCashFlow), series: report.series ?? [] };
}

function normalizeStatement(report: FinancialStatement): FinancialStatement {
  return { ...report, totalDebit: Number(report.totalDebit), totalCredit: Number(report.totalCredit), rows: report.rows.map((row) => ({ ...row, debitAmount: Number(row.debitAmount), creditAmount: Number(row.creditAmount), balance: Number(row.balance) })) };
}

function normalizeAgingRow(row: DebtAgingRow): DebtAgingRow {
  return { ...row, bucket0To30: Number(row.bucket0To30), bucket31To60: Number(row.bucket31To60), bucket61To90: Number(row.bucket61To90), bucketOver90: Number(row.bucketOver90), total: Number(row.total) };
}
