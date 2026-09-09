"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesApi } from "./api";
import type { ARAgingRow, ARBalance, CreateInvoicePayload } from "./types";

export function usePosProducts(keyword: string, branchId: number) {
  return useQuery({
    queryKey: ["pos", "products", keyword, branchId],
    queryFn: () => salesApi.searchProducts(keyword, branchId),
    enabled: branchId > 0,
    placeholderData: keepPreviousData
  });
}

export function usePosCustomers(keyword: string) {
  return useQuery({
    queryKey: ["pos", "customers", keyword],
    queryFn: () => salesApi.searchCustomers(keyword),
    placeholderData: keepPreviousData
  });
}

export function useCreateInvoice() {
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => salesApi.createInvoice(payload),
    onSuccess: (invoice) => toast.success(`Đã tạo hóa đơn ${invoice.invoiceNo}`),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Không thể tạo hóa đơn")
  });
}

export function useSalesOrders(params: {
  branchId?: number;
  page?: number;
  size?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  customerId?: string | number;
}) {
  const apiParams = {
    ...params,
    customerId: params.customerId === undefined ? undefined : Number(params.customerId),
  };

  return useQuery({
    queryKey: ["sales", "orders", params],
    queryFn: () => salesApi.listOrders(apiParams),
    placeholderData: keepPreviousData
  });
}

export function useSalesOrder(id?: number) {
  return useQuery({
    queryKey: ["sales", "orders", "detail", id],
    queryFn: () => salesApi.getOrder(id as number),
    enabled: Boolean(id)
  });
}

export function useQuotations(branchId?: number, page = 0, pageSize = 20) {
  return useQuery({
    queryKey: ["sales", "quotations", branchId, page, pageSize],
    queryFn: () => salesApi.listQuotations({ page, size: pageSize }),
    placeholderData: keepPreviousData
  });
}

export function useSalesReturns(branchId?: number, page = 0, pageSize = 20) {
  return useQuery({
    queryKey: ["sales", "returns", branchId, page, pageSize],
    queryFn: () => salesApi.listReturns(branchId, page, pageSize),
    placeholderData: keepPreviousData
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => salesApi.createQuotation(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
    }
  });
}

export function usePaymentHistory(orderId?: number) {
  return useQuery({
    queryKey: ["sales", "payments", orderId],
    queryFn: () => salesApi.paymentHistory(orderId as number),
    enabled: Boolean(orderId)
  });
}

export function useInstallments(orderId?: number) {
  return useQuery({
    queryKey: ["sales", "installments", orderId],
    queryFn: () => salesApi.installments(orderId as number),
    enabled: Boolean(orderId)
  });
}

export function useSalesDashboard(params: { branchId?: number; fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: ["sales", "dashboard", params],
    queryFn: () => salesApi.getSalesDashboard(params),
    placeholderData: keepPreviousData
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => salesApi.createOrder(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "dashboard"] });
      toast.success("Tạo đơn hàng thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Tạo đơn hàng thất bại");
    }
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => salesApi.updateOrder(id, data),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders", "detail", variables.id] });
      toast.success("Cập nhật đơn hàng thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật đơn hàng thất bại");
    }
  });
}

export function useConfirmOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salesApi.confirmOrder(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders", "detail", data.id] });
      toast.success("Xác nhận đơn hàng thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Xác nhận đơn hàng thất bại");
    }
  });
}

export function useDeliverOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salesApi.deliverOrder(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders", "detail", data.id] });
      toast.success("Xuất kho giao hàng thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Xuất kho giao hàng thất bại");
    }
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => salesApi.cancelOrder(id, reason),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders", "detail", data.id] });
      toast.success("Hủy đơn hàng thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Hủy đơn hàng thất bại");
    }
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => salesApi.createPayment(data),
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders", "detail", data.orderId] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "payments"] });
      await queryClient.invalidateQueries({ queryKey: ["sales", "ar-aging"] });
      toast.success("Ghi nhận thanh toán thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Thanh toán thất bại");
    }
  });
}

export function useARaging(params: { asOfDate?: string; branchId?: number }) {
  return useQuery({
    queryKey: ["sales", "ar-aging", params],
    queryFn: async (): Promise<ARAgingRow[]> => {
      const response = await salesApi.getARBalances({
        asOfDate: params.asOfDate,
        page: 0,
        size: 500
      });
      return response.content.map((row: ARBalance, index: number) => ({
        customerId: index + 1,
        customerName: row.customerName,
        total: row.remainingAmount,
        current: row.beforeDue0_30 + row.noDue,
        days1_30: row.overdue1_30,
        days31_60: row.overdue31_60,
        days61_90: row.overdue61_90,
        daysOver90: row.overdue91_120 + row.overdueOver120,
        invoices: []
      }));
    },
    placeholderData: keepPreviousData
  });
}
