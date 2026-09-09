import axios from 'axios';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface OutputInvoice {
  id: string;
  issueDate: string;
  invoiceNumber: string;
  invoiceCode: string;
  customerName: string;
  totalAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'CANCELLED';
  taxAuthorityStatus: 'READY' | 'SENT_TO_TAX_AUTHORITY' | 'ACCEPTED' | 'REJECTED';
}

export interface InputInvoice {
  id: string;
  invoiceDate: string;
  supplierInvoiceNumber: string;
  symbol: string;
  supplierName: string;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const invoiceApi = {
  // Output Invoices
  getOutputInvoices: async (params?: PaginationParams) => {
    const response = await axios.get<PaginatedResponse<OutputInvoice>>('/api/accounting/invoices/output', { params });
    return response.data;
  },
  createOutputInvoice: async (data: any) => {
    const response = await axios.post('/api/accounting/invoices/output', data);
    return response.data;
  },
  issueInvoice: async (id: string) => {
    const response = await axios.post(`/api/accounting/invoices/output/${id}/issue`);
    return response.data;
  },
  getInvoicePdf: async (id: string) => {
    const response = await axios.get(`/api/accounting/invoices/output/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  // Input Invoices
  getInputInvoices: async (params?: PaginationParams) => {
    const response = await axios.get<PaginatedResponse<InputInvoice>>('/api/accounting/invoices/input', { params });
    return response.data;
  },
  createInputInvoice: async (data: any) => {
    const response = await axios.post('/api/accounting/invoices/input', data);
    return response.data;
  },
  approveInputInvoice: async (id: string) => {
    const response = await axios.post(`/api/accounting/invoices/input/${id}/approve`);
    return response.data;
  },

  // Reports
  getVatReport: async (params?: any) => {
    const response = await axios.get('/api/accounting/invoices/reports/vat', { params });
    return response.data;
  }
};
