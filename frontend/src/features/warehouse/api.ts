import { api } from "@/lib/api/axios";
import type {
  CreateCountPayload,
  CreateGoodsIssuePayload,
  CreateReceiptPayload,
  GoodsIssue,
  GoodsIssueType,
  InventoryCount,
  InventoryCountStatus,
  InventoryStock,
  PageResponse,
  PurchaseReceipt,
  ReceiptStatus,
  SubmitCountItemPayload,
  Warehouse,
} from "./types";

// ── Warehouses ────────────────────────────────────────
export const warehouseApi = {
  list: async (branchId?: number, page = 0, pageSize = 50): Promise<PageResponse<Warehouse>> => {
    const res = await api.get("/api/inventory/warehouses", { params: { branchId, page, pageSize } });
    return res.data;
  },
};

// ── Inventory Stock ────────────────────────────────────
export const stockApi = {
  list: async (branchId?: number, warehouseId?: number, page = 0, pageSize = 50): Promise<PageResponse<InventoryStock>> => {
    const res = await api.get("/api/inventory/stocks", { params: { branchId, warehouseId, page, pageSize } });
    return res.data;
  },
  lowStock: async (branchId?: number): Promise<PageResponse<InventoryStock>> => {
    const res = await api.get<PageResponse<InventoryStock>>("/api/inventory/stocks", { params: { branchId, page: 0, pageSize: 200 } });
    return {
      ...res.data,
      items: res.data.items.filter((item) => item.quantityOnHand <= item.minQuantity),
    };
  },
};

// ── Purchase Receipts ──────────────────────────────────
export const receiptApi = {
  list: async (branchId?: number, status?: ReceiptStatus, page = 0, pageSize = 30): Promise<PageResponse<PurchaseReceipt>> => {
    const res = await api.get("/api/inventory/receipts", { params: { branchId, status, page, pageSize } });
    return res.data;
  },
  get: async (id: number): Promise<PurchaseReceipt> => {
    const res = await api.get(`/api/inventory/receipts/${id}`);
    return res.data;
  },
  create: async (payload: CreateReceiptPayload): Promise<PurchaseReceipt> => {
    const res = await api.post("/api/inventory/receipts", payload);
    return res.data;
  },
  confirm: async (id: number): Promise<PurchaseReceipt> => {
    const res = await api.post(`/api/inventory/receipts/${id}/confirm`);
    return res.data;
  },
  cancel: async (id: number): Promise<PurchaseReceipt> => {
    const res = await api.post(`/api/inventory/receipts/${id}/cancel`);
    return res.data;
  },
};

// ── Goods Issues ───────────────────────────────────────
export const goodsIssueApi = {
  list: async (branchId?: number, status?: string, type?: GoodsIssueType, page = 0, pageSize = 30): Promise<PageResponse<GoodsIssue>> => {
    const res = await api.get("/api/inventory/goods-issues", { params: { branchId, status, type, page, pageSize } });
    return res.data;
  },
  get: async (id: number): Promise<GoodsIssue> => {
    const res = await api.get(`/api/inventory/goods-issues/${id}`);
    return res.data;
  },
  create: async (payload: CreateGoodsIssuePayload): Promise<GoodsIssue> => {
    const res = await api.post("/api/inventory/goods-issues", payload);
    return res.data;
  },
  issue: async (id: number): Promise<GoodsIssue> => {
    const res = await api.post(`/api/inventory/goods-issues/${id}/issue`);
    return res.data;
  },
  cancel: async (id: number): Promise<GoodsIssue> => {
    const res = await api.post(`/api/inventory/goods-issues/${id}/cancel`);
    return res.data;
  },
};

// ── Inventory Counts ───────────────────────────────────
export const inventoryCountApi = {
  list: async (branchId?: number, status?: InventoryCountStatus, page = 0, pageSize = 30): Promise<PageResponse<InventoryCount>> => {
    const res = await api.get("/api/inventory/counts", { params: { branchId, status, page, pageSize } });
    return res.data;
  },
  get: async (id: number): Promise<InventoryCount> => {
    const res = await api.get(`/api/inventory/counts/${id}`);
    return res.data;
  },
  create: async (payload: CreateCountPayload): Promise<InventoryCount> => {
    const res = await api.post("/api/inventory/counts", payload);
    return res.data;
  },
  start: async (id: number): Promise<InventoryCount> => {
    const res = await api.post(`/api/inventory/counts/${id}/start`);
    return res.data;
  },
  submitCounts: async (id: number, items: SubmitCountItemPayload[]): Promise<InventoryCount> => {
    const res = await api.post(`/api/inventory/counts/${id}/submit-counts`, items);
    return res.data;
  },
  requestApproval: async (id: number): Promise<InventoryCount> => {
    const res = await api.post(`/api/inventory/counts/${id}/request-approval`);
    return res.data;
  },
  approve: async (id: number): Promise<InventoryCount> => {
    const res = await api.post(`/api/inventory/counts/${id}/approve`);
    return res.data;
  },
  cancel: async (id: number): Promise<InventoryCount> => {
    const res = await api.post(`/api/inventory/counts/${id}/cancel`);
    return res.data;
  },
};
