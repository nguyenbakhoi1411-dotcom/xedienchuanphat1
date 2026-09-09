import { api } from "@/lib/api/axios";
import type {
  CashSummaryDto,
  CashReceiptDto,
  CashPaymentDto,
  CashLedgerDto,
  CreateReceiptRequest,
  CreatePaymentRequest,
  PageResponse,
  ReceiptType,
  PaymentType,
} from "./types";

export const cashApi = {
  async summary(date?: string): Promise<CashSummaryDto> {
    const res = await api.get<CashSummaryDto>("/api/cash/summary", { params: { date } });
    return res.data;
  },

  async receipts(params: {
    fromDate?: string;
    toDate?: string;
    type?: ReceiptType;
    keyword?: string;
    page: number;
    size: number;
  }): Promise<PageResponse<CashReceiptDto>> {
    const res = await api.get<PageResponse<CashReceiptDto>>("/api/cash/receipts", {
      params: { ...params, page: Math.max(params.page - 1, 0) },
    });
    return { ...res.data, page: res.data.page + 1 };
  },

  async createReceipt(req: CreateReceiptRequest): Promise<CashReceiptDto> {
    const res = await api.post<CashReceiptDto>("/api/cash/receipts", req);
    return res.data;
  },

  async confirmReceipt(id: number): Promise<void> {
    await api.put(`/api/cash/receipts/${id}/confirm`);
  },

  async cancelReceipt(id: number): Promise<void> {
    await api.delete(`/api/cash/receipts/${id}`);
  },

  async payments(params: {
    fromDate?: string;
    toDate?: string;
    type?: PaymentType;
    keyword?: string;
    page: number;
    size: number;
  }): Promise<PageResponse<CashPaymentDto>> {
    const res = await api.get<PageResponse<CashPaymentDto>>("/api/cash/payments", {
      params: { ...params, page: Math.max(params.page - 1, 0) },
    });
    return { ...res.data, page: res.data.page + 1 };
  },

  async createPayment(req: CreatePaymentRequest): Promise<CashPaymentDto> {
    const res = await api.post<CashPaymentDto>("/api/cash/payments", req);
    return res.data;
  },

  async confirmPayment(id: number): Promise<void> {
    await api.put(`/api/cash/payments/${id}/confirm`);
  },

  async cancelPayment(id: number): Promise<void> {
    await api.delete(`/api/cash/payments/${id}`);
  },

  async ledger(fromDate?: string, toDate?: string): Promise<CashLedgerDto> {
    const res = await api.get<CashLedgerDto>("/api/cash/ledger", {
      params: { fromDate, toDate },
    });
    return res.data;
  },
};
