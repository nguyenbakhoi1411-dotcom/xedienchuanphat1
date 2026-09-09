export type ReceiptType = "SALE" | "DEBT" | "OTHER";
export type PaymentType = "PURCHASE" | "SALARY" | "OPERATING" | "REFUND" | "OTHER";
export type VoucherStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export type CashSummaryDto = {
  tonQuyDauNgay: number;
  tongThuTrongNgay: number;
  tongChiTrongNgay: number;
  tonQuyHienTai: number;
  isAmQuy: boolean;
};

export type CashReceiptDto = {
  id: number;
  voucherNo: string;
  receiptDate: string;
  payerName?: string;
  customerId?: number;
  receiptType: ReceiptType;
  salesOrderId?: number;
  salesOrderNo?: string;
  amount: number;
  description?: string;
  createdBy: string;
  debitAccount: string;
  creditAccount: string;
  status: VoucherStatus;
};

export type CashPaymentDto = {
  id: number;
  voucherNo: string;
  paymentDate: string;
  payeeName?: string;
  supplierId?: number;
  paymentType: PaymentType;
  purchaseOrderId?: number;
  amount: number;
  description?: string;
  createdBy: string;
  debitAccount: string;
  creditAccount: string;
  status: VoucherStatus;
};

export type CashLedgerRow = {
  ngay: string;
  loai: "RECEIPT" | "PAYMENT";
  maChungTu: string;
  dienGiai: string;
  thu: number;
  chi: number;
  soDuSauGd: number;
};

export type CashLedgerDto = {
  soDuDauKy: number;
  tongThuTrongKy: number;
  tongChiTrongKy: number;
  soDuCuoiKy: number;
  transactions: CashLedgerRow[];
};

export type CreateReceiptRequest = {
  receiptDate: string;
  payerName?: string;
  customerId?: number;
  receiptType: ReceiptType;
  salesOrderId?: number;
  amount: number;
  description?: string;
  confirmNow: boolean;
};

export type CreatePaymentRequest = {
  paymentDate: string;
  payeeName?: string;
  supplierId?: number;
  paymentType: PaymentType;
  purchaseOrderId?: number;
  amount: number;
  description?: string;
  confirmNow: boolean;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
