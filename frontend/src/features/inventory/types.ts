// ══════════════════════════════════════════════════════
// INVENTORY MODULE — Types (MISA AMIS chuẩn)
// ══════════════════════════════════════════════════════

// ── Tab types ──────────────────────────────────────────
export type InventoryTab =
  | "process"
  | "dashboard"
  | "receipts"
  | "issues"
  | "transfers"
  | "stocktake"
  | "costing"
  | "reports"
  | "products"
  | "warehouses"
  // legacy
  | "stock"
  | "import"
  | "transfer"
  | "history";

// ── Enums ─────────────────────────────────────────────
export type ReceiptStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type IssueStatus   = "DRAFT" | "ISSUED"    | "CANCELLED";
export type TransferStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type CountStatus   = "OPEN"  | "CLOSED"    | "CANCELLED";

export type ReceiptType =
  | "FROM_SUPPLIER"
  | "FROM_IMPORT"
  | "OTHER"
  | "FROM_TRANSFER"
  | "FROM_PRODUCTION"
  | "FROM_RETURN";

export type IssueType =
  | "SALE"
  | "WARRANTY"
  | "SERVICE"
  | "WRITE_OFF"
  | "OTHER";

export type TransferType =
  | "INTERNAL"
  | "CONSIGNMENT"
  | "INTERNAL_SAME_BRANCH";

export type ProductNature =
  | "GOODS"
  | "SERVICE"
  | "MATERIAL"
  | "FINISHED_GOOD"
  | "TOOL";

// ── Labels ─────────────────────────────────────────────
export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
  FROM_SUPPLIER:  "Mua hàng trong nước",
  FROM_IMPORT:    "Mua hàng nhập khẩu",
  OTHER:          "Khác (NVL thừa, HH thuê gia công...)",
  FROM_TRANSFER:  "Nhập từ chuyển kho nội bộ",
  FROM_PRODUCTION:"Nhập từ sản xuất",
  FROM_RETURN:    "Nhập hàng bán trả lại",
};

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  SALE:      "Bán hàng",
  WARRANTY:  "Bảo hành",
  SERVICE:   "Dịch vụ",
  WRITE_OFF: "Hủy/Xóa",
  OTHER:     "Khác",
};

export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  INTERNAL:             "Xuất kho kiểm vận chuyển nội bộ",
  CONSIGNMENT:          "Xuất kho gửi bán đại lý",
  INTERNAL_SAME_BRANCH: "Xuất chuyển kho nội bộ",
};

export const PRODUCT_NATURE_LABELS: Record<ProductNature, string> = {
  GOODS:         "Hàng hóa",
  SERVICE:       "Dịch vụ",
  MATERIAL:      "Nguyên vật liệu",
  FINISHED_GOOD: "Thành phẩm",
  TOOL:          "Công cụ dụng cụ",
};

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  DRAFT:     "Phiếu tạm",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  DRAFT:     "Phiếu tạm",
  ISSUED:    "Đã xuất kho",
  CANCELLED: "Đã hủy",
};

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  DRAFT:     "Phiếu tạm",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
};

// ── DTOs ──────────────────────────────────────────────

// Purchase Receipts (Nhập kho)
export interface PurchaseReceiptSummary {
  id: number;
  receiptNo: string;
  accountingDate: string;
  receiptDate: string;
  supplierName: string | null;
  objectName: string | null;
  objectAddress: string | null;
  totalAmount: number;
  receiptType: ReceiptType;
  status: ReceiptStatus;
  createdBy: string;
  branchId: number;
}

export interface PurchaseReceiptItem {
  id: number;
  productId: number | null;
  productCode: string;
  productName: string;
  warehouseId: number | null;
  warehouseName: string | null;
  debitAccount: string;
  creditAccount: string;
  variantSpec: string | null;
  unitOfMeasure: string | null;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  discountRate: number;
  discountAmount: number;
  purchaseCost: number;
  inventoryValue: number;
  lotNo: string | null;
  expiryDate: string | null;
}

export interface PurchaseReceiptDetail extends PurchaseReceiptSummary {
  objectCode: string | null;
  objectAddress: string | null;
  deliveryPerson: string | null;
  description: string | null;
  accountingDate: string;
  sourceTransferNo: string | null;
  referenceNo: string | null;
  documentCount: number;
  items: PurchaseReceiptItem[];
}

export interface CreatePurchaseReceiptPayload {
  supplierId?: number;
  branchId: number;
  receiptDate: string;
  reference?: string;
  note?: string;
  totalAmount?: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitCost?: number;
    lotNo?: string;
    expiryDate?: string;
    frameNumber?: string;
    engineNumber?: string;
  }>;
}

// Goods Issues (Xuất kho)
export interface GoodsIssueSummary {
  id: number;
  issueNo: string;
  accountingDate: string;
  description: string | null;
  totalAmount: number;
  totalCost: number;
  receiverName: string | null;
  customerName: string | null;
  objectName?: string | null;
  invoiceIssued: boolean;
  invoiceStatus: string | null;
  taxAuthorityCode: string | null;
  issueType: IssueType;
  status: IssueStatus;
  branchId: number;
}

export interface GoodsIssueItem {
  id: number;
  productId: number | null;
  productCode: string;
  productName: string;
  warehouseId: number | null;
  warehouseName: string | null;
  debitAccount: string;
  creditAccount: string;
  variantSpec: string | null;
  unitOfMeasure: string | null;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  lineTotal: number;
}

export interface GoodsIssueDetail extends GoodsIssueSummary {
  customerId: number | null;
  receiverAddress: string | null;
  salesPersonId: number | null;
  issueReason: string | null;
  salesOrderId: number | null;
  deliveryAddress: string | null;
  referenceNo: string | null;
  documentCount: number;
  items: GoodsIssueItem[];
}

export interface CreateGoodsIssuePayload {
  customerId?: number;
  branchId: number;
  issueDate: string;
  reference?: string;
  note?: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

// Inventory Transfers (Chuyển kho)
export interface InventoryTransferSummary {
  id: number;
  transferNo: string;
  transferDate: string;
  accountingDate: string | null;
  description: string | null;
  totalSaleAmount: number;
  totalCostAmount: number;
  carrierName: string | null;
  receivingUnitName: string | null;
  transferType: TransferType;
  status: TransferStatus;
  branchId: number;
}

export interface InventoryTransferItem {
  id: number;
  productId: number | null;
  productCode: string;
  productName: string;
  fromWarehouseId: number | null;
  fromWarehouseName: string | null;
  toWarehouseId: number | null;
  toWarehouseName: string | null;
  debitAccount: string | null;
  creditAccount: string | null;
  variantSpec: string | null;
  unitOfMeasure: string | null;
  quantity: number;
  saleUnitPrice: number;
  saleLineTotal: number;
  costUnitPrice: number;
  costLineTotal: number;
}

export interface InventoryTransferDetail extends InventoryTransferSummary {
  dispatchOrderNo: string | null;
  dispatchDate: string | null;
  dispatchBy: string | null;
  reason: string | null;
  receivingUnitCode: string | null;
  receivingUnitTax: string | null;
  carrierCode: string | null;
  carrierVehicle: string | null;
  carrierContract: string | null;
  voucherForm: string | null;
  voucherSerial: string | null;
  isReplacementInvoice: boolean;
  referenceNo: string | null;
  documentCount: number;
  fromWarehouseAddress: string | null;
  toWarehouseAddress: string | null;
  items: InventoryTransferItem[];
}

// Inventory Counts (Kiểm kê)
export interface InventoryCountSummary {
  id: number;
  countNo: string;
  countDate: string;
  countTime: string | null;
  warehouseName: string | null;
  countToDate: string | null;
  purpose: string | null;
  conclusion: string | null;
  isProcessed: boolean;
  status: CountStatus;
  branchId: number;
  branchName: string | null;
}

export interface InventoryCountItem {
  id: number;
  productId: number | null;
  productCode: string;
  productName: string;
  warehouseCode: string | null;
  unitOfMeasure: string | null;
  variantSpec: string | null;
  spec1: string | null;
  spec2: string | null;
  spec3: string | null;
  spec4: string | null;
  spec5: string | null;
  systemQuantity: number;
  countedQuantity: number;
  differenceQuantity: number;
  unitCost: number;
  systemValue: number;
  countedValue: number;
}

export interface InventoryCountDetail extends InventoryCountSummary {
  items: InventoryCountItem[];
}

// Products Catalog (Hàng hóa)
export interface ProductCatalogItem {
  id: number;
  productCode: string;
  productName: string;
  productNature: ProductNature;
  productGroup: string | null;
  taxReductionCode: string | null;
  unitOfMeasure: string | null;
  quantityOnHand: number;
  stockValue: number;
  minQuantity: number;
  description: string | null;
  defaultWarehouseName: string | null;
  inventoryAccountCode: string | null;
  averageCost: number;
}

export interface ProductCatalogSummary {
  totalSkus: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalStockValue: number;
}

// Dashboard / Stats
export interface InventoryStats {
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
  topStockItems: TopStockItem[];
  lowStockItems: LowStockItem[];
  inventoryTurnoverRate: number;
  avgStorageDays: number;
}

export interface TopStockItem {
  productCode: string;
  productName: string;
  quantity: number;
  stockValue: number;
}

export interface LowStockItem {
  productCode: string;
  productName: string;
  warehouseName: string;
  quantityOnHand: number;
  minQuantity: number;
}

// Reports
export interface StockSummaryRow {
  productCode: string;
  productName: string;
  productGroup: string | null;
  unit: string | null;
  openingQty: number;
  openingValue: number;
  importQty: number;
  importValue: number;
  exportQty: number;
  exportValue: number;
  closingQty: number;
  closingValue: number;
  unitCost: number;
}

export interface StockDetailRow {
  date: string;
  voucherNo: string;
  description: string;
  importQty: number;
  importValue: number;
  exportQty: number;
  exportValue: number;
  balanceQty: number;
  balanceValue: number;
}

// Legacy types kept for existing components
export type Branch = {
  id: number;
  name: string;
};

export type InventoryDTO = {
  san_pham_id: number;
  ton_kho_hien_tai: number;
  ton_kho_toi_thieu: number;
  gia_von_binh_quan: number;
  gia_tri_ton_kho: number;
  trang_thai_ton: string;
  ma_san_pham: string;
  ten_san_pham: string;
  don_vi_tinh: string;
  loai_san_pham: string;
};

export type InventorySummaryDTO = {
  tong_san_pham: number;
  tong_gia_tri_ton_kho: number;
  so_san_pham_het_hang: number;
  so_san_pham_sap_het: number;
};

export type InventoryTransactionType = "IMPORT" | "EXPORT" | "TRANSFER_IN" | "TRANSFER_OUT" | "STOCKTAKE" | "SALE" | "RETURN";

export type InventoryTransaction = {
  id: number;
  type: InventoryTransactionType;
  transactionNo: string;
  transactionDate: string;
  productCode: string;
  productName: string;
  fromBranchId?: number;
  toBranchId?: number;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  fromBranchName?: string;
  toBranchName?: string;
  quantity: number;
  note: string;
};

export type InventoryListParams = {
  keyword: string;
  branchId: "ALL" | number;
  warehouseId?: "ALL" | number;
  lowStockOnly: boolean;
  page: number;
  pageSize: number;
};

export type InventoryHistoryParams = {
  keyword: string;
  branchId: "ALL" | number;
  type: "ALL" | InventoryTransactionType;
  page: number;
  pageSize: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ImportStockPayload = {
  transactionNo: string;
  transactionDate: string;
  branchId: number;
  warehouseId?: number;
  productId: number;
  quantity: number;
  unitCost: number;
  note: string;
};

export type ExportStockPayload = {
  transactionNo: string;
  transactionDate: string;
  branchId: number;
  warehouseId?: number;
  productId: number;
  quantity: number;
  note: string;
};

export type TransferStockPayload = {
  transactionNo: string;
  transactionDate: string;
  fromBranchId: number;
  fromWarehouseId?: number;
  toBranchId: number;
  toWarehouseId?: number;
  productId: number;
  quantity: number;
  note: string;
};

export type StockCountPayload = {
  transactionNo: string;
  transactionDate: string;
  branchId: number;
  warehouseId?: number;
  productId: number;
  countedQuantity: number;
  note: string;
};
