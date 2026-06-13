"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesApi } from "./api";
import type { CreateInvoicePayload } from "./types";

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
    onSuccess: (invoice) => toast.success(`Da tao hoa don ${invoice.invoiceNo}`),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the tao hoa don")
  });
}

export function useSalesOrders(branchId?: number, page = 0, pageSize = 20) {
  return useQuery({
    queryKey: ["sales", "orders", branchId, page, pageSize],
    queryFn: () => salesApi.listOrders(branchId, page, pageSize),
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
    queryFn: () => salesApi.listQuotations(branchId, page, pageSize),
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
