import { api } from "@/lib/api/axios";
import type {
  CreateInvoicePayload,
  InstallmentApplication,
  InvoiceResponse,
  PageResponse,
  PosCustomer,
  PosProduct,
  Quotation,
  QuotationStatus,
  SalesOrder,
  SalesPayment,
  SalesReturn
} from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

export const customers: PosCustomer[] = [
  { id: 1, name: "Nguyen Van A", phone: "0900000001", address: "Go Vap, TP.HCM", debtAmount: 0 },
  { id: 2, name: "Tran Thi B", phone: "0900000002", address: "Thu Duc, TP.HCM", debtAmount: 12000000 },
  { id: 3, name: "Pham Quoc C", phone: "0900000003", address: "Quan 7, TP.HCM", debtAmount: 3500000 }
];

export const posProducts: PosProduct[] = [
  {
    id: 1,
    productCode: "CP-S1",
    productName: "Xe may dien CP S1",
    category: "ELECTRIC_MOTORBIKE",
    salePrice: 15800000,
    stockQuantity: 6,
    imageUrl: "/images/login-electric-motorbike.png",
    serials: [
      { id: 1, serialNumber: "CP-S1-00091", branchName: "Go Vap", status: "IN_STOCK" },
      { id: 2, serialNumber: "CP-S1-00092", branchName: "Go Vap", status: "IN_STOCK" },
      { id: 3, serialNumber: "CP-S1-00093", branchName: "Thu Duc", status: "IN_STOCK" }
    ]
  },
  {
    id: 2,
    productCode: "CP-CITY",
    productName: "Xe may dien CP City",
    category: "ELECTRIC_MOTORBIKE",
    salePrice: 13900000,
    stockQuantity: 4,
    serials: [
      { id: 4, serialNumber: "CP-CITY-00418", branchName: "Quan 7", status: "IN_STOCK" },
      { id: 5, serialNumber: "CP-CITY-00419", branchName: "Go Vap", status: "IN_STOCK" }
    ]
  },
  {
    id: 3,
    productCode: "PIN-LFP-72",
    productName: "Binh ac quy LFP 72V",
    category: "BATTERY",
    salePrice: 6500000,
    stockQuantity: 12,
    serials: []
  },
  {
    id: 4,
    productCode: "SAC-NHANH",
    productName: "Bo sac nhanh",
    category: "CHARGER",
    salePrice: 1250000,
    stockQuantity: 28,
    serials: []
  }
];

export const salesApi = {
  async searchProducts(keyword: string, branchId: number): Promise<PosProduct[]> {
    if (!enableMock) {
      const response = await api.get<{ items: PosProduct[] }>("/api/products", {
        params: { keyword, page: 0, pageSize: 50 }
      });
      const serialResponse = await api.get<{
        items: Array<{ id: number; productId: number; serialNumber: string; branchId: number; status: PosProduct["serials"][number]["status"] }>;
      }>("/api/products/serials", {
        params: { branchId, page: 0, pageSize: 200 }
      });
      const activePrices = await Promise.all(response.data.items.map((item) =>
        api.get<{
          listPrice: number;
          effectivePrice: number;
          policyId?: number | null;
          policyName?: string | null;
          policyDiscountAmount?: number;
        }>("/api/price-policies/active-price", { params: { productId: item.id, branchId } }).then((res) => res.data).catch(() => null)
      ));
      return response.data.items.map((item, index) => {
        const price = activePrices[index];
        return {
          ...item,
          salePrice: Number(price?.effectivePrice ?? item.salePrice),
          listPrice: Number(price?.listPrice ?? item.salePrice),
          effectivePrice: Number(price?.effectivePrice ?? item.salePrice),
          pricePolicyId: price?.policyId ?? null,
          pricePolicyName: price?.policyName ?? null,
          policyDiscountAmount: Number(price?.policyDiscountAmount ?? 0),
          stockQuantity: serialResponse.data.items.filter((serial) => serial.productId === item.id && serial.status === "IN_STOCK").length,
          imageUrl: item.imageUrl ?? "",
          serials: serialResponse.data.items
            .filter((serial) => serial.productId === item.id)
            .map((serial) => ({
              id: serial.id,
              serialNumber: serial.serialNumber,
              branchName: String(serial.branchId),
              status: serial.status
            }))
        };
      });
    }
    await wait(220);
    const q = keyword.trim().toLowerCase();
    if (!q) return posProducts;
    return posProducts.filter(
      (item) => item.productName.toLowerCase().includes(q) || item.productCode.toLowerCase().includes(q)
    );
  },

  async searchCustomers(keyword: string): Promise<PosCustomer[]> {
    if (!enableMock) {
      const response = await api.get<{ items: Array<{ id: number; fullName: string; phone: string; address: string }> }>("/api/customers", {
        params: { keyword, page: 0, pageSize: 20 }
      });
      return response.data.items.map((item) => ({
        id: item.id,
        name: item.fullName,
        phone: item.phone,
        address: item.address ?? "",
        debtAmount: 0
      }));
    }
    await wait(180);
    const q = keyword.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((item) => item.name.toLowerCase().includes(q) || item.phone.includes(q));
  },

  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceResponse> {
    if (!enableMock) {
      if (!payload.branchId || !payload.employeeId) {
        throw new Error("Khong xac dinh duoc chi nhanh hoac nhan vien ban hang");
      }
      const payments: Array<{ paymentMethod: "CASH" | "BANK_TRANSFER"; amount: number }> = [];
      if (payload.payment.cashAmount > 0) payments.push({ paymentMethod: "CASH", amount: payload.payment.cashAmount });
      if (payload.payment.bankAmount > 0) payments.push({ paymentMethod: "BANK_TRANSFER", amount: payload.payment.bankAmount });
      const response = await api.post<SalesOrder>("/api/sales/orders", {
        branchId: payload.branchId,
        customerId: payload.customer.id,
        employeeId: payload.employeeId,
        orderDate: new Date().toISOString().slice(0, 10),
        discountAmount: payload.payment.discountAmount,
        paidAmount: payload.paidAmount,
        paymentMethod: payload.payment.method === "BANK_TRANSFER" ? "BANK_TRANSFER" : "CASH",
        voucherCode: payload.payment.voucherCode || undefined,
        confirm: true,
        issueInvoice: true,
        payments,
        items: payload.items.map((item) => ({
          productId: item.productId,
          serialId: item.selectedSerials[0] ? Number(item.selectedSerials[0]) : undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
      if (payload.payment.installmentAmount > 0) {
        await api.post(`/api/sales/orders/${response.data.id}/installments`, {
          financeCompany: "Cho xet duyet",
          downPaymentAmount: payload.paidAmount,
          loanAmount: payload.payment.installmentAmount,
          termMonths: 12,
          interestRate: 0,
          note: "Tao tu POS"
        });
      }
      const invoice = await api.post<{
        id: number;
        invoiceNo: string;
        invoiceDate: string;
        status: string;
        totalAmount: number;
      }>(`/api/sales/orders/${response.data.id}/invoice`, { status: "ISSUED" });
      return {
        id: invoice.data.id,
        invoiceNo: invoice.data.invoiceNo,
        createdAt: invoice.data.invoiceDate,
        paymentStatus: response.data.paymentStatus,
        totalAmount: response.data.totalAmount,
        paidAmount: response.data.paidAmount,
        pdfUrl: `${api.defaults.baseURL}/api/invoices/${invoice.data.id}/pdf`
      };
    }
    await wait(750);
    if (payload.items.length === 0) throw new Error("Gio hang dang trong");
    return {
      invoiceNo: `HD-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      paymentStatus: payload.paymentStatus,
      totalAmount: payload.totalAmount,
      paidAmount: payload.paidAmount
    };
  },

  async previewVoucher(payload: { voucherCode: string; branchId: number; subtotal: number; productIds: number[] }) {
    const response = await api.post<{ discountAmount: number; totalAmount: number; message: string }>("/api/sales/vouchers/preview", payload);
    return response.data;
  },

  async listOrders(branchId?: number, page = 0, pageSize = 20) {
    const response = await api.get<PageResponse<SalesOrder>>("/api/sales/orders", {
      params: { branchId, page, pageSize }
    });
    return response.data;
  },

  async getOrder(id: number) {
    const response = await api.get<SalesOrder>(`/api/sales/orders/${id}`);
    return response.data;
  },

  async confirmOrder(id: number) {
    const response = await api.patch<SalesOrder>(`/api/sales/orders/${id}/confirm`, {});
    return response.data;
  },

  async deliverOrder(id: number) {
    const response = await api.patch<SalesOrder>(`/api/sales/orders/${id}/deliver`);
    return response.data;
  },

  async cancelOrder(id: number, reason: string) {
    const response = await api.patch<SalesOrder>(`/api/sales/orders/${id}/cancel`, { reason });
    return response.data;
  },

  async paymentHistory(orderId: number) {
    const response = await api.get<SalesPayment[]>(`/api/sales/orders/${orderId}/payments`);
    return response.data;
  },

  async addPayment(orderId: number, payload: { paymentMethod: "CASH" | "BANK_TRANSFER"; amount: number; bankAccountId?: number; paymentDate?: string; referenceNo?: string; note?: string }) {
    const response = await api.post<SalesPayment>(`/api/sales/orders/${orderId}/payments`, payload);
    return response.data;
  },

  async listQuotations(branchId?: number, page = 0, pageSize = 20) {
    const response = await api.get<PageResponse<Quotation>>("/api/sales/quotations", {
      params: { branchId, page, pageSize }
    });
    return response.data;
  },

  async createQuotation(payload: CreateInvoicePayload & { validUntil: string; note?: string }) {
    if (!payload.branchId || !payload.employeeId) throw new Error("Thieu chi nhanh hoac nhan vien");
    const response = await api.post<Quotation>("/api/sales/quotations", {
      branchId: payload.branchId,
      customerId: payload.customer.id,
      employeeId: payload.employeeId,
      quotationDate: new Date().toISOString().slice(0, 10),
      validUntil: payload.validUntil,
      discountAmount: payload.payment.discountAmount,
      voucherCode: payload.payment.voucherCode || undefined,
      note: payload.note,
      items: payload.items.map((item) => ({
        productId: item.productId,
        serialId: item.selectedSerials[0] ? Number(item.selectedSerials[0]) : undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    });
    return response.data;
  },

  async updateQuotationStatus(id: number, status: QuotationStatus) {
    const response = await api.patch<Quotation>(`/api/sales/quotations/${id}/status`, { status });
    return response.data;
  },

  async convertQuotation(id: number, employeeId: number) {
    const response = await api.post<SalesOrder>(`/api/sales/quotations/${id}/convert`, {
      employeeId,
      issueInvoice: false,
      payments: []
    });
    return response.data;
  },

  async installments(orderId: number) {
    const response = await api.get<InstallmentApplication[]>(`/api/sales/orders/${orderId}/installments`);
    return response.data;
  },

  async createInstallment(orderId: number, payload: {
    financeCompany: string;
    downPaymentAmount: number;
    loanAmount: number;
    termMonths: number;
    interestRate: number;
  }) {
    const response = await api.post<InstallmentApplication>(`/api/sales/orders/${orderId}/installments`, payload);
    return response.data;
  },

  async disburseInstallment(id: number, amount: number, bankAccountId?: number) {
    const response = await api.patch<InstallmentApplication>(`/api/sales/installments/${id}/status`, {
      status: "DISBURSED",
      disbursedAmount: amount,
      paymentDate: new Date().toISOString().slice(0, 10),
      bankAccountId
    });
    return response.data;
  },

  async createInvoiceForOrder(orderId: number) {
    const response = await api.post<{ id: number; invoiceNo: string }>(`/api/sales/orders/${orderId}/invoice`, { status: "ISSUED" });
    return response.data;
  },

  async invoicePdfBlob(invoiceId: number) {
    const response = await api.get(`/api/invoices/${invoiceId}/pdf`, { responseType: "blob" });
    return response.data as Blob;
  },

  async listReturns(branchId?: number, page = 0, pageSize = 20) {
    const response = await api.get<PageResponse<SalesReturn>>("/api/sales/returns", {
      params: { branchId, page, pageSize }
    });
    return response.data;
  },

  async createReturn(payload: {
    orderId: number;
    refundAmount: number;
    refundMethod: "CASH" | "BANK_TRANSFER";
    reason?: string;
    items: Array<{ orderItemId: number; quantity: number; serialDisposition?: "RETURNED" | "DAMAGED" }>;
  }) {
    const response = await api.post<SalesReturn>("/api/sales/returns", payload);
    return response.data;
  },

  async releaseExpiredReservations() {
    const response = await api.post<{ released: number }>("/api/sales/reservations/release-expired");
    return response.data;
  },

  // ── Discount Approval ──
  async approveDiscount(orderId: number, note?: string) {
    const response = await api.patch<SalesOrder>(`/api/sales/orders/${orderId}/approve-discount`, { note });
    return response.data;
  },

  async rejectDiscount(orderId: number, note?: string) {
    const response = await api.patch<SalesOrder>(`/api/sales/orders/${orderId}/reject-discount`, { note });
    return response.data;
  },

  // ── Deposits ──
  async listDeposits(branchId?: number) {
    const response = await api.get<import("./types").Deposit[]>("/api/sales/deposits", {
      params: branchId ? { branchId } : undefined
    });
    return response.data;
  },

  async depositsByCustomer(customerId: number) {
    const response = await api.get<import("./types").Deposit[]>(`/api/sales/deposits/customer/${customerId}`);
    return response.data;
  },

  async getDeposit(id: number) {
    const response = await api.get<import("./types").Deposit>(`/api/sales/deposits/${id}`);
    return response.data;
  },

  async createDeposit(payload: import("./types").CreateDepositPayload) {
    const response = await api.post<import("./types").Deposit>("/api/sales/deposits", payload);
    return response.data;
  },

  async convertDeposit(depositId: number, salesOrderId: number, salesOrderNo: string) {
    const response = await api.post<import("./types").Deposit>(`/api/sales/deposits/${depositId}/convert`, {
      salesOrderId,
      salesOrderNo
    });
    return response.data;
  },

  async refundDeposit(depositId: number) {
    const response = await api.post<import("./types").Deposit>(`/api/sales/deposits/${depositId}/refund`);
    return response.data;
  },

  // ── Customer 360 ──
  async customer360(customerId: number) {
    const response = await api.get<import("./types").Customer360>(`/api/crm/customers/${customerId}/360`);
    return response.data;
  }
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
