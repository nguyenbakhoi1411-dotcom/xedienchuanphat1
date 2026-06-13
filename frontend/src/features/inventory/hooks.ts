"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
