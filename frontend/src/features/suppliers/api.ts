import { api } from "@/lib/api/axios";
import type { PageResponse, PurchaseOrderPayload, PurchaseOrderResponse, Supplier, SupplierListParams, SupplierPayload } from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

let suppliers: Supplier[] = [
  { id: 1, code: "NCC-001", name: "Cong ty TNHH Xe Dien Viet Nhat", taxCode: "0315000001", phone: "0908700001", address: "Binh Thanh, TP.HCM", contactPerson: "Nguyen Minh Khoa", status: "ACTIVE" },
  { id: 2, code: "NCC-002", name: "Nha phan phoi Pin LFP Sai Gon", taxCode: "0315000002", phone: "0908700002", address: "Thu Duc, TP.HCM", contactPerson: "Tran Thi Thanh", status: "ACTIVE" }
];

export const suppliersApi = {
  async list(params: SupplierListParams): Promise<PageResponse<Supplier>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<Supplier>>("/api/suppliers", {
        params: { keyword: params.keyword, page: Math.max(params.page - 1, 0), pageSize: params.pageSize }
      });
      return {
        ...response.data,
        page: response.data.page + 1,
        items: response.data.items.map(normalizeSupplier)
      };
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = suppliers
      .filter((item) => item.status !== "DELETED")
      .filter((item) => !keyword || [item.code, item.name, item.phone, item.taxCode, item.contactPerson].some((value) => value.toLowerCase().includes(keyword)));
    return paginate(filtered, params.page, params.pageSize);
  },

  async create(payload: SupplierPayload): Promise<Supplier> {
    if (!enableMock) {
      const response = await api.post<Supplier>("/api/suppliers", payload);
      return normalizeSupplier(response.data);
    }
    await wait();
    if (suppliers.some((item) => item.code.toLowerCase() === payload.code.toLowerCase())) {
      throw new Error("Ma nha cung cap da ton tai");
    }
    const supplier = { ...payload, id: Math.max(0, ...suppliers.map((item) => item.id)) + 1 };
    suppliers = [supplier, ...suppliers];
    return supplier;
  },

  async update(id: number, payload: SupplierPayload): Promise<Supplier> {
    if (!enableMock) {
      const response = await api.put<Supplier>(`/api/suppliers/${id}`, payload);
      return normalizeSupplier(response.data);
    }
    await wait();
    suppliers = suppliers.map((item) => (item.id === id ? { ...payload, id } : item));
    return { ...payload, id };
  },

  async softDelete(id: number): Promise<void> {
    if (!enableMock) {
      await api.delete(`/api/suppliers/${id}`);
      return;
    }
    await wait();
    suppliers = suppliers.map((item) => (item.id === id ? { ...item, status: "DELETED" } : item));
  },

  async createPurchaseOrder(payload: PurchaseOrderPayload): Promise<PurchaseOrderResponse> {
    if (!enableMock) {
      const response = await api.post<PurchaseOrderResponse>("/api/suppliers/purchase-orders", payload);
      return response.data;
    }
    await wait();
    const supplier = suppliers.find((item) => item.id === payload.supplierId);
    const totalAmount = payload.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    return {
      id: Date.now(),
      purchaseOrderNo: `PO-${Date.now().toString().slice(-8)}`,
      supplierId: payload.supplierId,
      supplierName: supplier?.name ?? "",
      branchId: payload.branchId,
      purchaseDate: payload.purchaseDate,
      totalAmount,
      paidAmount: payload.paidAmount,
      paymentStatus: payload.paidAmount <= 0 ? "UNPAID" : payload.paidAmount < totalAmount ? "PARTIAL" : "PAID"
    };
  }
};

function normalizeSupplier(supplier: Supplier): Supplier {
  return {
    ...supplier,
    taxCode: supplier.taxCode ?? "",
    phone: supplier.phone ?? "",
    address: supplier.address ?? "",
    contactPerson: supplier.contactPerson ?? "",
    status: supplier.status ?? "ACTIVE"
  };
}

function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, totalItems, totalPages };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}
