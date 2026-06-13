import { api } from "@/lib/api/axios";
import type { AxiosResponse } from "axios";
import type {
  AgingBucket,
  Payable,
  PayableStatus,
  PurchaseOrder,
  PurchaseOrderRequest,
  PurchaseOrderStatus,
  PurchaseReturn,
  Supplier,
  SupplierGroup,
  SupplierRequest,
} from "./types";

interface PageResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const d = <T>(r: AxiosResponse<T>): T => r.data;

// ── Supplier Groups ──────────────────────────────────────────────────────────
export const supplierGroupApi = {
  list: (): Promise<SupplierGroup[]> =>
    api.get<SupplierGroup[]>("/supplier-groups").then(d),
};

// ── Suppliers ────────────────────────────────────────────────────────────────
export const supplierApi = {
  list: (keyword?: string, page = 0, size = 20): Promise<PageResponse<Supplier>> =>
    api.get<PageResponse<Supplier>>("/suppliers", { params: { keyword, page, size } }).then(d),

  get: (id: number): Promise<Supplier> =>
    api.get<Supplier>(`/suppliers/${id}`).then(d),

  create: (req: SupplierRequest): Promise<Supplier> =>
    api.post<Supplier>("/suppliers", req).then(d),

  update: (id: number, req: SupplierRequest): Promise<Supplier> =>
    api.put<Supplier>(`/suppliers/${id}`, req).then(d),

  deactivate: (id: number): Promise<Supplier> =>
    api.post<Supplier>(`/suppliers/${id}/deactivate`).then(d),
};

// ── Purchase Orders ───────────────────────────────────────────────────────────
export const purchaseOrderApi = {
  list: (params?: {
    branchId?: number;
    status?: PurchaseOrderStatus;
    supplierId?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<PurchaseOrder>> =>
    api.get<PageResponse<PurchaseOrder>>("/purchase-orders", {
      params: { ...params, page: params?.page ?? 0, size: params?.size ?? 20 },
    }).then(d),

  get: (id: number): Promise<PurchaseOrder> =>
    api.get<PurchaseOrder>(`/purchase-orders/${id}`).then(d),

  create: (req: PurchaseOrderRequest): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>("/purchase-orders", req).then(d),

  submit: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/submit`).then(d),

  approve: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/approve`).then(d),

  reject: (id: number, reason: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/reject`, null, { params: { reason } }).then(d),

  cancel: (id: number, reason: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`, null, { params: { reason } }).then(d),
};

// ── Payables ─────────────────────────────────────────────────────────────────
export const payableApi = {
  list: (params?: {
    branchId?: number;
    status?: PayableStatus;
    supplierId?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Payable>> =>
    api.get<PageResponse<Payable>>("/payables", {
      params: { ...params, page: params?.page ?? 0, size: params?.size ?? 20 },
    }).then(d),

  get: (id: number): Promise<Payable> =>
    api.get<Payable>(`/payables/${id}`).then(d),

  getOpenBySupplier: (supplierId: number): Promise<Payable[]> =>
    api.get<Payable[]>(`/payables/supplier/${supplierId}/open`).then(d),

  pay: (req: {
    payableId: number;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    bankRef?: string;
    note?: string;
  }): Promise<Payable> =>
    api.post<Payable>("/payables/pay", req).then(d),

  agingReport: (branchId?: number): Promise<AgingBucket[]> =>
    api.get<AgingBucket[]>("/payables/aging-report", { params: { branchId } }).then(d),
};

// ── Purchase Returns ──────────────────────────────────────────────────────────
export const purchaseReturnApi = {
  list: (branchId?: number, page = 0, size = 20): Promise<PageResponse<PurchaseReturn>> =>
    api.get<PageResponse<PurchaseReturn>>("/purchase-returns", { params: { branchId, page, size } }).then(d),

  get: (id: number): Promise<PurchaseReturn> =>
    api.get<PurchaseReturn>(`/purchase-returns/${id}`).then(d),

  create: (req: {
    supplierId: number;
    branchId: number;
    purchaseOrderId?: number;
    refundMethod?: string;
    reason?: string;
    note?: string;
    items: { productId: number; serialId?: number; quantity: number; unitPrice: number }[];
  }): Promise<PurchaseReturn> =>
    api.post<PurchaseReturn>("/purchase-returns", req).then(d),

  complete: (id: number): Promise<PurchaseReturn> =>
    api.post<PurchaseReturn>(`/purchase-returns/${id}/complete`).then(d),

  cancel: (id: number): Promise<PurchaseReturn> =>
    api.post<PurchaseReturn>(`/purchase-returns/${id}/cancel`).then(d),
};
