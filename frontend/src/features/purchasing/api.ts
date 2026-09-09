import api from "@/lib/api/axios";
import type { AxiosResponse } from "axios";
import type {
  AgingBucket,
  GoodsReceiptRequest,
  Payable,
  PayableStatus,
  PoPayRequest,
  PurchaseOrder,
  PurchaseOrderRequest,
  PurchaseOrderStatus,
  PurchaseReturn,
  PurchaseRequest,
  PurchaseRequestStatus,
  Supplier,
  SupplierGroup,
  SupplierRequest,
  APAgingRow,
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
    api.get<SupplierGroup[]>("/api/supplier-groups").then(d),
};

// ── Suppliers ────────────────────────────────────────────────────────────────
export const supplierApi = {
  list: (keyword?: string, page = 0, size = 20): Promise<PageResponse<Supplier>> =>
    api.get<PageResponse<Supplier>>("/api/suppliers", { params: { keyword, page, size } }).then(d),

  search: (q: string): Promise<Supplier[]> =>
    api.get<Supplier[]>("/api/suppliers/search", { params: { q } }).then(d),

  get: (id: number): Promise<Supplier> =>
    api.get<Supplier>(`/api/suppliers/${id}`).then(d),

  create: (req: SupplierRequest): Promise<Supplier> =>
    api.post<Supplier>("/api/suppliers", req).then(d),

  update: (id: number, req: SupplierRequest): Promise<Supplier> =>
    api.put<Supplier>(`/api/suppliers/${id}`, req).then(d),

  deactivate: (id: number): Promise<Supplier> =>
    api.post<Supplier>(`/api/suppliers/${id}/deactivate`).then(d),

  activate: (id: number): Promise<Supplier> =>
    api.post<Supplier>(`/api/suppliers/${id}/activate`).then(d),
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
    api.get<PageResponse<PurchaseOrder>>("/api/purchase-orders", {
      params: { ...params, page: params?.page ?? 0, size: params?.size ?? 20 },
    }).then(d),

  get: (id: number): Promise<PurchaseOrder> =>
    api.get<PurchaseOrder>(`/api/purchase-orders/${id}`).then(d),

  /** Don mua qua han thanh toan */
  overdue: (branchId?: number): Promise<PurchaseOrder[]> =>
    api.get<PurchaseOrder[]>("/api/purchase-orders/overdue", { params: { branchId } }).then(d),

  create: (req: PurchaseOrderRequest): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>("/api/purchase-orders", req).then(d),

  submit: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/purchase-orders/${id}/submit`).then(d),

  approve: (id: number): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/purchase-orders/${id}/approve`).then(d),

  reject: (id: number, reason: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/purchase-orders/${id}/reject`, null, { params: { reason } }).then(d),

  cancel: (id: number, reason: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/purchase-orders/${id}/cancel`, null, { params: { reason } }).then(d),

  /** Ghi nhan thanh toan NCC truc tiep tu don mua */
  pay: (id: number, req: PoPayRequest): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/api/purchase-orders/${id}/pay`, req).then(d),
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
    api.get<PageResponse<Payable>>("/api/payables", {
      params: { ...params, page: params?.page ?? 0, size: params?.size ?? 20 },
    }).then(d),

  get: (id: number): Promise<Payable> =>
    api.get<Payable>(`/api/payables/${id}`).then(d),

  getOpenBySupplier: (supplierId: number): Promise<Payable[]> =>
    api.get<Payable[]>(`/api/payables/supplier/${supplierId}/open`).then(d),

  pay: (req: {
    payableId: number;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    bankRef?: string;
    note?: string;
  }): Promise<Payable> =>
    api.post<Payable>("/api/payables/pay", req).then(d),

  agingReport: (branchId?: number): Promise<AgingBucket[]> =>
    api.get<AgingBucket[]>("/api/payables/aging-report", { params: { branchId } }).then(d),
};

// ── Purchase Returns ──────────────────────────────────────────────────────────
export const purchaseReturnApi = {
  list: (branchId?: number, page = 0, size = 20): Promise<PageResponse<PurchaseReturn>> =>
    api.get<any>("/api/purchase-returns", { params: { branchId, page, size } }).then((r) => {
      const data = r.data;
      return {
        items: data.content || [],
        totalItems: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        page: data.number || 0,
        pageSize: data.size || 20,
      };
    }),

  get: (id: number): Promise<PurchaseReturn> =>
    api.get<PurchaseReturn>(`/api/purchase-returns/${id}`).then(d),

  create: (req: {
    supplierId: number;
    branchId: number;
    purchaseOrderId?: number;
    refundMethod?: string;
    reason?: string;
    note?: string;
    items: { productId: number; serialId?: number; quantity: number; unitPrice: number }[];
  }): Promise<PurchaseReturn> =>
    api.post<PurchaseReturn>("/api/purchase-returns", req).then(d),

  complete: (id: number): Promise<PurchaseReturn> =>
    api.post<PurchaseReturn>(`/api/purchase-returns/${id}/complete`).then(d),

  cancel: (id: number): Promise<PurchaseReturn> =>
    api.post<PurchaseReturn>(`/api/purchase-returns/${id}/cancel`).then(d),
};

// ── Purchase Requests ────────────────────────────────────────────────────────
export const purchaseRequestApi = {
  list: (params?: {
    status?: PurchaseRequestStatus;
    branchId?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<PurchaseRequest>> =>
    api.get<PageResponse<PurchaseRequest>>("/api/v1/purchasing/requests", {
      params: { ...params, page: params?.page ?? 0, size: params?.size ?? 20 },
    }).then(d),

  get: (id: number): Promise<PurchaseRequest> =>
    api.get<PurchaseRequest>(`/api/v1/purchasing/requests/${id}`).then(d),

  create: (req: any, branchId: number): Promise<PurchaseRequest> =>
    api.post<PurchaseRequest>("/api/v1/purchasing/requests", req, { params: { branchId } }).then(d),

  update: (id: number, req: any): Promise<PurchaseRequest> =>
    api.put<PurchaseRequest>(`/api/v1/purchasing/requests/${id}`, req).then(d),

  submit: (id: number): Promise<PurchaseRequest> =>
    api.post<PurchaseRequest>(`/api/v1/purchasing/requests/${id}/submit`).then(d),

  approve: (id: number): Promise<PurchaseRequest> =>
    api.post<PurchaseRequest>(`/api/v1/purchasing/requests/${id}/approve`).then(d),

  reject: (id: number, reason: string): Promise<PurchaseRequest> =>
    api.post<PurchaseRequest>(`/api/v1/purchasing/requests/${id}/reject`, { reason }).then(d),

  convertToPO: (id: number): Promise<{ id: number; purchaseOrderNo: string }> =>
    api.post<{ id: number; purchaseOrderNo: string }>(`/api/v1/purchasing/requests/${id}/convert-to-po`).then(d),

  apAging: (branchId?: number): Promise<APAgingRow[]> =>
    api.get<APAgingRow[]>("/api/v1/purchasing/ap-aging", { params: { branchId } }).then(d),
};

// ── Purchase Receipts (Goods Receipt Note - GRN) ─────────────────────────────
export const purchaseReceiptApi = {
  list: (params?: {
    branchId?: number;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PageResponse<any>> =>
    api.get<PageResponse<any>>("/api/inventory/receipts", {
      params: { ...params, page: params?.page ?? 0, pageSize: params?.pageSize ?? 30 },
    }).then(d),

  get: (id: number): Promise<any> =>
    api.get<any>(`/api/inventory/receipts/${id}`).then(d),

  create: (req: GoodsReceiptRequest): Promise<any> =>
    api.post<any>("/api/inventory/receipts", req).then(d),

  confirm: (id: number): Promise<any> =>
    api.post<any>(`/api/inventory/receipts/${id}/confirm`).then(d),

  cancel: (id: number): Promise<any> =>
    api.post<any>(`/api/inventory/receipts/${id}/cancel`).then(d),
};
