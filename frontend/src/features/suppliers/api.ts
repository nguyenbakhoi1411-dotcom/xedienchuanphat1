import { api } from "@/lib/api/axios";
import type { PageResponse, PurchaseOrderPayload, PurchaseOrderResponse, Supplier, SupplierListParams, SupplierPayload } from "./types";

export const suppliersApi = {
  async list(params: SupplierListParams): Promise<PageResponse<Supplier>> {
    const response = await api.get<PageResponse<Supplier>>("/api/suppliers", {
      params: { keyword: params.keyword, page: Math.max(params.page - 1, 0), pageSize: params.pageSize }
    });
    return {
      ...response.data,
      page: response.data.page + 1,
      items: response.data.items.map(normalizeSupplier)
    };
  },

  async create(payload: SupplierPayload): Promise<Supplier> {
    const response = await api.post<Supplier>("/api/suppliers", payload);
    return normalizeSupplier(response.data);
  },

  async update(id: number, payload: SupplierPayload): Promise<Supplier> {
    const response = await api.put<Supplier>(`/api/suppliers/${id}`, payload);
    return normalizeSupplier(response.data);
  },

  async softDelete(id: number): Promise<void> {
    await api.delete(`/api/suppliers/${id}`);
  },

  async createPurchaseOrder(payload: PurchaseOrderPayload): Promise<PurchaseOrderResponse> {
    const response = await api.post<PurchaseOrderResponse>("/api/suppliers/purchase-orders", payload);
    return response.data;
  }
};

function normalizeSupplier(supplier: Supplier): Supplier {
  return {
    ...supplier,
    taxCode: supplier.taxCode ?? "",
    phone: supplier.phone ?? "",
    address: supplier.address ?? "",
    contactPerson: supplier.contactPerson ?? "",
    status: supplier.status ?? "ACTIVE",
    currentDebt: supplier.currentDebt ?? 0
  };
}

