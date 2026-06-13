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
  VatReport
} from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

let receipts: ReceiptVoucher[] = [
  { id: 1, voucherNo: "PT-2026-001", receiptDate: "2026-06-01", customerName: "Nguyen Van A", amount: 50000000, paymentMethod: "BANK_TRANSFER", status: "POSTED", reason: "Thu tien don hang CP-S1" },
  { id: 2, voucherNo: "PT-2026-002", receiptDate: "2026-06-03", customerName: "Tran Thi B", amount: 9000000, paymentMethod: "CASH", status: "POSTED", reason: "Thu mot phan cong no" }
];

let payments: PaymentVoucher[] = [
  { id: 1, voucherNo: "PC-2026-001", paymentDate: "2026-06-02", supplierName: "NCC Phu Tung", amount: 18000000, paymentMethod: "BANK_TRANSFER", status: "POSTED", reason: "Thanh toan pin LFP" },
  { id: 2, voucherNo: "PC-2026-002", paymentDate: "2026-06-04", supplierName: "NCC Van Chuyen", amount: 2500000, paymentMethod: "CASH", status: "POSTED", reason: "Phi van chuyen" }
];

let debts: DebtRow[] = [
  { id: 1, partyType: "CUSTOMER", partyName: "Tran Thi B", phone: "0900000002", openingBalance: 0, debitAmount: 13900000, creditAmount: 9000000, endingBalance: 4000000 },
  { id: 2, partyType: "CUSTOMER", partyName: "Pham Quoc C", phone: "0900000003", openingBalance: 0, debitAmount: 6500000, creditAmount: 0, endingBalance: 6500000 },
  { id: 3, partyType: "SUPPLIER", partyName: "NCC Phu Tung", phone: "028000001", openingBalance: 0, debitAmount: 18000000, creditAmount: 42000000, endingBalance: 24000000 },
  { id: 4, partyType: "SUPPLIER", partyName: "NCC Van Chuyen", phone: "028000002", openingBalance: 0, debitAmount: 2500000, creditAmount: 5200000, endingBalance: 2700000 }
];

export const accountingApi = {
  async overview(): Promise<AccountingOverview> {
    if (!enableMock) {
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
    }
    await wait();
    const cashIn = receipts.filter((item) => item.status === "POSTED").reduce((sum, item) => sum + item.amount, 0);
    const cashOut = payments.filter((item) => item.status === "POSTED").reduce((sum, item) => sum + item.amount, 0);
    const receivable = debts.filter((item) => item.partyType === "CUSTOMER").reduce((sum, item) => sum + item.endingBalance, 0);
    const payable = debts.filter((item) => item.partyType === "SUPPLIER").reduce((sum, item) => sum + item.endingBalance, 0);
    const revenue = 2840000000;
    const costOfGoodsSold = 1980000000;
    const expenses = cashOut;
    const grossProfit = revenue - costOfGoodsSold;
    const netProfit = grossProfit - expenses;
    return {
      kpis: { revenue, grossProfit, netProfit, cashBalance: 128000000, bankBalance: 745000000, receivable, payable, cashIn, cashOut },
      profitLoss: { revenue, costOfGoodsSold, grossProfit, expenses, netProfit },
      cashFlow: { cashIn, cashOut, netCashFlow: cashIn - cashOut, series: [{ period: "T1", cashIn: 180000000, cashOut: 92000000 }, { period: "T2", cashIn: 220000000, cashOut: 110000000 }, { period: "T3", cashIn: 260000000, cashOut: 148000000 }, { period: "T4", cashIn: 240000000, cashOut: 156000000 }, { period: "T5", cashIn: 310000000, cashOut: 188000000 }, { period: "T6", cashIn, cashOut }] },
      cashFunds: [{ id: 1, name: "Quy tien mat Go Vap", balance: 128000000 }],
      bankAccounts: [{ id: 1, bankName: "VCB", accountNumber: "970400001", balance: 520000000 }, { id: 2, bankName: "ACB", accountNumber: "970400002", balance: 225000000 }]
    };
  },

  async receipts(params: AccountingFilters): Promise<PageResponse<ReceiptVoucher>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<ReceiptVoucher>>("/api/accounting/receipts", { params: { page: Math.max(params.page - 1, 0), pageSize: params.pageSize } });
      return { ...response.data, page: response.data.page + 1, items: response.data.items.map((item) => ({ ...item, amount: Number(item.amount), customerName: item.customerName || "", status: item.status ?? "POSTED" })) };
    }
    await wait();
    return paginate(filterVouchers(receipts, params, "customerName"), params.page, params.pageSize);
  },

  async payments(params: AccountingFilters): Promise<PageResponse<PaymentVoucher>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<PaymentVoucher>>("/api/accounting/payments", { params: { page: Math.max(params.page - 1, 0), pageSize: params.pageSize } });
      return { ...response.data, page: response.data.page + 1, items: response.data.items.map((item) => ({ ...item, amount: Number(item.amount), supplierName: item.supplierName || "", status: item.status ?? "POSTED" })) };
    }
    await wait();
    return paginate(filterVouchers(payments, params, "supplierName"), params.page, params.pageSize);
  },

  async debts(params: DebtFilters): Promise<PageResponse<DebtRow>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<DebtRow>>("/api/accounting/debts", { params: { partyType: params.partyType === "ALL" ? undefined : params.partyType, page: Math.max(params.page - 1, 0), pageSize: params.pageSize } });
      const keyword = params.keyword.trim().toLowerCase();
      const items = response.data.items.map((item) => ({ ...item, openingBalance: Number(item.openingBalance), debitAmount: Number(item.debitAmount), creditAmount: Number(item.creditAmount), endingBalance: Number(item.endingBalance), phone: item.phone ?? "" })).filter((item) => !keyword || item.partyName.toLowerCase().includes(keyword) || item.phone.includes(keyword));
      return { ...response.data, page: response.data.page + 1, items };
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = debts.filter((item) => { const matchKeyword = keyword.length === 0 || item.partyName.toLowerCase().includes(keyword) || item.phone.includes(keyword); const matchParty = params.partyType === "ALL" || item.partyType === params.partyType; return matchKeyword && matchParty; });
    return paginate(filtered, params.page, params.pageSize);
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

  async customerDebtAging(): Promise<DebtAgingRow[]> {
    const response = await api.get<DebtAgingRow[]>("/api/accounting/reports/customer-debt-aging");
    return response.data.map(normalizeAgingRow);
  },

  async supplierDebtAging(): Promise<DebtAgingRow[]> {
    const response = await api.get<DebtAgingRow[]>("/api/accounting/reports/supplier-debt-aging");
    return response.data.map(normalizeAgingRow);
  },

  async createReceipt(payload: CreateReceiptPayload): Promise<ReceiptVoucher> {
    if (!enableMock) {
      const response = await api.post<{ sourceNo: string; paidAmount: number }>("/api/accounting/receipts", { ...payload, bankAccountId: payload.paymentMethod === "BANK_TRANSFER" ? payload.bankAccountId : undefined });
      return { ...payload, id: Date.now(), voucherNo: response.data.sourceNo, amount: Number(response.data.paidAmount), status: "POSTED" };
    }
    await wait();
    const receipt: ReceiptVoucher = { id: Date.now(), status: "POSTED", ...payload };
    receipts = [receipt, ...receipts];
    return receipt;
  },

  async createPayment(payload: CreatePaymentPayload): Promise<PaymentVoucher> {
    if (!enableMock) {
      const response = await api.post<{ sourceNo: string; paidAmount: number }>("/api/accounting/payments", { ...payload, bankAccountId: payload.paymentMethod === "BANK_TRANSFER" ? payload.bankAccountId : undefined });
      return { ...payload, id: Date.now(), voucherNo: response.data.sourceNo, amount: Number(response.data.paidAmount), status: "POSTED" };
    }
    await wait();
    const payment: PaymentVoucher = { id: Date.now(), status: "POSTED", ...payload };
    payments = [payment, ...payments];
    return payment;
  },

  async bankAccounts(): Promise<BankAccountOption[]> {
    if (!enableMock) {
      const response = await api.get<BankAccountOption[]>("/api/accounting/bank-accounts");
      return response.data;
    }
    await wait();
    return [{ id: 1, bankName: "VCB", accountNumber: "970400001", balance: 520000000 }, { id: 2, bankName: "ACB", accountNumber: "970400002", balance: 225000000 }];
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
  }
};

// ── Normalizers ──

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

function filterVouchers<T extends { voucherNo: string; amount: number; status: string; paymentMethod: string }>(items: T[], params: AccountingFilters, partyKey: keyof T) {
  const keyword = params.keyword.trim().toLowerCase();
  return items.filter((item) => { const partyValue = String(item[partyKey]).toLowerCase(); const matchKeyword = keyword.length === 0 || item.voucherNo.toLowerCase().includes(keyword) || partyValue.includes(keyword); const matchStatus = params.status === "ALL" || item.status === params.status; const matchMethod = params.method === "ALL" || item.paymentMethod === params.method; return matchKeyword && matchStatus && matchMethod; });
}

function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, totalItems, totalPages };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}
