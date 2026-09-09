import { api } from "@/lib/api/axios";
import {
  BankAccount,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  BankAccountSummary,
  BankTransaction,
  CreateBankTransactionRequest,
  PagedResponse,
  ImportStatementResult,
  AutoMatchResult,
  ReconciliationReport,
  BankStatementLineDTO,
} from "../types";

export const bankDepositApi = {
  // Accounts
  async getAccounts(includeInactive = false) {
    const res = await api.get("/api/bank-deposit/accounts", { params: { includeInactive } });
    return res.data as BankAccount[];
  },
  async getAccount(id: string | number) {
    const res = await api.get(`/api/bank-deposit/accounts/${id}`);
    return res.data as BankAccount;
  },
  async createAccount(data: CreateBankAccountRequest) {
    const res = await api.post("/api/bank-deposit/accounts", data);
    return res.data as BankAccount;
  },
  async updateAccount(id: string | number, data: UpdateBankAccountRequest) {
    const res = await api.put(`/api/bank-deposit/accounts/${id}`, data);
    return res.data as BankAccount;
  },
  async deactivateAccount(id: string | number) {
    await api.delete(`/api/bank-deposit/accounts/${id}`);
  },
  async getAccountSummary(id: string | number, fromDate?: string, toDate?: string) {
    const res = await api.get(`/api/bank-deposit/accounts/${id}/summary`, { params: { fromDate, toDate } });
    return res.data as BankAccountSummary;
  },

  // Transactions
  async getTransactions(params: {
    bankAccountId?: string | number;
    startDate?: string;
    endDate?: string;
    loaiGiaoDich?: string;
    trangThaiDoiChieu?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await api.get("/api/bank-deposit/transactions", { params });
    // DTO might not have aliases, we cast it to BankTransaction
    return res.data as PagedResponse<BankTransaction>;
  },
  async getTransaction(id: string | number) {
    const res = await api.get(`/api/bank-deposit/transactions/${id}`);
    return res.data as BankTransaction;
  },
  async createReceipt(data: CreateBankTransactionRequest) {
    const res = await api.post("/api/bank-deposit/receipts", data);
    return res.data as BankTransaction;
  },
  async createPayment(data: CreateBankTransactionRequest) {
    const res = await api.post("/api/bank-deposit/payments", data);
    return res.data as BankTransaction;
  },
  async postTransaction(id: string | number) {
    await api.post(`/api/bank-deposit/transactions/${id}/post`);
  },
  async cancelTransaction(id: string | number) {
    await api.post(`/api/bank-deposit/transactions/${id}/cancel`);
  },

  // Statements
  async importStatement(file: File, bankAccountId: string | number, nganHang: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bankAccountId", String(bankAccountId));
    formData.append("nganHang", nganHang);
    const res = await api.post("/api/bank-deposit/statements/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data as ImportStatementResult;
  },
  async getStatementLines(statementId: string | number, trangThaiDoiChieu?: string, page = 0, size = 50) {
    const res = await api.get(`/api/bank-deposit/statements/${statementId}/lines`, { params: { trangThaiDoiChieu, page, size } });
    return res.data;
  },
  async runAutoMatch(statementId: string | number) {
    const res = await api.post(`/api/bank-deposit/statements/${statementId}/auto-match`);
    return res.data as AutoMatchResult;
  },
  async manualMatch(statementId: string | number, lineId: string | number, bankTransactionId: string | number) {
    await api.post(`/api/bank-deposit/statements/${statementId}/lines/${lineId}/manual-match`, { bankTransactionId });
  },
  async createTransactionFromLine(statementId: string | number, lineId: string | number, data: { loaiThuChi: string; dienGiai?: string }) {
    const res = await api.post(`/api/bank-deposit/statements/${statementId}/lines/${lineId}/create-transaction`, data);
    return res.data as BankTransaction;
  },
  async ignoreLine(statementId: string | number, lineId: string | number) {
    await api.post(`/api/bank-deposit/statements/${statementId}/lines/${lineId}/ignore`);
  },
  async getReconciliationReport(statementId: string | number) {
    const res = await api.get(`/api/bank-deposit/statements/${statementId}/reconciliation-report`);
    return res.data as ReconciliationReport;
  },
  async matchReconciliation(id: string, data: object) {
    const res = await api.post(`/api/bank-deposit/reconciliations/${id}/match`, data);
    return res.data;
  },
};
