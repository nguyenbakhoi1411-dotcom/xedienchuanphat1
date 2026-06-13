export type InventoryTab = "stock" | "import" | "transfer" | "history";

export type Branch = {
  id: number;
  name: string;
};

export type InventoryStock = {
  id: number;
  branchId: number;
  branchName: string;
  warehouseId?: number;
  warehouseName?: string;
  productId: number;
  productCode: string;
  productName: string;
  category: string;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  maxQuantity: number;
  averageCost: number;
  updatedAt: string;
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
