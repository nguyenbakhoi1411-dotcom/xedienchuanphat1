import { api } from "@/lib/api/axios";
import type { InventoryStock, Warehouse } from "./types";

export type InventoryTransferStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED";

export type InventoryTransfer = {
  id: number;
  transferNo: string;
  status: InventoryTransferStatus;
  transferDate: string;
  fromBranchId: number;
  fromWarehouseId: number;
  fromWarehouseName: string;
  toBranchId: number;
  toWarehouseId: number;
  toWarehouseName: string;
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  serialId?: number | null;
  serialNumber?: string | null;
  note?: string | null;
  createdBy?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  approvedAt?: string | null;
};

export const inventoryTransferApi = {
  async list(): Promise<InventoryTransfer[]> {
    const response = await api.get<InventoryTransfer[]>("/api/inventory/transfers");
    return response.data;
  },
  async sources(): Promise<InventoryStock[]> {
    const response = await api.get<{ items: InventoryStock[] }>("/api/inventory/stocks", { params: { page: 0, pageSize: 200 } });
    return response.data.items;
  },
  async warehouses(): Promise<Warehouse[]> {
    const response = await api.get<{ items: Warehouse[] }>("/api/inventory/warehouses", { params: { page: 0, pageSize: 200 } });
    return response.data.items;
  },
  async createAndSubmit(payload: {
    fromBranchId: number;
    fromWarehouseId: number;
    toBranchId: number;
    toWarehouseId: number;
    productId: number;
    quantity: number;
    transactionDate: string;
    note?: string;
    serialId?: number;
  }): Promise<InventoryTransfer> {
    const response = await api.post<InventoryTransfer>("/api/inventory/transfer", payload);
    return response.data;
  },
  async approve(id: number): Promise<InventoryTransfer> {
    const response = await api.post<InventoryTransfer>(`/api/inventory/transfers/${id}/approve`);
    return response.data;
  },
  async reject(id: number, reason: string): Promise<InventoryTransfer> {
    const response = await api.post<InventoryTransfer>(`/api/inventory/transfers/${id}/reject`, { reason });
    return response.data;
  },
  async cancel(id: number): Promise<InventoryTransfer> {
    const response = await api.post<InventoryTransfer>(`/api/inventory/transfers/${id}/cancel`);
    return response.data;
  },
};
