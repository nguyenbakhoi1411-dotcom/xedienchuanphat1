import api from '@/lib/api/axios';
import type { AxiosResponse } from 'axios';
import type * as S from './types';

const d = <T>(r: AxiosResponse<T>): T => r.data;

export const salesApi = {
  // Dashboard
  getDashboard: (branchId?: number, fromDate?: string, toDate?: string) =>
    api.get<S.SalesDashboard>('/api/v1/sales/dashboard', { params: { branchId, fromDate, toDate } }).then(d),
  getSalesDashboard: (p?: { branchId?: number; fromDate?: string; toDate?: string }) =>
    salesApi.getDashboard(p?.branchId, p?.fromDate, p?.toDate),

  // Báo giá
  listQuotations: (p?: { status?: string; fromDate?: string; toDate?: string; keyword?: string; page?: number; size?: number }) =>
    api.get<S.PageResponse<S.Quotation>>('/api/v1/sales/quotations', { params: p }).then(d),
  getQuotation: (id: number) => api.get<S.Quotation>(`/api/v1/sales/quotations/${id}`).then(d),
  createQuotation: (data: S.CreateQuotationDto | Record<string, unknown>) => api.post<S.Quotation>('/api/v1/sales/quotations', data).then(d),
  updateQuotation: (id: number, data: Partial<S.CreateQuotationDto>) =>
    api.put<S.Quotation>(`/api/v1/sales/quotations/${id}`, data).then(d),
  convertQuotationToOrder: (id: number) => api.post<S.SalesOrder>(`/api/v1/sales/quotations/${id}/convert-to-order`).then(d),
  convertQuotation: (id: number, employeeId?: number) =>
    api.post<S.SalesOrder>(`/api/v1/sales/quotations/${id}/convert`, { employeeId }).then(d),
  sendQuotation: (id: number) => api.post<S.Quotation>(`/api/v1/sales/quotations/${id}/send`).then(d),

  // Đơn đặt hàng
  listOrders: (p?: { status?: string; fromDate?: string; toDate?: string; keyword?: string; customerId?: number; page?: number; size?: number }) =>
    api.get<S.PageResponse<S.SalesOrder>>('/api/v1/sales/orders', { params: p }).then(d),
  getOrder: (id: number) => api.get<S.SalesOrder>(`/api/v1/sales/orders/${id}`).then(d),
  createOrder: (data: S.CreateSalesOrderDto) => api.post<S.SalesOrder>('/api/v1/sales/orders', data).then(d),
  updateOrder: (id: number, data: Partial<S.CreateSalesOrderDto>) =>
    api.put<S.SalesOrder>(`/api/v1/sales/orders/${id}`, data).then(d),
  confirmOrder: (id: number) => api.post<S.SalesOrder>(`/api/v1/sales/orders/${id}/confirm`).then(d),
  deliverOrder: (id: number) => api.patch<S.SalesOrder>(`/api/v1/sales/orders/${id}/deliver`).then(d),
  recordRevenue: (id: number) => api.post<S.SalesOrder>(`/api/v1/sales/orders/${id}/record-revenue`).then(d),
  collectPayment: (id: number, data: S.CollectPaymentDto) =>
    api.post<S.SalesOrder>(`/api/v1/sales/orders/${id}/collect-payment`, data).then(d),
  createPayment: (data: S.CollectPaymentDto & { orderId: number }) =>
    api.post<S.SalesPayment>(`/api/v1/sales/orders/${data.orderId}/payments`, data).then(d),
  addPayment: (orderId: number, data: S.CollectPaymentDto) =>
    api.post<S.SalesPayment>(`/api/v1/sales/orders/${orderId}/payments`, data).then(d),
  paymentHistory: (orderId: number) =>
    api.get<S.SalesPayment[]>(`/api/v1/sales/orders/${orderId}/payments`).then(d),
  createInstallment: (orderId: number, data: object) =>
    api.post(`/api/v1/sales/orders/${orderId}/installments`, data).then(d),
  installments: (orderId: number) =>
    api.get<S.Installment[]>(`/api/v1/sales/orders/${orderId}/installments`).then(d),
  disburseInstallment: (id: number, amount: number) =>
    api.patch<S.Installment>(`/api/v1/sales/installments/${id}/status`, {
      status: 'DISBURSED',
      disbursedAmount: amount
    }).then(d),
  approveDiscount: (id: number, note?: string) =>
    api.patch<S.SalesOrder>(`/api/v1/sales/orders/${id}/approve-discount`, { note }).then(d),
  rejectDiscount: (id: number, note?: string) =>
    api.patch<S.SalesOrder>(`/api/v1/sales/orders/${id}/reject-discount`, { note }).then(d),
  cancelOrder: (id: number, reason: string) =>
    api.post<S.SalesOrder>(`/api/v1/sales/orders/${id}/cancel`, { reason }).then(d),

  // Hóa đơn
  listInvoices: (p?: { status?: string; fromDate?: string; toDate?: string; keyword?: string; page?: number; size?: number }) =>
    api.get<S.PageResponse<S.TaxInvoice>>('/api/v1/sales/invoices', { params: p }).then(d),
  getInvoice: (id: number) => api.get<S.TaxInvoice>(`/api/v1/sales/invoices/${id}`).then(d),
  createInvoiceFromOrder: (orderId: number) =>
    api.post<S.TaxInvoice>(`/api/v1/sales/invoices/from-order/${orderId}`).then(d),
  createInvoiceForOrder: (orderId: number) =>
    salesApi.createInvoiceFromOrder(orderId),
  createInvoice: (data: S.CreateInvoicePayload) =>
    data.orderId
      ? salesApi.createInvoiceFromOrder(data.orderId)
      : api.post<S.TaxInvoice>('/api/v1/sales/invoices', data).then(d),
  invoicePdfBlob: (invoiceId: number) =>
    api.get<Blob>(`/api/v1/sales/invoices/${invoiceId}/pdf`, { responseType: 'blob' }).then(d),
  issueInvoice: (id: number) => api.post<S.TaxInvoice>(`/api/v1/sales/invoices/${id}/issue`).then(d),
  cancelInvoice: (id: number, reason: string) =>
    api.post<S.TaxInvoice>(`/api/v1/sales/invoices/${id}/cancel`, { reason }).then(d),

  // Giảm giá hàng bán
  listReturns: (branchId?: number, page = 0, size = 20) =>
    api.get<S.PageResponse<S.SalesReturn>>('/api/v1/sales/returns', { params: { branchId, page, size } }).then(d),
  createReturn: (data: object) =>
    api.post('/api/v1/sales/returns', data).then(d),
  listDiscounts: (p?: { fromDate?: string; toDate?: string; page?: number; size?: number }) =>
    api.get<S.PageResponse<S.SalesDiscount>>('/api/v1/sales/discounts', { params: p }).then(d),
  previewVoucher: (data: { voucherCode: string; branchId: number; subtotal: number; productIds: number[] }) =>
    api.post<{ discountAmount: number }>('/api/v1/sales/voucher-preview', data).then(d),
  releaseExpiredReservations: () =>
    api.post<{ released: number }>('/api/v1/sales/reservations/release-expired').then(d),
  createDiscount: (data: object) => api.post<S.SalesDiscount>('/api/v1/sales/discounts', data).then(d),
  issueDiscountInvoice: (id: number) =>
    api.post<S.TaxInvoice>(`/api/v1/sales/discounts/${id}/issue-invoice`).then(d),

  // Công nợ
  getARBalances: (p?: { asOfDate?: string; keyword?: string; page?: number; size?: number }) =>
    api.get<S.PageResponse<S.ARBalance>>('/api/v1/sales/ar-balances', { params: p }).then(d),
  getARDetail: (customerId: number, asOfDate: string) =>
    api.get<S.ARBalance>(`/api/v1/sales/ar-balances/${customerId}/detail`, { params: { asOfDate } }).then(d),
  collectFromAR: (customerId: number, data: S.CollectPaymentDto) =>
    api.post(`/api/v1/sales/ar-balances/${customerId}/collect`, data).then(d),

  // Đặt cọc
  listDeposits: (branchId?: number) =>
    api.get<S.Deposit[]>('/api/sales/deposits', { params: { branchId } }).then(d),
  depositsByCustomer: (customerId: number) =>
    api.get<S.Deposit[]>(`/api/sales/deposits/customer/${customerId}`).then(d),
  createDeposit: (data: S.CreateDepositPayload) =>
    api.post<S.Deposit>('/api/sales/deposits', data).then(d),
  refundDeposit: (id: number) =>
    api.post<S.Deposit>(`/api/sales/deposits/${id}/refund`).then(d),

  // MISA Export
  exportMisa: (fromDate?: string, toDate?: string) => 
    api.get('/api/v1/sales/misa-export', { 
      params: { fromDate, toDate },
      responseType: 'blob' 
    }).then(d),

  // Khách hàng (trong Sales context)
  listCustomers: (p?: { keyword?: string; page?: number; size?: number }) =>
    api.get<S.PageResponse<S.CustomerSales>>('/api/v1/sales/customers', { params: p }).then(d),
  customer360: (customerId: number) =>
    api.get<S.SalesCustomer360>(`/api/customers/${customerId}/360`).then(d),
  searchCustomers: (keyword: string): Promise<S.PosCustomer[]> =>
    salesApi.listCustomers({ keyword, page: 0, size: 20 }).then((res) =>
      res.content.map((customer) => ({
        ...customer,
        id: customer.id,
        name: customer.customerName,
        debtAmount: customer.arBalance
      } satisfies S.PosCustomer))
    ),

  // Hàng hóa dịch vụ
  listProducts: (p?: { keyword?: string; itemGroup?: string; lowStockOnly?: boolean; page?: number; size?: number }) =>
    api.get<S.PageResponse<S.ProductStock>>('/api/v1/sales/products', { params: p }).then(d),
  searchProducts: (keyword: string, _branchId?: number): Promise<S.PosProduct[]> =>
    salesApi.listProducts({ keyword, page: 0, size: 20 }).then((res) =>
      res.content.map((product) => ({
        ...product,
        id: product.productId,
        category: product.itemGroup,
        salePrice: 0,
        stockQuantity: product.available,
        serials: []
      } satisfies S.PosProduct))
    ),
};
