// features/warehouse/types.ts
// Types day du cho module kho hang

// ═══════════════════════════════════════════
// WAREHOUSE
// ═══════════════════════════════════════════
export type WarehouseType =
  | "MAIN" | "SERVICE" | "RETURN" | "DAMAGED"
  | "DISPLAY" | "WARRANTY_STORE" | "DEFECTIVE_STORE"
  | "STAGING" | "SPARE_PARTS";

export const WAREHOUSE_TYPE_LABELS: Record<WarehouseType, string> = {
  MAIN: "Kho chính",
  SERVICE: "Kho sửa chữa",
  RETURN: "Kho hoàn trả",
  DAMAGED: "Kho hàng hư",
  DISPLAY: "Kho trưng bày",
  WARRANTY_STORE: "Kho bảo hành",
  DEFECTIVE_STORE: "Kho hàng lỗi",
  STAGING: "Kho chờ xuất",
  SPARE_PARTS: "Kho phụ tùng",
};

export type Warehouse = {
  id: number;
  warehouseCode: string;
  warehouseName: string;
  branchId: number;
  type: WarehouseType;
  status: string;
  locationAisle?: string | null;
  locationShelf?: string | null;
  locationBin?: string | null;
  description?: string | null;
  createdAt: string;
};

// ═══════════════════════════════════════════
// INVENTORY STOCK
// ═══════════════════════════════════════════
export type InventoryStock = {
  id: number;
  branchId: number;
  warehouseId?: number | null;
  warehouseName?: string | null;
  productId: number;
  productName: string;
  productCode: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  minQuantity: number;
  averageCost: number;
};

// ═══════════════════════════════════════════
// PURCHASE RECEIPT (Phiếu nhập kho)
// ═══════════════════════════════════════════
export type ReceiptStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  DRAFT: "Nháp",
  CONFIRMED: "Đã nhập kho",
  CANCELLED: "Đã hủy",
};

export type PurchaseReceiptItem = {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  productCategory: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  frameNumber?: string | null;
  engineNumber?: string | null;
  batterySerial?: string | null;
  serialNumber?: string | null;
  note?: string | null;
};

export type PurchaseReceipt = {
  id: number;
  receiptNo: string;
  purchaseOrderId?: number | null;
  supplierId: number;
  supplierName: string;
  branchId: number;
  warehouseId?: number | null;
  warehouseName?: string | null;
  receiptDate: string;
  status: ReceiptStatus;
  totalAmount: number;
  note?: string | null;
  createdBy: string;
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  accountingRecorded: boolean;
  createdAt: string;
  items: PurchaseReceiptItem[];
};

export type CreateReceiptPayload = {
  purchaseOrderId?: number;
  supplierId: number;
  branchId: number;
  warehouseId?: number;
  receiptDate?: string;
  note?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitCost: number;
    frameNumber?: string;
    engineNumber?: string;
    batterySerial?: string;
    note?: string;
  }>;
};

// ═══════════════════════════════════════════
// GOODS ISSUE (Phiếu xuất kho)
// ═══════════════════════════════════════════
export type GoodsIssueType = "SALE" | "WARRANTY" | "SERVICE" | "TRANSFER" | "WRITE_OFF" | "OTHER";
export type GoodsIssueStatus = "DRAFT" | "ISSUED" | "CANCELLED";

export const GOODS_ISSUE_TYPE_LABELS: Record<GoodsIssueType, string> = {
  SALE: "Xuất bán hàng",
  WARRANTY: "Xuất bảo hành",
  SERVICE: "Xuất sửa chữa",
  TRANSFER: "Xuất chuyển kho",
  WRITE_OFF: "Xuất hủy",
  OTHER: "Xuất khác",
};

export const GOODS_ISSUE_TYPE_COLORS: Record<GoodsIssueType, string> = {
  SALE: "bg-blue-100 text-blue-700",
  WARRANTY: "bg-purple-100 text-purple-700",
  SERVICE: "bg-orange-100 text-orange-700",
  TRANSFER: "bg-indigo-100 text-indigo-700",
  WRITE_OFF: "bg-red-100 text-red-700",
  OTHER: "bg-slate-100 text-slate-600",
};

export type GoodsIssueItem = {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  serialId?: number | null;
  serialNumber?: string | null;
  note?: string | null;
};

export type GoodsIssue = {
  id: number;
  issueNo: string;
  branchId: number;
  warehouseId?: number | null;
  warehouseName?: string | null;
  issueDate: string;
  issueType: GoodsIssueType;
  issueTypeLabel: string;
  status: GoodsIssueStatus;
  referenceType?: string | null;
  referenceNo?: string | null;
  note?: string | null;
  createdBy: string;
  issuedBy?: string | null;
  issuedAt?: string | null;
  createdAt: string;
  totalValue: number;
  items: GoodsIssueItem[];
};

export type CreateGoodsIssuePayload = {
  branchId: number;
  warehouseId?: number;
  issueDate?: string;
  issueType: GoodsIssueType;
  referenceType?: string;
  referenceNo?: string;
  note?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitCost?: number;
    serialId?: number;
    note?: string;
  }>;
};

// ═══════════════════════════════════════════
// INVENTORY COUNT (Phiếu kiểm kê)
// ═══════════════════════════════════════════
export type InventoryCountStatus =
  | "DRAFT" | "COUNTING" | "PENDING_APPROVAL" | "APPROVED" | "CANCELLED";

export const COUNT_STATUS_LABELS: Record<InventoryCountStatus, string> = {
  DRAFT: "Nháp",
  COUNTING: "Đang kiểm",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  CANCELLED: "Đã hủy",
};

export const COUNT_STATUS_COLORS: Record<InventoryCountStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  COUNTING: "bg-amber-100 text-amber-700",
  PENDING_APPROVAL: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export type InventoryCountItem = {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  systemQuantity: number;
  countedQuantity: number | null;
  varianceQty: number;
  varianceReason?: string | null;
  adjustmentApplied: boolean;
  note?: string | null;
};

export type InventoryCount = {
  id: number;
  countNo: string;
  branchId: number;
  warehouseId?: number | null;
  warehouseName?: string | null;
  countDate: string;
  status: InventoryCountStatus;
  note?: string | null;
  createdBy: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  totalItems: number;
  itemsWithVariance: number;
  items: InventoryCountItem[];
};

export type CreateCountPayload = {
  branchId: number;
  warehouseId?: number;
  countDate?: string;
  note?: string;
  productIds?: number[];
};

export type SubmitCountItemPayload = {
  productId: number;
  countedQuantity: number;
  varianceReason?: string;
  note?: string;
};

// ═══════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════
export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
