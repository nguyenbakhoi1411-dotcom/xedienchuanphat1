"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  purchaseRequestApi,
  purchaseOrderApi,
  payableApi,
  purchaseReceiptApi,
  supplierApi,
  supplierGroupApi,
  purchaseReturnApi,
} from "./api";
import type {
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  PayableStatus,
  SupplierRequest,
  PurchaseOrderRequest,
} from "./types";

// ── Purchase Requests ────────────────────────────────────────────────────────
export function usePurchaseRequests(params?: {
  status?: PurchaseRequestStatus;
  branchId?: number;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["purchasing", "requests", params],
    queryFn: () => purchaseRequestApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePurchaseRequest(id?: number) {
  return useQuery({
    queryKey: ["purchasing", "requests", "detail", id],
    queryFn: () => purchaseRequestApi.get(id as number),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ req, branchId }: { req: any; branchId: number }) =>
      purchaseRequestApi.create(req, branchId),
    onSuccess: (res) => {
      toast.success(`Đã tạo đề nghị mua hàng ${res.prNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể tạo đề nghị");
    },
  });
}

export function useUpdatePurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: any }) =>
      purchaseRequestApi.update(id, req),
    onSuccess: (res) => {
      toast.success(`Đã cập nhật đề nghị mua hàng ${res.prNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể cập nhật đề nghị");
    },
  });
}

export function useSubmitPurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseRequestApi.submit(id),
    onSuccess: (res) => {
      toast.success(`Đã gửi duyệt đề nghị mua hàng ${res.prNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể gửi duyệt đề nghị");
    },
  });
}

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseRequestApi.approve(id),
    onSuccess: (res) => {
      toast.success(`Đã duyệt đề nghị mua hàng ${res.prNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể duyệt đề nghị");
    },
  });
}

export function useRejectPurchaseRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      purchaseRequestApi.reject(id, reason),
    onSuccess: (res) => {
      toast.success(`Đã từ chối đề nghị mua hàng ${res.prNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể từ chối đề nghị");
    },
  });
}

export function useConvertToPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseRequestApi.convertToPO(id),
    onSuccess: (res) => {
      toast.success(`Đã chuyển đổi sang đơn mua hàng ${res.purchaseOrderNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể chuyển đổi sang đơn mua");
    },
  });
}

// ── Purchase Orders ──────────────────────────────────────────────────────────
export function usePurchaseOrders(params?: {
  branchId?: number;
  status?: PurchaseOrderStatus;
  supplierId?: number;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["purchasing", "orders", params],
    queryFn: () => purchaseOrderApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePurchaseOrder(id?: number) {
  return useQuery({
    queryKey: ["purchasing", "orders", "detail", id],
    queryFn: () => purchaseOrderApi.get(id as number),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: PurchaseOrderRequest) => purchaseOrderApi.create(req),
    onSuccess: (res) => {
      toast.success(`Đã tạo đơn mua hàng ${res.purchaseOrderNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể tạo đơn đặt hàng");
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrderApi.submit(id),
    onSuccess: (res) => {
      toast.success(`Đã gửi duyệt đơn mua hàng ${res.purchaseOrderNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể gửi duyệt đơn đặt hàng");
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseOrderApi.approve(id),
    onSuccess: (res) => {
      toast.success(`Đã duyệt đơn mua hàng ${res.purchaseOrderNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể duyệt đơn đặt hàng");
    },
  });
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      purchaseOrderApi.reject(id, reason),
    onSuccess: (res) => {
      toast.success(`Đã từ chối đơn mua hàng ${res.purchaseOrderNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể từ chối đơn đặt hàng");
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      purchaseOrderApi.cancel(id, reason),
    onSuccess: (res) => {
      toast.success(`Đã hủy đơn mua hàng ${res.purchaseOrderNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders", "detail", res.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể hủy đơn đặt hàng");
    },
  });
}

// ── Payables & AP Aging ──────────────────────────────────────────────────────
export function usePayables(params?: {
  branchId?: number;
  status?: PayableStatus;
  supplierId?: number;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ["purchasing", "payables", params],
    queryFn: () => payableApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePayable(id?: number) {
  return useQuery({
    queryKey: ["purchasing", "payables", "detail", id],
    queryFn: () => payableApi.get(id as number),
    enabled: Boolean(id),
  });
}

export function usePayPayable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: {
      payableId: number;
      amount: number;
      paymentDate?: string;
      paymentMethod?: string;
      bankRef?: string;
      note?: string;
    }) => payableApi.pay(req),
    onSuccess: (res) => {
      toast.success(`Thanh toán thành công ${res.payableCode}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "payables"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "ap-aging"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể thanh toán công nợ");
    },
  });
}

export function useAPAging(branchId?: number) {
  return useQuery({
    queryKey: ["purchasing", "ap-aging", branchId],
    queryFn: () => purchaseRequestApi.apAging(branchId),
    placeholderData: keepPreviousData,
  });
}

// ── Suppliers ────────────────────────────────────────────────────────────────
export function useSuppliers(keyword?: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ["purchasing", "suppliers", keyword, page, size],
    queryFn: () => supplierApi.list(keyword, page, size),
    placeholderData: keepPreviousData,
  });
}

export function useSupplierGroups() {
  return useQuery({
    queryKey: ["purchasing", "supplier-groups"],
    queryFn: () => supplierGroupApi.list(),
  });
}

export function useSupplier(id?: number) {
  return useQuery({
    queryKey: ["purchasing", "suppliers", "detail", id],
    queryFn: () => supplierApi.get(id as number),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: SupplierRequest) => supplierApi.create(req),
    onSuccess: () => {
      toast.success("Đã thêm nhà cung cấp");
      queryClient.invalidateQueries({ queryKey: ["purchasing", "suppliers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể tạo nhà cung cấp");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: SupplierRequest }) => supplierApi.update(id, req),
    onSuccess: () => {
      toast.success("Đã cập nhật nhà cung cấp");
      queryClient.invalidateQueries({ queryKey: ["purchasing", "suppliers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể cập nhật nhà cung cấp");
    },
  });
}

export function useDeactivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supplierApi.deactivate(id),
    onSuccess: (res) => {
      toast.success(`Đã ngưng nhà cung cấp ${res.name}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "suppliers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể ngưng NCC");
    },
  });
}

/** Bí danh cho useAPAging */
export const useAPAgingReport = (branchId?: number) => useAPAging(branchId);


// ── Purchase Receipts (GRN) ──────────────────────────────────────────────────
export function usePurchaseReceipts(params?: {
  branchId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["purchasing", "receipts", params],
    queryFn: () => purchaseReceiptApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePurchaseReceipt(id?: number) {
  return useQuery({
    queryKey: ["purchasing", "receipts", "detail", id],
    queryFn: () => purchaseReceiptApi.get(id as number),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: any) => purchaseReceiptApi.create(req),
    onSuccess: (res) => {
      toast.success(`Đã tạo phiếu nhập kho ${res.receiptNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể tạo phiếu nhập kho");
    },
  });
}

export function useConfirmPurchaseReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseReceiptApi.confirm(id),
    onSuccess: (res) => {
      toast.success(`Đã xác nhận nhập kho phiếu ${res.receiptNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "receipts"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "payables"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "ap-aging"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể xác nhận nhập kho");
    },
  });
}

export function useCancelPurchaseReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => purchaseReceiptApi.cancel(id),
    onSuccess: (res) => {
      toast.success(`Đã hủy phiếu nhập kho ${res.receiptNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "receipts"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể hủy phiếu nhập kho");
    },
  });
}

// ── Supplier Search (Autocomplete) ───────────────────────────────────────────
export function useSearchSuppliers(q: string) {
  return useQuery({
    queryKey: ["suppliers", "search", q],
    queryFn: () => supplierApi.search(q),
    enabled: true,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useActivateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supplierApi.activate(id),
    onSuccess: (res) => {
      toast.success(`Đã kích hoạt nhà cung cấp ${res.name}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "suppliers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể kích hoạt NCC");
    },
  });
}

// ── Overdue Payments ─────────────────────────────────────────────────────────
export function useOverduePayments(branchId?: number) {
  return useQuery({
    queryKey: ["purchasing", "purchase-orders", "overdue", branchId],
    queryFn: () => purchaseOrderApi.overdue(branchId),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // refresh moi 5 phut
  });
}

// ── Pay Purchase Order ───────────────────────────────────────────────────────
export function usePayPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      purchaseOrderApi.pay(id, { amount }),
    onSuccess: (res) => {
      toast.success(`Đã ghi nhận thanh toán đơn ${res.purchaseOrderNo}`);
      queryClient.invalidateQueries({ queryKey: ["purchasing", "purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "purchase-orders", "overdue"] });
      queryClient.invalidateQueries({ queryKey: ["purchasing", "suppliers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Không thể ghi nhận thanh toán");
    },
  });
}

// ── Purchase Returns ─────────────────────────────────────────────────────────
export function usePurchaseReturns(branchId?: number, page = 0, size = 20) {
  return useQuery({
    queryKey: ["purchasing", "returns", branchId, page, size],
    queryFn: () => purchaseReturnApi.list(branchId, page, size),
    placeholderData: keepPreviousData,
  });
}
