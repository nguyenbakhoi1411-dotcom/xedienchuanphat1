import api from "@/lib/api/axios";
import type {
  ExportStockPayload,
  ImportStockPayload,
  InventoryHistoryParams,
  InventoryListParams,
  InventoryDTO,
  InventorySummaryDTO,
  InventoryTransaction,
  PageResponse,
  StockCountPayload,
  TransferStockPayload,
  PurchaseReceiptSummary,
  PurchaseReceiptDetail,
  CreatePurchaseReceiptPayload,
  GoodsIssueSummary,
  GoodsIssueDetail,
  CreateGoodsIssuePayload,
  InventoryTransferSummary,
  InventoryTransferDetail,
  InventoryCountSummary,
  InventoryCountDetail,
  ProductCatalogItem,
  ProductCatalogSummary,
  InventoryStats,
  StockSummaryRow,
  StockDetailRow,
} from "./types";

// Branch name cache populated lazily from /api/branches
const _branchCache = new Map<number, string>();

async function ensureBranchCache(): Promise<void> {
  if (_branchCache.size > 0) return;
  try {
    const res = await api.get<{ items: Array<{ id: number; name: string }> }>("/api/branches", {
      params: { page: 0, pageSize: 100 },
    });
    for (const b of res.data.items) _branchCache.set(b.id, b.name);
  } catch {
    // silently ignore — branchName() will fall back to id string
  }
}

export const inventoryApi = {
  // ── Legacy endpoints ──────────────────────────────────
  async listStock(params: InventoryListParams): Promise<PageResponse<InventoryDTO>> {
    const response = await api.get<PageResponse<InventoryDTO>>("/api/inventory/stocks", {
      params: {
        branchId: params.branchId === "ALL" ? undefined : params.branchId,
        warehouseId: params.warehouseId === "ALL" ? undefined : params.warehouseId,
        page: Math.max(params.page - 1, 0),
        pageSize: params.pageSize
      }
    });
    return {
      ...response.data,
      page: response.data.page + 1,
    };
  },

  async getSummary(): Promise<InventorySummaryDTO> {
    const response = await api.get<InventorySummaryDTO>("/api/inventory/summary");
    return response.data;
  },

  async listHistory(params: InventoryHistoryParams): Promise<PageResponse<InventoryTransaction>> {
    const response = await api.get<PageResponse<InventoryTransaction & { fromBranchId?: number; toBranchId?: number }>>("/api/inventory/transactions", {
      params: {
        branchId: params.branchId === "ALL" ? undefined : params.branchId,
        type: params.type === "ALL" ? undefined : params.type,
        page: Math.max(params.page - 1, 0),
        pageSize: params.pageSize
      }
    });
    const keyword = params.keyword.trim().toLowerCase();
    const items = response.data.items
      .map(normalizeTransaction)
      .filter((item) => {
        if (!keyword) return true;
        return item.productName.toLowerCase().includes(keyword) || item.productCode.toLowerCase().includes(keyword) || item.transactionNo.toLowerCase().includes(keyword);
      });
    return {
      ...response.data,
      page: response.data.page + 1,
      items
    };
  },

  async importStock(payload: ImportStockPayload): Promise<void> {
    await api.post("/api/inventory/import", {
      branchId: payload.branchId,
      warehouseId: payload.warehouseId,
      productId: payload.productId,
      quantity: payload.quantity,
      unitCost: payload.unitCost,
      transactionDate: payload.transactionDate,
      note: payload.note
    });
  },

  async exportStock(payload: ExportStockPayload): Promise<void> {
    await api.post("/api/inventory/export", {
      branchId: payload.branchId,
      warehouseId: payload.warehouseId,
      productId: payload.productId,
      quantity: payload.quantity,
      transactionDate: payload.transactionDate,
      note: payload.note
    });
  },

  async transferStock(payload: TransferStockPayload): Promise<void> {
    await api.post("/api/inventory/transfer", {
      fromBranchId: payload.fromBranchId,
      fromWarehouseId: payload.fromWarehouseId,
      toBranchId: payload.toBranchId,
      toWarehouseId: payload.toWarehouseId,
      productId: payload.productId,
      quantity: payload.quantity,
      transactionDate: payload.transactionDate,
      note: payload.note
    });
  },

  async stockCount(payload: StockCountPayload): Promise<void> {
    await api.post("/api/inventory/stocktake", {
      branchId: payload.branchId,
      warehouseId: payload.warehouseId,
      productId: payload.productId,
      countedQuantity: payload.countedQuantity,
      transactionDate: payload.transactionDate,
      note: payload.note
    });
  },

  async getStocks(params: {
    warehouseId?: number | "ALL";
    branchId?: number | "ALL";
    keyword?: string;
    page: number;
    size: number;
  }): Promise<PageResponse<InventoryDTO>> {
    const response = await api.get<PageResponse<InventoryDTO>>("/api/inventory/stocks", {
      params: {
        branchId: params.branchId === "ALL" ? undefined : params.branchId,
        warehouseId: params.warehouseId === "ALL" ? undefined : params.warehouseId,
        page: params.page,
        pageSize: params.size
      }
    });
    return response.data;
  },

  async getMovements(params: {
    branchId?: number | "ALL";
    type?: string;
    page: number;
    pageSize: number;
    keyword?: string;
  }): Promise<PageResponse<InventoryTransaction>> {
    const response = await api.get<PageResponse<InventoryTransaction>>("/api/inventory/movements", {
      params: {
        branchId: params.branchId === "ALL" ? undefined : params.branchId,
        type: params.type === "ALL" ? undefined : params.type,
        page: params.page,
        pageSize: params.pageSize
      }
    });
    return response.data;
  },

  // ── Inventory Counts ─────────────────────────────────
  async listCounts(params: {
    branchId?: number | "ALL";
    status?: string;
    page: number;
    pageSize: number;
  }): Promise<PageResponse<InventoryCountSummary>> {
    const response = await api.get<PageResponse<InventoryCountSummary>>("/api/inventory/v2/counts", {
      params: {
        branchId: params.branchId === "ALL" ? undefined : params.branchId,
        status: params.status === "ALL" ? undefined : params.status,
        page: params.page,
        pageSize: params.pageSize
      }
    });
    return response.data;
  },

  async getCountDetail(id: number): Promise<InventoryCountDetail> {
    const response = await api.get<InventoryCountDetail>(`/api/inventory/v2/counts/${id}`);
    return response.data;
  },

  async createCount(data: {
    branchId: number;
    warehouseId?: number;
    note?: string;
  }): Promise<InventoryCountDetail> {
    const response = await api.post<InventoryCountDetail>("/api/inventory/v2/counts", data);
    return response.data;
  },

  async confirmCount(id: number, items: {
    productId: number;
    countedQuantity: number;
    note?: string;
  }[]): Promise<InventoryCountDetail> {
    const response = await api.post<InventoryCountDetail>(`/api/inventory/v2/counts/${id}/confirm`, items);
    return response.data;
  },

  // ── Purchase Receipts (Nhập kho) ─────────────────────
  async listReceipts(params: {
    branchId?: number;
    warehouseId?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    receiptType?: string;
    keyword?: string;
    page: number;
    size: number;
  }): Promise<PageResponse<PurchaseReceiptSummary>> {
    const response = await api.get<PageResponse<PurchaseReceiptSummary>>("/api/inventory/v2/receipts", {
      params
    });
    return response.data;
  },

  async getReceiptDetail(id: number): Promise<PurchaseReceiptDetail> {
    const response = await api.get<PurchaseReceiptDetail>(`/api/inventory/v2/receipts/${id}`);
    return response.data;
  },

  async createReceipt(data: CreatePurchaseReceiptPayload): Promise<PurchaseReceiptDetail> {
    const response = await api.post<PurchaseReceiptDetail>("/api/inventory/v2/receipts", data);
    return response.data;
  },

  async updateReceipt(id: number, data: Partial<PurchaseReceiptDetail>): Promise<PurchaseReceiptDetail> {
    const response = await api.put<PurchaseReceiptDetail>(`/api/inventory/v2/receipts/${id}`, data);
    return response.data;
  },

  async confirmReceipt(id: number): Promise<PurchaseReceiptDetail> {
    const response = await api.post<PurchaseReceiptDetail>(`/api/inventory/v2/receipts/${id}/confirm`);
    return response.data;
  },

  async cancelReceipt(id: number): Promise<void> {
    await api.post(`/api/inventory/v2/receipts/${id}/cancel`);
  },

  // ── Goods Issues (Xuất kho) ───────────────────────────
  async listIssues(params: {
    branchId?: number;
    warehouseId?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    issueType?: string;
    keyword?: string;
    page: number;
    size: number;
  }): Promise<PageResponse<GoodsIssueSummary>> {
    const response = await api.get<PageResponse<GoodsIssueSummary>>("/api/inventory/v2/issues", {
      params
    });
    return response.data;
  },

  async getIssueDetail(id: number): Promise<GoodsIssueDetail> {
    const response = await api.get<GoodsIssueDetail>(`/api/inventory/v2/issues/${id}`);
    return response.data;
  },

  async createIssue(data: CreateGoodsIssuePayload): Promise<GoodsIssueDetail> {
    const response = await api.post<GoodsIssueDetail>("/api/inventory/v2/issues", data);
    return response.data;
  },

  async updateIssue(id: number, data: Partial<GoodsIssueDetail>): Promise<GoodsIssueDetail> {
    const response = await api.put<GoodsIssueDetail>(`/api/inventory/v2/issues/${id}`, data);
    return response.data;
  },

  async confirmIssue(id: number): Promise<GoodsIssueDetail> {
    const response = await api.post<GoodsIssueDetail>(`/api/inventory/v2/issues/${id}/issue`);
    return response.data;
  },

  async cancelIssue(id: number): Promise<void> {
    await api.post(`/api/inventory/v2/issues/${id}/cancel`);
  },

  // ── Inventory Transfers (Chuyển kho) ──────────────────
  async listTransfers(params: {
    fromBranchId?: number;
    toBranchId?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
    transferType?: string;
    keyword?: string;
    page: number;
    size: number;
  }): Promise<PageResponse<InventoryTransferSummary>> {
    const response = await api.get<PageResponse<InventoryTransferSummary>>("/api/inventory/v2/transfers", {
      params
    });
    return response.data;
  },

  async getTransferDetail(id: number): Promise<InventoryTransferDetail> {
    const response = await api.get<InventoryTransferDetail>(`/api/inventory/v2/transfers/${id}`);
    return response.data;
  },

  async createTransfer(data: Partial<InventoryTransferDetail>): Promise<InventoryTransferDetail> {
    const response = await api.post<InventoryTransferDetail>("/api/inventory/v2/transfers", data);
    return response.data;
  },

  async confirmTransfer(id: number): Promise<InventoryTransferDetail> {
    const response = await api.post<InventoryTransferDetail>(`/api/inventory/v2/transfers/${id}/approve`);
    return response.data;
  },

  async cancelTransfer(id: number): Promise<void> {
    await api.post(`/api/inventory/v2/transfers/${id}/cancel`);
  },

  // ── Product Catalog (Hàng hóa) ────────────────────────
  async listProducts(params: {
    productGroup?: string;
    productNature?: string;
    warehouseId?: number;
    keyword?: string;
    hasStock?: boolean;
    lowStock?: boolean;
    outOfStock?: boolean;
    page: number;
    size: number;
  }): Promise<PageResponse<ProductCatalogItem>> {
    const response = await api.get<PageResponse<ProductCatalogItem>>("/api/inventory/v2/products", {
      params
    });
    return response.data;
  },

  async getProductSummary(): Promise<ProductCatalogSummary> {
    const response = await api.get<ProductCatalogSummary>("/api/inventory/v2/products/summary");
    return response.data;
  },

  async getProductGroups(): Promise<string[]> {
    const response = await api.get<string[]>("/api/inventory/v2/products/groups");
    return response.data;
  },

  // ── Dashboard Stats ───────────────────────────────────
  async getStats(params: { branchId?: number; asOfDate?: string }): Promise<InventoryStats> {
    const response = await api.get<InventoryStats>("/api/inventory/v2/stats", { params });
    return response.data;
  },

  // ── Reports ───────────────────────────────────────────
  async getStockSummaryReport(params: {
    branchId?: number;
    warehouseId?: number;
    asOfDate?: string;
    productGroup?: string;
    keyword?: string;
  }): Promise<StockSummaryRow[]> {
    const response = await api.get<StockSummaryRow[]>("/api/inventory/v2/reports/stock-summary", { params });
    return response.data;
  },

  async getStockDetailReport(params: {
    branchId?: number;
    warehouseId?: number;
    productId?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ openingBalance: number; transactions: StockDetailRow[]; closingBalance: number }> {
    const response = await api.get<{ openingBalance: number; transactions: StockDetailRow[]; closingBalance: number }>(
      "/api/inventory/v2/reports/stock-detail",
      { params }
    );
    return response.data;
  },

  // ── Warehouses ────────────────────────────────────────
  async listWarehouses(params: {
    branchId?: number;
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Promise<{ items: unknown[]; totalItems: number; totalPages: number }> {
    const response = await api.get<{ items: unknown[]; totalItems: number; totalPages: number }>(
      "/api/inventory/v2/warehouses",
      { params }
    );
    return response.data;
  },
};

// ── Normalizers ──

function normalizeTransaction(transaction: InventoryTransaction): InventoryTransaction {
  return {
    ...transaction,
    productCode: transaction.productCode ?? String(transaction.productName ?? transaction.id),
    fromBranchName: transaction.fromBranchId ? branchName(transaction.fromBranchId) : transaction.fromBranchName,
    toBranchName: transaction.toBranchId ? branchName(transaction.toBranchId) : transaction.toBranchName,
    note: transaction.note ?? ""
  };
}

function branchName(branchId: number) {
  return _branchCache.get(branchId) ?? String(branchId);
}
