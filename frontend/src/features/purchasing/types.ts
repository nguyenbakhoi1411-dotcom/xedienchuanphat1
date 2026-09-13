// ─── Types cho module Mua hàng / Nhà cung cấp / Công nợ ──────────────────────

export type SupplierStatus = "ACTIVE" | "INACTIVE";

export interface SupplierGroup {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: SupplierStatus;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  groupId?: number;
  groupName?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  currentDebt: number;
  creditLimit: number;
  paymentTermsDays: number;
  rating?: number;
  notes?: string;
  status: SupplierStatus;
  createdAt: string;
}

export interface SupplierRequest {
  code: string;
  name: string;
  groupId?: number;
  taxCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  creditLimit?: number;
  paymentTermsDays?: number;
  rating?: number;
  notes?: string;
}

// ── Purchase Order ──────────────────────────────────────────────────────────
export type PurchaseOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED"
  | "REJECTED";

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Đã gửi duyệt",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PARTIALLY_RECEIVED: "Nhập một phần",
  RECEIVED: "Đã nhập đủ",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
};

export const PO_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-amber-100 text-amber-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PARTIALLY_RECEIVED: "bg-violet-100 text-violet-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-800",
};

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: number;
  purchaseOrderNo: string;
  supplierId: number;
  supplierName: string;
  branchId: number;
  status: PurchaseOrderStatus;
  statusLabel: string;
  purchaseDate: string;
  expectedDelivery?: string;
  totalAmount: number;
  paidAmount: number;
  note?: string;
  createdBy?: string;
  createdAt: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
  stockReceived: boolean;
  accountingRecorded: boolean;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderRequest {
  supplierId: number;
  branchId: number;
  purchaseDate?: string;
  expectedDelivery?: string;
  note?: string;
  items: {
    productId: number;
    quantity: number;
    unitCost: number;
  }[];
}

// ── Payable ─────────────────────────────────────────────────────────────────
export type PayableStatus = "OPEN" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";

export const PAYABLE_STATUS_LABELS: Record<PayableStatus, string> = {
  OPEN: "Chưa thanh toán",
  PARTIAL: "Thanh toán một phần",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
};

export const PAYABLE_STATUS_COLORS: Record<PayableStatus, string> = {
  OPEN: "bg-slate-100 text-slate-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-400",
};

export interface PayablePayment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  bankRef?: string;
  note?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Payable {
  id: number;
  payableCode: string;
  supplierId: number;
  supplierName: string;
  branchId: number;
  sourceType: string;
  sourceId?: number;
  sourceNo?: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  invoiceDate: string;
  dueDate?: string;
  status: PayableStatus;
  statusLabel: string;
  daysOverdue: number;
  note?: string;
  createdAt: string;
  payments: PayablePayment[];
}

export interface AgingBucket {
  supplierId: number;
  supplierName: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  over90: number;
  total: number;
}

// ── Purchase Return ──────────────────────────────────────────────────────────
export type ReturnStatus = "DRAFT" | "COMPLETED" | "CANCELLED";
export type RefundMethod = "DEDUCT_PAYABLE" | "CASH_REFUND";

export interface PurchaseReturn {
  id: number;
  returnCode: string;
  supplierId: number;
  branchId: number;
  purchaseOrderId?: number;
  returnDate: string;
  totalAmount: number;
  status: ReturnStatus;
  refundMethod?: RefundMethod;
  reason?: string;
  note?: string;
  stockReturned: boolean;
  payableAdjusted: boolean;
  createdAt: string;
  createdBy: string;
}
