// ─── Types cho module Mua hàng / Nhà cung cấp / Công nợ ──────────────────────

export type SupplierStatus = "ACTIVE" | "INACTIVE";
export type PaymentMethod = "CASH" | "BANK" | "BOTH";

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
  tenVietTat?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  tinhThanh?: string;
  contactPerson?: string;
  chucVuNguoiLH?: string;
  dienThoaiNguoiLH?: string;
  emailNguoiLH?: string;
  soTaiKhoanNH?: string;
  tenNganHang?: string;
  chiNhanhNH?: string;
  currentDebt: number;
  creditLimit: number;
  paymentTermsDays: number;
  phuongThucTT?: PaymentMethod;
  rating?: number;
  notes?: string;
  status: SupplierStatus;
  createdAt: string;
}

export interface SupplierRequest {
  code?: string;          // Optional — server tu sinh neu de trong
  name: string;
  groupId?: number;
  tenVietTat?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  tinhThanh?: string;
  contactPerson?: string;
  chucVuNguoiLH?: string;
  dienThoaiNguoiLH?: string;
  emailNguoiLH?: string;
  soTaiKhoanNH?: string;
  tenNganHang?: string;
  chiNhanhNH?: string;
  creditLimit?: number;
  paymentTermsDays?: number;
  phuongThucTT?: PaymentMethod;
  rating?: number;
  notes?: string;
}

// ── Purchase Order ──────────────────────────────────────────────────────────
export type PurchaseOrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED"
  | "REJECTED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
export type PaymentType = "CASH" | "BANK" | "DEBT";

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PARTIALLY_RECEIVED: "Nhập một phần",
  RECEIVED: "Đã nhập đủ",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
};

export const PO_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PARTIALLY_RECEIVED: "bg-violet-100 text-violet-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-800",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PARTIAL: "TT một phần",
  PAID: "Đã thanh toán",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  tenSanPham?: string;
  donViTinh?: string;
  quantity: number;
  soLuongDaNhan?: number;
  unitCost: number;
  chietKhauPhanTram?: number;
  thueGtgtPhanTram?: number;
  lineTotal: number;
  thuTu?: number;
}

export interface PurchaseOrder {
  id: number;
  purchaseOrderNo: string;
  supplierId: number;
  supplierName: string;
  supplierPhone?: string;
  branchId: number;
  status: PurchaseOrderStatus;
  statusLabel: string;
  purchaseDate: string;
  expectedDelivery?: string;
  tongTienHang: number;
  tongChietKhau: number;
  tongThueGtgt: number;
  totalAmount: number;
  paidAmount: number;
  conLaiPhaiTra: number;
  hinhThucTT?: PaymentType;
  hanThanhToan?: string;
  trangThaiThanhToan?: PaymentStatus;
  nguoiPhuTrach?: string;
  diaChiGiaoHang?: string;
  fileHoaDonNcc?: string;
  note?: string;
  createdBy?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectReason?: string;
  stockReceived: boolean;
  accountingRecorded: boolean;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
  chietKhauPhanTram?: number;
  thueGtgtPhanTram?: number;
  tenSanPham?: string;
  donViTinh?: string;
  thuTu?: number;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  branchId: number;
  purchaseDate?: string;
  expectedDelivery?: string;
  hinhThucTT?: PaymentType;
  paymentTermsDays?: number;
  nguoiPhuTrach?: string;
  diaChiGiaoHang?: string;
  note?: string;
  items: PurchaseOrderItemRequest[];
}

export interface PoPayRequest {
  amount: number;
  paymentMethod?: "CASH" | "BANK";
  note?: string;
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

// ── Purchase Request (Yêu cầu mua hàng) ──────────────────────────────────────
export type PurchaseRequestStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CONVERTED";
export type PurchaseRequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export const PR_STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CONVERTED: "Đã chuyển PO",
};

export const PR_STATUS_BADGE_TONE: Record<PurchaseRequestStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  CONVERTED: "bg-blue-100 text-blue-700 border-blue-200",
};

export interface PurchaseRequestItem {
  id: number;
  productId?: number;
  productName: string;
  quantity: number;
  unit?: string;
  estimatedPrice: number;
  note?: string;
}

export interface PurchaseRequest {
  id: number;
  prNo: string;
  prDate: string;
  requestedBy?: {
    id: number;
    username: string;
    fullName?: string;
  };
  department?: string;
  priority: PurchaseRequestPriority;
  reason?: string;
  expectedDate?: string;
  status: PurchaseRequestStatus;
  approvedBy?: {
    id: number;
    username: string;
    fullName?: string;
  };
  approvedAt?: string;
  rejectedReason?: string;
  branchId: number;
  createdAt?: string;
  items: PurchaseRequestItem[];
}

export interface APAgingRow {
  supplierId: number;
  supplierName: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  over90: number;
  total: number;
  details?: Payable[];
}

// ── GoodsReceipt ─────────────────────────────────────────────────────────────
export interface GoodsReceiptItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
  purchaseOrderItemId?: number;
  frameNumber?: string;
  engineNumber?: string;
  batterySerial?: string;
  note?: string;
}

export interface GoodsReceiptRequest {
  purchaseOrderId?: number;
  supplierId: number;
  branchId: number;
  receiptDate?: string;
  note?: string;
  items: GoodsReceiptItemRequest[];
}
