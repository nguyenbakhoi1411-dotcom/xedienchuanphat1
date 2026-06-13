import axios, { AxiosInstance } from 'axios';
import {
  BankAccount,
  BankTransaction,
  BankReconciliation,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  CreateBankReceiptRequest,
  CreateBankPaymentRequest,
  UpdateBankTransactionRequest,
  QueryTransactionRequest,
  ReconcileRequest,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class BankDepositAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/bank-deposit`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // ============ BANK ACCOUNT OPERATIONS ============

  async createBankAccount(
    data: CreateBankAccountRequest,
  ): Promise<ApiResponse<BankAccount>> {
    const response = await this.api.post('/accounts', data);
    return response.data;
  }

  async getBankAccounts(includeInactive = false): Promise<BankAccount[]> {
    const response = await this.api.get('/accounts', {
      params: { includeInactive },
    });
    return response.data;
  }

  async getBankAccount(id: string): Promise<BankAccount> {
    const response = await this.api.get(`/accounts/${id}`);
    return response.data;
  }

  async updateBankAccount(
    id: string,
    data: UpdateBankAccountRequest,
  ): Promise<ApiResponse<BankAccount>> {
    const response = await this.api.put(`/accounts/${id}`, data);
    return response.data;
  }

  async deactivateBankAccount(id: string): Promise<ApiResponse<BankAccount>> {
    const response = await this.api.delete(`/accounts/${id}`);
    return response.data;
  }

  // ============ RECEIPT OPERATIONS ============

  async createBankReceipt(
    data: CreateBankReceiptRequest,
  ): Promise<ApiResponse<BankTransaction>> {
    const response = await this.api.post('/receipts', data);
    return response.data;
  }

  // ============ PAYMENT OPERATIONS ============

  async createBankPayment(
    data: CreateBankPaymentRequest,
  ): Promise<ApiResponse<BankTransaction>> {
    const response = await this.api.post('/payments', data);
    return response.data;
  }

  // ============ TRANSACTION OPERATIONS ============

  async createTransaction(
    type: 'receipt' | 'payment',
    data: CreateBankReceiptRequest | CreateBankPaymentRequest,
  ): Promise<ApiResponse<BankTransaction>> {
    const endpoint = type === 'receipt' ? '/receipts' : '/payments';
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  async getTransactions(
    query: QueryTransactionRequest,
  ): Promise<PaginatedResponse<BankTransaction>> {
    const response = await this.api.get('/transactions', { params: query });
    return response.data;
  }

  async getTransaction(id: string): Promise<BankTransaction> {
    const response = await this.api.get(`/transactions/${id}`);
    return response.data;
  }

  async updateTransaction(
    id: string,
    data: UpdateBankTransactionRequest,
  ): Promise<ApiResponse<BankTransaction>> {
    const response = await this.api.put(`/transactions/${id}`, data);
    return response.data;
  }

  async postTransaction(id: string): Promise<ApiResponse<BankTransaction>> {
    const response = await this.api.post(`/transactions/${id}/post`);
    return response.data;
  }

  async cancelTransaction(id: string): Promise<ApiResponse<BankTransaction>> {
    const response = await this.api.post(`/transactions/${id}/cancel`);
    return response.data;
  }

  // ============ RECONCILIATION OPERATIONS ============

  async getReconciliation(
    accountId: string,
    period: string,
  ): Promise<BankReconciliation> {
    const response = await this.api.get(`/reconciliation/${accountId}/${period}`);
    return response.data;
  }

  async reconcile(
    accountId: string,
    period: string,
    data: ReconcileRequest,
  ): Promise<ApiResponse<BankReconciliation>> {
    const response = await this.api.post(
      `/reconciliation/${accountId}/${period}`,
      data,
    );
    return response.data;
  }

  async getLatestReconciliation(accountId: string): Promise<BankReconciliation | null> {
    try {
      const response = await this.api.get(
        `/reconciliation/${accountId}/latest`,
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // ============ REPORT OPERATIONS ============

  async getDailySummary(
    startDate: string,
    endDate: string,
  ): Promise<PaginatedResponse<BankTransaction>> {
    const response = await this.api.get('/reports/daily-summary', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getAccountBalanceReport(): Promise<BankAccount[]> {
    const response = await this.api.get('/reports/account-balance');
    return response.data;
  }

  async getPendingTransactions(): Promise<PaginatedResponse<BankTransaction>> {
    const response = await this.api.get('/reports/pending-transactions');
    return response.data;
  }

  async getReconciliationStatusReport(): Promise<any> {
    const response = await this.api.get('/reports/reconciliation-status');
    return response.data;
  }

  async getTransactionAuditReport(
    startDate: string,
    endDate: string,
  ): Promise<PaginatedResponse<BankTransaction>> {
    const response = await this.api.get('/reports/transaction-audit', {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

// Export singleton instance
export const bankDepositAPI = new BankDepositAPI();
