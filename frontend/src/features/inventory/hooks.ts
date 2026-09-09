"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryApi } from "./api";
import type {
  ExportStockPayload,
  ImportStockPayload,
  InventoryHistoryParams,
  InventoryListParams,
  StockCountPayload,
  TransferStockPayload
} from "./types";

export function useInventoryStock(params: InventoryListParams) {
  return useQuery({
    queryKey: ["inventory", "stock", params],
    queryFn: () => inventoryApi.listStock(params)
  });
}

export function useInventoryHistory(params: InventoryHistoryParams) {
  return useQuery({
    queryKey: ["inventory", "history", params],
    queryFn: () => inventoryApi.listHistory(params)
  });
}

export function useImportStock() {
  return useInventoryMutation<ImportStockPayload>((payload) => inventoryApi.importStock(payload), "Da nhap kho");
}

export function useExportStock() {
  return useInventoryMutation<ExportStockPayload>((payload) => inventoryApi.exportStock(payload), "Da xuat kho");
}

export function useTransferStock() {
  return useInventoryMutation<TransferStockPayload>((payload) => inventoryApi.transferStock(payload), "Da chuyen kho");
}

export function useStockCount() {
  return useInventoryMutation<StockCountPayload>((payload) => inventoryApi.stockCount(payload), "Da cap nhat kiem kho");
}

function useInventoryMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<void>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the thuc hien thao tac")
  });
}

export function useInventoryStocks(params: {
  warehouseId?: number | "ALL";
  branchId?: number | "ALL";
  keyword?: string;
  page: number;
  size: number;
}) {
  return useQuery({
    queryKey: ["inventory", "stocks", params],
    queryFn: () => inventoryApi.getStocks(params),
    placeholderData: keepPreviousData
  });
}

export function useInventoryMovements(params: {
  branchId?: number | "ALL";
  type?: string;
  page: number;
  pageSize: number;
  keyword?: string;
}) {
  return useQuery({
    queryKey: ["inventory", "movements", params],
    queryFn: () => inventoryApi.getMovements(params),
    placeholderData: keepPreviousData
  });
}

export function useInventoryCounts(params: {
  branchId?: number | "ALL";
  status?: string;
  page: number;
  pageSize: number;
}) {
  return useQuery({
    queryKey: ["inventory", "counts", params],
    queryFn: () => inventoryApi.listCounts(params),
    placeholderData: keepPreviousData
  });
}

export function useCreateInventoryCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { branchId: number; warehouseId?: number; note?: string }) =>
      inventoryApi.createCount(data),
    onSuccess: () => {
      toast.success("Đã tạo phiếu kiểm kê");
      queryClient.invalidateQueries({ queryKey: ["inventory", "counts"] });
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : "Không thể tạo phiếu kiểm kê");
    }
  });
}

export function useConfirmInventoryCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: number; items: any[] }) =>
      inventoryApi.confirmCount(id, items),
    onSuccess: () => {
      toast.success("Xác nhận kiểm kê thành công, đã điều chỉnh tồn kho");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : "Không thể xác nhận kiểm kê");
    }
  });
}

export function useInventoryReceipts(params: {
  branchId?: number;
  warehouseId?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  receiptType?: string;
  keyword?: string;
  page: number;
  size: number;
}) {
  return useQuery({
    queryKey: ['inventory', 'receipts', params],
    queryFn: () => inventoryApi.listReceipts(params),
    placeholderData: keepPreviousData
  });
}

export function useInventoryIssues(params: {
  branchId?: number;
  warehouseId?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  issueType?: string;
  keyword?: string;
  page: number;
  size: number;
}) {
  return useQuery({
    queryKey: ['inventory', 'issues', params],
    queryFn: () => inventoryApi.listIssues(params),
    placeholderData: keepPreviousData
  });
}

export function useInventoryTransfers(params: {
  fromBranchId?: number;
  toBranchId?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  transferType?: string;
  keyword?: string;
  page: number;
  size: number;
}) {
  return useQuery({
    queryKey: ['inventory', 'transfers', params],
    queryFn: () => inventoryApi.listTransfers(params),
    placeholderData: keepPreviousData
  });
}

