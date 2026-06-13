import { api } from "@/lib/api/axios";
import type {
  CreateSerialPayload,
  PageResponse,
  ProductSerial,
  SerialHistoryEntry,
  SerialSearchParams,
  TransferSerialPayload,
  UpdateSerialStatusPayload,
} from "./types";

export const serialsApi = {
  async search(params: SerialSearchParams): Promise<PageResponse<ProductSerial>> {
    const response = await api.get<PageResponse<ProductSerial>>("/api/serials", { params });
    return response.data;
  },

  async lookup(q: string): Promise<ProductSerial> {
    const response = await api.get<ProductSerial>("/api/serials/lookup", { params: { q } });
    return response.data;
  },

  async get(id: number): Promise<ProductSerial> {
    const response = await api.get<ProductSerial>(`/api/serials/${id}`);
    return response.data;
  },

  async getHistory(id: number): Promise<SerialHistoryEntry[]> {
    const response = await api.get<SerialHistoryEntry[]>(`/api/serials/${id}/history`);
    return response.data;
  },

  async create(payload: CreateSerialPayload): Promise<ProductSerial> {
    const response = await api.post<ProductSerial>("/api/serials", payload);
    return response.data;
  },

  async updateStatus(id: number, payload: UpdateSerialStatusPayload): Promise<ProductSerial> {
    const response = await api.patch<ProductSerial>(`/api/serials/${id}/status`, payload);
    return response.data;
  },

  async transfer(id: number, payload: TransferSerialPayload): Promise<ProductSerial> {
    const response = await api.post<ProductSerial>(`/api/serials/${id}/transfer`, payload);
    return response.data;
  },

  async markDefective(id: number, reason?: string): Promise<ProductSerial> {
    const response = await api.post<ProductSerial>(`/api/serials/${id}/mark-defective`, { reason });
    return response.data;
  },

  async sendToWarranty(id: number, sourceDocumentType?: string, sourceDocumentId?: string): Promise<ProductSerial> {
    const response = await api.post<ProductSerial>(`/api/serials/${id}/send-to-warranty`, {
      sourceDocumentType: sourceDocumentType ?? "MANUAL",
      sourceDocumentId,
    });
    return response.data;
  },

  async sendToRepair(id: number, ticketNo?: string): Promise<ProductSerial> {
    const response = await api.post<ProductSerial>(`/api/serials/${id}/send-to-repair`, { ticketNo });
    return response.data;
  },

  async returnFromRepair(id: number, note?: string): Promise<ProductSerial> {
    const response = await api.post<ProductSerial>(`/api/serials/${id}/return-from-repair`, { note });
    return response.data;
  },
};
