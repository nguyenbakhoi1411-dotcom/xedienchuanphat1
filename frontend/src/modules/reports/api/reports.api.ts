import axios, { AxiosInstance } from 'axios';
import {
  ReportList,
  BalanceSheetReport,
  IncomeStatementReport,
  CashFlowReport,
  GeneralLedgerReport,
  TrialBalanceReport,
  FilterPreset,
  FavoriteReport,
  RecentReport,
  DeadlineItem,
  PeriodSelector,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ReportsAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/reports`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // ============ REPORT HUB ============

  async getReportList(group?: string): Promise<ReportList> {
    const response = await this.api.get('/hub', {
      params: { group },
    });
    return response.data;
  }

  async getReportInfo(reportId: string): Promise<any> {
    const response = await this.api.get(`/info/${reportId}`);
    return response.data;
  }

  // ============ FAVORITES & RECENT ============

  async getFavoriteReports(): Promise<FavoriteReport[]> {
    const response = await this.api.get('/favorites');
    return response.data;
  }

  async toggleFavorite(reportId: string): Promise<void> {
    await this.api.post(`/favorites/${reportId}/toggle`);
  }

  async getRecentReports(limit: number = 5): Promise<RecentReport[]> {
    const response = await this.api.get('/recent', { params: { limit } });
    return response.data;
  }

  // ============ FILTER PRESETS ============

  async getFilterPresets(reportId: string): Promise<FilterPreset[]> {
    const response = await this.api.get(`/filters/presets/${reportId}`);
    return response.data;
  }

  async saveFilterPreset(
    reportId: string,
    name: string,
    filters: any,
  ): Promise<FilterPreset> {
    const response = await this.api.post('/filters/presets', {
      reportId,
      name,
      filters,
    });
    return response.data;
  }

  async deleteFilterPreset(presetId: string): Promise<void> {
    await this.api.delete(`/filters/presets/${presetId}`);
  }

  // ============ DEADLINES ============

  async getUpcomingDeadlines(): Promise<DeadlineItem[]> {
    const response = await this.api.get('/deadlines');
    return response.data;
  }

  // ============ FINANCIAL REPORTS ============

  /**
   * B01-DN: Bảng cân đối kế toán (Balance Sheet)
   */
  async getBalanceSheet(
    asOf: string,
    compareTo?: string,
  ): Promise<BalanceSheetReport> {
    const response = await this.api.get('/financial/balance-sheet', {
      params: { asOf, compareTo },
    });
    return response.data;
  }

  /**
   * B02-DN: Báo cáo kết quả HĐKD (Income Statement)
   */
  async getIncomeStatement(
    from: string,
    to: string,
    compareFrom?: string,
    compareTo?: string,
  ): Promise<IncomeStatementReport> {
    const response = await this.api.get('/financial/income-statement', {
      params: { from, to, compareFrom, compareTo },
    });
    return response.data;
  }

  /**
   * B03-DN: Báo cáo lưu chuyển tiền tệ (Cash Flow)
   */
  async getCashFlow(
    from: string,
    to: string,
    method?: 'direct' | 'indirect',
  ): Promise<CashFlowReport> {
    const response = await this.api.get('/financial/cash-flow', {
      params: { from, to, method },
    });
    return response.data;
  }

  // ============ GENERAL LEDGER REPORTS ============

  /**
   * Sổ cái (General Ledger)
   */
  async getGeneralLedger(
    accountCode: string,
    from: string,
    to: string,
  ): Promise<GeneralLedgerReport> {
    const response = await this.api.get('/general-ledger/ledger', {
      params: { accountCode, from, to },
    });
    return response.data;
  }

  /**
   * Bảng cân đối số phát sinh (Trial Balance)
   */
  async getTrialBalance(
    asOf: string,
    level?: number,
  ): Promise<TrialBalanceReport> {
    const response = await this.api.get('/general-ledger/trial-balance', {
      params: { asOf, level },
    });
    return response.data;
  }

  // ============ EXPORT ============

  async exportReport(
    reportId: string,
    format: 'excel' | 'pdf' | 'csv',
    filters?: any,
  ): Promise<Blob> {
    const response = await this.api.post(
      `/export/${reportId}`,
      { filters },
      {
        params: { format },
        responseType: 'blob',
      },
    );
    return response.data;
  }

  async sendReportEmail(
    reportId: string,
    to: string[],
    format: 'excel' | 'pdf' | 'both',
  ): Promise<void> {
    await this.api.post(`/email/${reportId}`, {
      to,
      format,
    });
  }

  // ============ SALES REPORTS ============

  async getSalesByProduct(from: string, to: string): Promise<any> {
    const response = await this.api.get('/sales/by-product', {
      params: { from, to },
    });
    return response.data;
  }

  async getSalesByCustomer(from: string, to: string): Promise<any> {
    const response = await this.api.get('/sales/by-customer', {
      params: { from, to },
    });
    return response.data;
  }

  async getSalesTrend(from: string, to: string, interval?: string): Promise<any> {
    const response = await this.api.get('/sales/trend', {
      params: { from, to, interval },
    });
    return response.data;
  }

  // ============ RECEIVABLES REPORTS ============

  async getReceivablesSummary(from: string, to: string): Promise<any> {
    const response = await this.api.get('/receivables/summary', {
      params: { from, to },
    });
    return response.data;
  }

  async getAgingReport(asOf: string): Promise<any> {
    const response = await this.api.get('/receivables/aging', {
      params: { asOf },
    });
    return response.data;
  }

  // ============ PURCHASE REPORTS ============

  async getPurchaseByVendor(from: string, to: string): Promise<any> {
    const response = await this.api.get('/purchase/by-vendor', {
      params: { from, to },
    });
    return response.data;
  }

  async getPurchaseDetail(from: string, to: string): Promise<any> {
    const response = await this.api.get('/purchase/detail', {
      params: { from, to },
    });
    return response.data;
  }

  // ============ INVENTORY REPORTS ============

  async getInventorySummary(asOf: string): Promise<any> {
    const response = await this.api.get('/inventory/summary', {
      params: { asOf },
    });
    return response.data;
  }

  async getStockCard(productId: string, from: string, to: string): Promise<any> {
    const response = await this.api.get(`/inventory/stock-card/${productId}`, {
      params: { from, to },
    });
    return response.data;
  }

  async getLowStockItems(): Promise<any> {
    const response = await this.api.get('/inventory/low-stock');
    return response.data;
  }

  // ============ PAYROLL REPORTS ============

  async getPayrollSummary(period: string): Promise<any> {
    const response = await this.api.get('/payroll/summary', {
      params: { period },
    });
    return response.data;
  }

  async getPayrollSlip(employeeId: string, period: string): Promise<any> {
    const response = await this.api.get('/payroll/slip', {
      params: { employeeId, period },
    });
    return response.data;
  }

  async getInsuranceSummary(period: string): Promise<any> {
    const response = await this.api.get('/payroll/insurance', {
      params: { period },
    });
    return response.data;
  }

  // ============ DASHBOARD ============

  async getExecutiveDashboard(): Promise<any> {
    const response = await this.api.get('/dashboard/executive');
    return response.data;
  }

  async getDashboardKPIs(): Promise<any> {
    const response = await this.api.get('/dashboard/kpis');
    return response.data;
  }
}

// Export singleton instance
export const reportsAPI = new ReportsAPI();
